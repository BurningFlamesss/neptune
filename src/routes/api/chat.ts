import { chat, chatParamsFromRequest, toServerSentEventsResponse } from '@tanstack/ai';
import { openRouterText } from '@tanstack/ai-openrouter';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/chat')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const { messages } = await chatParamsFromRequest(request)

                const stream = chat({
                    adapter: openRouterText("qwen/qwen3.8-27b:free"),
                    messages: messages,

                    modelOptions: {
                        provider:{
                            dataCollection: "deny",
                            sort: "throughput"
                        }
                    }
                })

                return toServerSentEventsResponse(stream)
            },
        },
    },
})