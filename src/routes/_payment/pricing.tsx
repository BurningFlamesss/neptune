import { createFileRoute, Link } from "@tanstack/react-router";
import { getPlans } from "#/functions/payment.tsx";
import { formatPrice, formatStorageBytes } from "#/lib/utils.ts";
import { CheckCheck, X } from "lucide-react";

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
							{((plan.displayFeaturesIncluded as Array<string>) ?? [])?.map(
								(feature, index) => (
									<li key={`${index}-${feature}`}><CheckCheck className="text-cyan" />{feature}</li>
								),
							)}
							<li>Monthly Compute Quota: <span className="text-ink-deep font-semibold">{formatPrice(plan.monthlyComputeQuotaCents, plan.currency)}</span></li>
							<li>Monthly Marketplace Credits: <span className="text-ink-deep font-semibold">{formatPrice(plan.monthlyMarketplaceCreditsCents, plan.currency)}</span></li>
							<li>Rate Limts: <span className="text-ink-deep font-semibold">{plan.rateLimitPerMinute} requests / minute</span></li>
							<li>Max Connections: <span className="text-ink-deep font-semibold">{plan.maxConnectedApps} apps</span></li>
							<li>Storage: <span className="text-ink-deep font-semibold">{formatStorageBytes(plan.storageLimitBytes)}</span></li>
							{((plan.displayFeaturesNotIncluded as Array<string>) ?? [])?.map(
								(feature, index) => (
									<li key={`${index}-${feature}`}><X className="text-destructive" />{feature}</li>
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
