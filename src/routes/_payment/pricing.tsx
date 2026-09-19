import { createFileRoute, Link } from "@tanstack/react-router";
import { getPlans } from "#/functions/payment.tsx";

export const Route = createFileRoute("/_payment/pricing")({
	component: RouteComponent,
	async loader() {
		return await getPlans();
	},
});

function RouteComponent() {
	const plans = Route.useLoaderData();

	if (!plans.length) {
		return <div>No any packs available</div>;
	}
	return (
		<main className="flex flex-row justify-between mx-8">
			{plans.map((plan) => {
				return (
					<section key={plan.id}>
						<h1>
							{plan.name}, {plan._count.payments} users purchased it
						</h1>
						<p>
							{plan.price} {plan.currency}
						</p>
						<ul>
							<li>Unlimited Collections</li>
							<li>Unlimited knowledge items</li>
							<li>Unlimited application connections</li>
							<li>Intelligence Storage: {plan.intelligenceStorage}</li>
							<li>Sync: {plan.sync}</li>
							<li>Recall: {plan.recall}</li>
							<li>Versioning: {plan.versioning}</li>
							<li>Sharing: {plan.sharing}</li>
							{((plan.features as Array<string>) ?? [])?.map(
								(feature, index) => (
									<li key={`${index}-${feature}`}>{feature}</li>
								),
							)}
						</ul>
						<Link
							to="/checkout"
							search={{ plan: plan.name, billing: "monthly" }}
						>
							Choose this
						</Link>
					</section>
				);
			})}
		</main>
	);
}
