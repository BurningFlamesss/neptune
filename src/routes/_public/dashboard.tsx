import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/dashboard')({
    
    component: RouteComponent,
})

function RouteComponent() {
    const context = Route.useRouteContext()

    return (
        <main>
            Hello, {context.session?.user.name}!!! You have plan
        </main>
    )
}
