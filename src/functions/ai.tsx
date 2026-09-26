import { sessionMiddleware } from "#/middleware/authentication.tsx";
import { chat } from "@tanstack/ai";
import { createOpenRouterText, openRouterText } from "@tanstack/ai-openrouter";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCollectionsOfUser } from "./knowledge";
import { serverEnv } from "#/env/serverEnv.ts";

type OpenRouterModelId = Parameters<typeof createOpenRouterText>[0];

const FREE_MODEL_FALLBACKS: OpenRouterModelId[] = [
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free" as OpenRouterModelId,
    "dots-studio/dots-3-note-preview:free" as OpenRouterModelId,
    "respan/span-01-lite:free" as OpenRouterModelId,
    "poolside/laguna-xs-2.1:free" as OpenRouterModelId,
    "liquid/lfm-2.5-embedding-350m:free" as OpenRouterModelId,

];

const attachmentSchema = z.object({
    id: z.string(),
    type: z.enum(["image", "file", "document", "collection"]),
    name: z.string(),
    url: z.string().optional(),
    mimeType: z.string().optional()
})

const processRecallConversationParamSchema = z.object({
    globalContext: z.array(attachmentSchema).optional().default([]),
    messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        attachments: z.array(attachmentSchema).optional().default([])
    })),
})

const assistantResponseSchema = z.object({
    headline: z.string().catch("Recall Result"),
    details: z.string(),
    resolutionStatus: z.enum(["resolved", "partly_resolved", "unresolved"]).catch("partly_resolved")
})

function parseModelJson(rawText: string): z.infer<typeof assistantResponseSchema> {
    const withoutThink = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    const jsonMatch = withoutThink.match(/\{[\s\S]*\}/);


    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0])

            return assistantResponseSchema.parse(parsed)
        } catch (error) {

        }
    }

    return {
        headline: "Recall Result",
        details: withoutThink || "No details returned by the model.",
        resolutionStatus: "partly_resolved"
    }
}

export const extractChunkText = (chunk: unknown) => {
    if (!chunk || typeof chunk !== "object") {
        return ""
    }

    const c = chunk as Record<string, unknown>

    if (c.type === "RUN_ERROR" || c.type === "error") {
        const upstreamDetail = c.error?.metadata?.raw || c.error?.message || c.message;
        const providerName = c.error?.metadata?.provider_name;
        throw new Error(
            `Recall Error${providerName ? ` (${providerName})` : ""}: ${upstreamDetail || JSON.stringify(c.error || c)
            }`
        );
    }

    if (c.type === "TEXT_MESSAGE_CONTENT" && typeof c.delta === "string") {
        return c.delta
    }

    if (c.type === "content" || c.type === "text") {
        if (typeof c.delta === "string") {
            return c.delta
        }
        if (typeof c.content === "string") {
            return c.content
        }
    }

    return ""
}


export const processRecallConversation = createServerFn({ method: "POST" })
    .middleware([sessionMiddleware])
    .validator(processRecallConversationParamSchema)
    .handler(async ({ data, context }) => {
        const { prisma } = await import("#/db.ts")

        if (!context.session?.user.id) {
            throw new Error("Unauthorized")
        }

        const userId = context.session.user.id

        const allCollections = await getCollectionsOfUser({
            data: {
                userId
            }
        })

        const pinnedCollectionIds = new Set(
            [...data.globalContext, ...data.messages.flatMap(message => message.attachments ?? [])]
                .filter((attribute) => attribute.type === "collection")
                .map((attribute) => attribute.id)
        )

        const targetCollections = pinnedCollectionIds.size > 0 ? allCollections.filter((collection) => pinnedCollectionIds.has(collection.id)) : allCollections

        const leanCollections = targetCollections.map((item) => {
            const { id, version, visibility, assets, ...rest } = item

            const necessaryAsset = assets.map(asset => {
                const { collectionId, createdAt, updatedAt, userId, version, id, ...assetRest } = asset

                return assetRest
            })

            return {
                ...rest,
                assets: necessaryAsset
            }
        })

        const noneCollectionGlobalAttachments = data.globalContext.filter((attachment) => attachment.type !== "collection")

        const systemPrompt = `
        Please, use the following knowledge context and respond accordingly: 

        ${JSON.stringify(leanCollections)}

        ${noneCollectionGlobalAttachments.length > 0 ? `Additional Global Context Attachments: \n ${JSON.stringify(noneCollectionGlobalAttachments)}` : ""}

        Respond only with valid raw JSON object (no md formatting, no code blocks, no extra text) matching the exact structure:

        {
            "headline": "Short summmary title",
            "details": "Detailed answer based on context",
            "resolutionStatus": "resolved" | "partly_resolved" | "unresolved"
        }
        `.trim()

        const formattedMessages = data.messages.map(message => {
            if (message.role === "user" && message.attachments && message.attachments.length > 0) {
                const attachmentNote = message.attachments
                    .map(attachment => `[Attached ${attachment.type}: ${attachment.name}${attachment.url ? ` (${attachment.url})` : ""}]`)
                    .join(" ")

                return {
                    role: message.role,
                    content: `${message.content} \n\n ${attachmentNote}`
                }
            }

            return {
                role: message.role,
                content: message.content
            }
        })

        let lastError: unknown = null

        for (const modelId of FREE_MODEL_FALLBACKS) {
            try {
                const stream = chat({
                    adapter: createOpenRouterText(modelId, serverEnv.LLM_API_KEY),
                    messages: formattedMessages,
                    systemPrompts: [systemPrompt]
                })

                let rawText = ""

                for await (const chunk of stream) {
                    rawText += extractChunkText(chunk)
                }

                return parseModelJson(rawText)
            } catch (error) {
                console.warn(`Model ${modelId} failed, trying next fallback...`, error)
                lastError = error
            }
        }

        throw lastError instanceof Error ? lastError : new Error("All free models are currently busy")
    })