import { sessionMiddleware } from "#/middleware/authentication.tsx";
import { chat } from "@tanstack/ai";
import { openRouterText } from "@tanstack/ai-openrouter";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";


const processPromptParamSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string()
    }))
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
            modelOptions: {
                provider: {
                    dataCollection: "deny",
                    sort: "throughput"
                }
            }
        })

        return stream
    })