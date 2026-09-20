import { createFileRoute, Link } from "@tanstack/react-router";
import { getPlans } from "#/functions/payment.tsx";
import { formatPrice } from "#/lib/utils.ts";

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
		<main className="flex flex-row justify-between mx-4 mt-4">
			{plans.map((plan) => {
				return (
					<section className="bg-cyan/20 rounded-lg h-130 px-2 py-4 flex flex-col" key={plan.id}>
						<h1 className="text-3xl">
							{plan.name}
						</h1>
						<p className="text-lg">{formatPrice(plan.price, plan.currency)}</p>
						<ul className="flex flex-col items-start justify-center mt-4">
							<li>Unlimited Collections</li>
							<li>Unlimited knowledge items</li>
							<li>Unlimited application connections</li>
							<li>Intelligence Storage: <span className="text-ink-deep font-semibold">{plan.intelligenceStorage}</span></li>
							<li>Sync: <span className="text-ink-deep font-semibold">{plan.sync}</span></li>
							<li>Recall: <span className="text-ink-deep font-semibold">{plan.recall}</span></li>
							<li>Versioning: <span className="text-ink-deep font-semibold">{plan.versioning}</span></li>
							<li>Sharing: <span className="text-ink-deep font-semibold">{plan.sharing}</span></li>
							{((plan.features as Array<string>) ?? [])?.map(
								(feature, index) => (
									<li key={`${index}-${feature}`}>{feature}</li>
								),
							)}
						</ul>
						<div className="flex flex-row gap-2 items-center justify-start mt-auto">
							<Link
							to="/checkout"
							className="app-button"
							search={{ plan: plan.name, billing: "monthly" }}
						>
							Choose this
						</Link> <p> {plan._count.payments} users purchased it</p>
						</div>

					</section>
				);
			})}
		</main>
	);
}
