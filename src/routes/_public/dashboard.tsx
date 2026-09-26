import { getCollectionsOfUser } from '#/functions/knowledge'
import { createFileRoute, redirect, useLoaderData } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/dashboard')({
    beforeLoad(ctx) {
        if (!ctx.context.session) {
            throw redirect({ to: "/signup" })
        }
    },
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
        <main className='max-w-5xl mx-auto flex flex-col justify-center my-4'>
            Hello, {context.session?.user.name}!!! You have {plan?.name} plan <br />

            <h1 className='text-2xl mt-4'>Collections: </h1>
            {collections?.map((collection, index) => {

                return (
                    <section key={collection.id}>
                        {index + 1}. {collection.name} v{collection.version} <br />
                        <ul>
                            {collection.assets.map(asset => {

                                return (
                                    <li key={asset.id}>{index + 1}. {asset.title} v{asset.version}</li>
                                )
                            })}
                        </ul>
                    </section>
                )
            })}
        </main>
    )
}
