import { useUserStore } from '#/store/user.ts';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/recall')({
  component: RouteComponent,
})

function RouteComponent() {
  const { activeChatId, chats } = useUserStore()

  return (
    <main className='max-w-5xl mx-auto flex flex-col justify-center'>
        <section className='relative flex flex-col h-[80vh] overflow-y-auto'>
            <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>Start your recall session</span>
        </section>
        <section className='flex flex-row items-center justify-center'>
            <input type="text" name="prompt" id="prompt" className='text-lg!' /> <button type="button" className='app-button'>Recall</button>
        </section>
    </main>
  )
}
