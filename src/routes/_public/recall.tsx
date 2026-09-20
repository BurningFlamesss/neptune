import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/recall')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className='min-w-5xl mx-auto'>
        <input type="text" name="prompt" id="prompt" />
    </main>
  )
}
