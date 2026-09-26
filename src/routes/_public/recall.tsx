import { processRecallConversation } from '#/functions/ai.tsx';
import { cn } from '#/lib/utils.ts';
import { useUserStore } from '#/store/user.ts';
import { createFileRoute } from '@tanstack/react-router'
import React, { useEffect, useRef, useState } from 'react';

export const Route = createFileRoute('/_public/recall')({
  component: RouteComponent,
})

function RouteComponent() {
  const hasHydrated = useUserStore((state) => state._hasHydrated)
  const setHasHydrated = useUserStore((state) => state.setHasHydrated)
  const activeChat = useUserStore((state) => state.chats.find((chat) => chat.id === state.activeChatId))
  const { createChat, addAssistantMessage, addUserMessage } = useUserStore()

  const [input, setInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const scrollContainerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!hasHydrated) {
      setHasHydrated(true)
    }
  }, [hasHydrated])

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [activeChat?.messages.length, isLoading])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()

    const promptText = input.trim()

    if (!promptText || isLoading || !hasHydrated) {
      return
    }

    setInput("")
    setIsLoading(true)

    let currentId = useUserStore.getState().activeChatId

    if (!currentId) {
      currentId = createChat()
    }

    addUserMessage(currentId, promptText)

    const updatedChat = useUserStore.getState().chats.find(chat => chat.id === currentId)

    const formattedMessages = (updatedChat?.messages ?? []).map((message) => ({
      role: message.role,
      content: message.role === "user" ? message.content : `${message.headline} \n ${message.details}`,
      attachments: message.role === "user" ? message.attachments : []
    }))

    try {
      const payload = await processRecallConversation({
        data: {
          globalContext: updatedChat?.globalContext ?? [],
          messages: formattedMessages
        }
      })

      addAssistantMessage(currentId, payload)
    } catch (error) {
      addAssistantMessage(currentId, {
        headline: "Recall Failed",
        details: error instanceof Error ? error.message : "Something went wrong while contacting the AI Model.",
        resolutionStatus: "unresolved"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className='max-w-5xl mx-auto flex flex-col justify-center'>
      <section ref={scrollContainerRef} className='relative flex flex-col h-[80vh] overflow-y-auto gap-4 p-4'>
        {!hasHydrated ? (
          <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>Loading recall session...</span>
        ) :
          !activeChat || activeChat.messages.length === 0 ? (
            <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>Start your recall session</span>
          ) : (
            activeChat.messages.map(message => (
              <div key={message.id} className={cn("max-w-xl p-4 rounded-lg", message.role === "user" ? "self-end" : "self-start")}>
                {message.role === "user" ? (
                  <div className="flex flex-col gap-1">
                    <p>{message.content}</p>

                    {message.attachments.length > 0 && <div className="flex flex-wrap gap-1 text-xs opacity-70">
                      {message.attachments.map(attachment => <span key={attachment.id}>[{attachment.name}]</span>)}
                    </div>}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{message.headline}</strong>

                      <span className="text-xs uppercase opacity-70">{message.resolutionStatus.replace("_", " ")}</span>
                    </div>

                    <p className="whitespace-pre-wrap">{message.details}</p>
                  </div>
                )}
              </div>
            ))
          )
        }
        {
          isLoading && <div className="self-start p-4 opacity-60 animate-pulse">Recalling from your collections...</div>
        }
      </section>

      <section className='flex flex-row items-center justify-center'>
        <form onSubmit={submit} action="#" method="post" className="flex flex-row items-center gap-2 w-full">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            type="text"
            name="prompt"
            id="prompt"
            className='text-lg!'
            placeholder="Ask your Knowledge"
          />
          <button type="submit" disabled={isLoading} className='app-button'>Recall</button>
        </form>
      </section>
    </main>
  )
}
