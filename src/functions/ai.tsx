import { sessionMiddleware } from "#/middleware/authentication.tsx";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCollectionsOfUser } from "./knowledge";
import { serverEnv } from "#/env/serverEnv.ts";

const FREE_MODEL_FALLBACKS: string[] = [
    "space-bunny-free",
    "deepseek-v4-flash-free",
];

const attachmentSchema = z.object({
    id: z.string(),
    type: z.enum(["image", "file", "document", "collection"]),
    name: z.string(),
    url: z.string().optional(),
    mimeType: z.string().optional(),
});

const processRecallConversationParamSchema = z.object({
    globalContext: z.array(attachmentSchema).optional().default([]),
    messages: z.array(
        z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
            attachments: z.array(attachmentSchema).optional().default([]),
        })
    ),
});

const assistantResponseSchema = z.object({
    headline: z.string().catch("Recall Result"),
    details: z.string(),
    resolutionStatus: z
        .enum(["resolved", "partly_resolved", "unresolved"])
        .catch("partly_resolved"),
});

function parseModelJson(
    rawText: string
): z.infer<typeof assistantResponseSchema> {

    const withoutThink = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    const jsonMatch = withoutThink.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);

            return assistantResponseSchema.parse(parsed);
        } catch {

        }
    }

    return {
        headline: "Recall Result",
        details: withoutThink || "No details returned by the model.",
        resolutionStatus: "partly_resolved",
    };
}

function sanitizeMessages(
    messages: Array<{
        role: "user" | "assistant";
        content: string;
        attachments?: z.infer<typeof attachmentSchema>[];
    }>,
    systemInstruction: string
): Array<{ role: "user" | "assistant"; content: string }> {

    const validMessages = messages.filter(
        (message) => !(message.role === "assistant" && (message.content.startsWith("Recall Failed") || message.content.includes("No details returned by the model.")))
    );

    const merged: Array<{ role: "user" | "assistant"; content: string }> = [];

    for (const message of validMessages) {
        let content = message.content.trim();

        if (message.role === "user" && message.attachments && message.attachments.length > 0) {
            const attachmentNote = message.attachments
                .map((attachment) => `[Attached ${attachment.type}: ${attachment.name}${attachment.url ? ` (${attachment.url})` : ""}]`)
                .join(" ");

            content = `${content}\n\n${attachmentNote}`;
        }

        if (!content) continue;

        const previous = merged[merged.length - 1];

        if (previous && previous.role === message.role) {
            previous.content = `${previous.content}\n\n${content}`;
        } else {
            merged.push({ role: message.role, content });
        }
    }

    if (merged.length === 0) {
        return [{ role: "user", content: systemInstruction }];
    }

    if (merged[0].role === "assistant") {
        merged.shift();
    }

    if (merged.length > 0) {
        merged[0] = {
            role: "user",
            content: `${systemInstruction}\n\n---\nUser Prompt:\n${merged[0].content}`,
        };
    }

    return merged;
}


async function requestCompletion(params: {
    baseUrl?: string;
    apiKey: string;
    model: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<string> {
    const endpoint = params.baseUrl ?? "https://openrouter.ai/api/v1/chat/completions";

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${params.apiKey}`,
        },
        body: JSON.stringify({
            model: params.model,
            messages: params.messages,
            stream: false,
        }),
    });

    const rawBody = await response.text();
    let json: any;

    try {
        json = JSON.parse(rawBody);
    } catch {
        throw new Error(`HTTP ${response.status} from ${endpoint}: ${rawBody.slice(0, 200)}`);
    }

    if (!response.ok || json?.error) {
        const errMsg =
            json?.error?.metadata?.raw ||
            json?.error?.message ||
            json?.message ||
            rawBody.slice(0, 200);

        throw new Error(`HTTP ${response.status} (${params.model}): ${errMsg}`);
    }

    const content = json?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
        throw new Error(`Empty response content from model ${params.model}`);
    }

    return content;
}

export const processRecallConversation = createServerFn({ method: "POST" })
    .middleware([sessionMiddleware])
    .validator(processRecallConversationParamSchema)
    .handler(async ({ data, context }) => {
        if (!context.session?.user.id) {
            throw new Error("Unauthorized");
        }

        const userId = context.session.user.id;

        const allCollections = await getCollectionsOfUser({
            data: {
                userId,
            },
        });

        const pinnedCollectionIds = new Set(
            [...data.globalContext, ...data.messages.flatMap((message) => message.attachments ?? [])]
                .filter((attribute) => attribute.type === "collection")
                .map((attribute) => attribute.id)
        );

        const targetCollections = pinnedCollectionIds.size > 0
            ? allCollections.filter((collection) => pinnedCollectionIds.has(collection.id))
            : allCollections;

        const leanCollections = targetCollections.map((item) => {
            const { id, version, visibility, assets, ...rest } = item;

            const necessaryAsset = assets.map((asset) => {
                const {
                    collectionId,
                    createdAt,
                    updatedAt,
                    userId: _userId,
                    version: _version,
                    id: _id,
                    ...assetRest
                } = asset;

                return assetRest;
            });

            return {
                ...rest,
                assets: necessaryAsset,
            };
        });

        const noneCollectionGlobalAttachments = data.globalContext.filter((attachment) => attachment.type !== "collection");

        const systemPrompt = `
        Please, use the following knowledge context and respond accordingly:

        ${JSON.stringify(leanCollections)}

        ${noneCollectionGlobalAttachments.length > 0
                ? `Additional Global Context Attachments:\n${JSON.stringify(noneCollectionGlobalAttachments)}`
                : ""
            }

        Respond ONLY with a valid raw JSON object (no markdown formatting, no code blocks, no extra text) matching the exact structure:
        {
            "headline": "Short summary title",
            "details": "Detailed answer based on context",
            "resolutionStatus": "resolved" | "partly_resolved" | "unresolved"
        }
        `.trim();

        const safeMessages = sanitizeMessages(data.messages, systemPrompt);
        let lastError: unknown = null;

        for (const modelId of FREE_MODEL_FALLBACKS) {
            try {
                const rawText = await requestCompletion({
                    baseUrl: serverEnv.LLM_BASE_URL,
                    apiKey: serverEnv.LLM_API_KEY,
                    model: modelId,
                    messages: safeMessages,
                });

                return parseModelJson(rawText);
            } catch (error) {
                console.warn(`Model ${modelId} failed, trying next fallback...`, error);
                lastError = error;
            }
        }

        throw lastError instanceof Error
            ? lastError
            : new Error("All configured models failed to respond.");
    });