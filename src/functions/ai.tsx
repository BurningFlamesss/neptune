import { sessionMiddleware } from "#/middleware/authentication.tsx";
import { chat } from "@tanstack/ai";
import { openRouterText } from "@tanstack/ai-openrouter";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCollectionsOfUser } from "./knowledge";

const processRecallConversationParamSchema = z.object({
    userId: z.string(),
    messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string()
    }))
})


export const processRecallConversation = createServerFn()
    .middleware([sessionMiddleware])
    .validator(processRecallConversationParamSchema)
    .handler(async ({ data, context }) => {
        const { prisma } = await import("#/db.ts")

        if (!data.userId || !context.session?.user.id) {
            throw new Error("Unauthorized")
        }

        const userId = data.userId || context.session.user.id

        const collections = await getCollectionsOfUser({
            data: {
                userId
            }
        })

        const prompt = `
        Please, use these context and give response according to this:

        ${JSON.stringify(collections ?? [])}
        `

        return await processPrompt({
            data: {
                messages: data.messages,
                systemPrompts: [prompt]
            }
        })
    })


const processPromptParamSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string()
    })),
    systemPrompts: z.array(z.string()).optional()
})

export const processPrompt = createServerFn()
    .middleware([sessionMiddleware])
    .validator(processPromptParamSchema)
    .handler(async ({ data, context }) => {
        const { prisma } = await import("#/db")

        if (!context.session?.user.id) {
            throw new Error("Unauthorized")
        }

        const userId = context.session.user.id

        const stream = chat({
            adapter: openRouterText("qwen/qwen3.8-27b:free"),
            messages: data.messages,
            systemPrompts: data.systemPrompts ? [...data.systemPrompts] : [],
            modelOptions: {
                provider: {
                    dataCollection: "deny",
                    sort: "throughput"
                }
            }
        })

        return stream
    })