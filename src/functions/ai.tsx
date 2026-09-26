import { sessionMiddleware } from "#/middleware/authentication.tsx";
import { chat } from "@tanstack/ai";
import { openRouterText } from "@tanstack/ai-openrouter";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCollectionsOfUser } from "./knowledge";

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

        const leanCollections = allCollections.map((item) => {
            const { id, version, visibility, assets, ...rest } = item

            const necessaryAsset = assets.map(asset => {
                const { collectionId, createdAt, updatedAt, userId, version, id, ...rest } = asset

                return rest
            })

            return {
                ...rest,
                assets: necessaryAsset
            }
        })

        const systemPrompt = `
        Please, use these context and give response according to this:

        ${JSON.stringify(leanCollections)}

        Respond only with valid raw JSON object (no md formatting, no code blocks, no extra text) matching the exact structure:

        {
            "headline": "",
            "details": "",
            resolutionStatus: "resolved" | "partly_resolved" | "unresolved"
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

        const stream = chat({
            adapter: openRouterText("qwen/qwen3.8-27b:free"),
            messages: formattedMessages,
            systemPrompts: [systemPrompt],
            modelOptions: {
                provider: {
                    dataCollection: "deny",
                    sort: "throughput"
                }
            }
        })

        let rawText = ""

        for await (const chunk of stream) {
            if (chunk.type === "CUSTOM") {
                rawText += chunk.value
            }
        }

        return rawText
    })