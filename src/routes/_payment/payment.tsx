import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_payment/payment')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_payment/payment"!</div>
}
