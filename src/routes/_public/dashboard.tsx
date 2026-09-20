import { getUserPlan } from '#/functions/payment'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/dashboard')({
    async loader({ context }) {
        return await getUserPlan({
            data: {
                userId: context.session?.user.id
            }
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    const plan = Route.useLoaderData()
    const context = Route.useRouteContext()

    return (
        <main>
            Hello, {context.session?.user.name}!!! You have {plan?.name ?? "Ring"} plan
        </main>
    )
}
