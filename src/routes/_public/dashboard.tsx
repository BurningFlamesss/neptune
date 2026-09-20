import { createFileRoute, useLoaderData } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    const context = Route.useRouteContext()
    const { plan } = useLoaderData({ from: "__root__" })


    return (
        <main>
            Hello, {context.session?.user.name}!!! You have {plan?.name} plan <br />
            
        </main>
    )
}
