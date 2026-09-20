import { getCollectionsOfUser } from '#/functions/knowledge'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/dashboard')({
    component: RouteComponent,
    async loader({ context }) {
        return await getCollectionsOfUser({
            data: {
                userId: context.session?.user.id
            }
        })
    }
})

function RouteComponent() {
    const context = Route.useRouteContext()
    const collections = Route.useLoaderData()
    const { plan } = useLoaderData({ from: "__root__" })


    return (
        <main className='max-w-5xl mx-auto flex flex-col justify-center'>
            Hello, {context.session?.user.name}!!! You have {plan?.name} plan <br />
        </main>
    )
}
