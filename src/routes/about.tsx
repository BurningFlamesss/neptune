import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className='max-w-5xl mx-auto flex flex-col justify-center mt-4'>
        <h1 className='text-3xl'>About <span className='text-cyan-dark'>NepTune</span> & its <span className='text-cyan-dark'>Ring</span></h1>

        <section className='mt-8'>
          <h2 className='text-lg'>## What is this?</h2>
          <p>
            We are building the definitive engine for automation in syncing, and reusable knowledge nodes. Our mission is to elminate the friction between thought and acting on it.
          </p>
        </section>
        <section className='mt-4'>
          <h2 className='text-lg'>## Recall</h2>
          <p>
            INformation is useless if you can't find it. We integrate model with chosen access to your knowledge so your knowledge can be retrieved from the source of your own intelligence, and get response visually.
          </p>
        </section>
    </main>
  )
}
