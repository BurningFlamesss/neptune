import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getIndividualPack } from "#/functions/payment.tsx";
import { formatPrice } from "#/lib/utils.ts";

const checkoutSearchParamSchema = z.object({
	plan: z.string(),
	billing: z.enum(["monthly", "annually", "lifetime"]),
});

export const Route = createFileRoute("/_payment/checkout")({
	component: RouteComponent,
	validateSearch: checkoutSearchParamSchema,
	loaderDeps({ search }) {
		return {
			plan: search.plan,
			billing: search.billing,
		};
	},
	async loader({ deps }) {
		return getIndividualPack({
			data: {
				plan: deps.plan,
			},
		});
	},
});

function RouteComponent() {
	const plan = Route.useLoaderData();

	if (!plan) {
		return <div>Plan not found</div>;
	}

	return (
		<main>
			<h1>Billing</h1>

			<h1>{plan.name}</h1>
			<p>
				{formatPrice(plan.price, plan.currency)}
			</p>

			<form action="#" method="post">
				<input type="text" name="coupon" placeholder="Enter coupon code" />
				<button type="submit">Apply Coupon</button>
			</form>

			<section>
				<button type="button">Pay with Stripe</button>
			</section>
		</main>
	);
}
