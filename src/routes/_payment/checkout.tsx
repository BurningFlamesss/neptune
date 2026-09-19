import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const checkoutSearchParamSchema = z.object({
	plan: z.string(),
	billing: z.enum(["monthly", "annually", "lifetime"]),
});

export const Route = createFileRoute("/_payment/checkout")({
	component: RouteComponent,
	validateSearch: checkoutSearchParamSchema
});

function RouteComponent() {
	
	return <div>Hello "/_payment/checkout"!</div>;
}
