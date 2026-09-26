import { processRecallConversation } from '#/functions/ai.tsx';
import { useUserStore } from '#/store/user.ts';
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react';
import { createFileRoute } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react';

export const Route = createFileRoute('/_public/recall')({
  component: RouteComponent,
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const { activeChatId, chats, createChat, addAssistantMessage, addUserMessage } = useUserStore()
  // const { messages, sendMessage, isLoading, stop } = useChat({
  //   connection: fetchServerSentEvents("/api/chat")
  // })

  const activeChat = chats.find(chat => chat.id === activeChatId)

  const [input, setInput] = useState<string>("")

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!input.trim()) {
      return
    }

    let currentId = activeChatId

    if (!currentId) {
      currentId = createChat()
    }

    addUserMessage(currentId, input)

    processRecallConversation({
      data: {
        userId: context.session?.user.id ?? "",
        messages
      }
    })

    setInput("")
  }

  return (
    <main className='max-w-5xl mx-auto flex flex-col justify-center'>
      <section className='relative flex flex-col h-[80vh] overflow-y-auto'>
        <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>Start your recall session</span>
      </section>
      <section className='flex flex-row items-center justify-center'>
        <form onSubmit={submit} action="#" method="post">
          <input value={input} onChange={e => setInput(e.target.value)} type="text" name="prompt" id="prompt" className='text-lg!' />
          <button type="submit" className='app-button'>Recall</button>
        </form>
      </section>
    </main>
  )
}
