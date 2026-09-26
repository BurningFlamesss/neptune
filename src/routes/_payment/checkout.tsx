import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
	getIndividualPack,
	inspectCouponService,
	redeemCouponService,
} from "#/functions/payment.tsx";
import { formatPrice, normalizeCouponCode } from "#/lib/utils.ts";

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
	const navigate = useNavigate()
	const queryClient = useQueryClient();

	const [code, setCode] = useState("");
	const [debouncedCode, setDebouncedCode] = useState("");

	const normalizedCode = normalizeCouponCode(debouncedCode);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedCode(code);
		}, 350);

		return () => clearTimeout(timer);
	}, [code]);

	const inspectQuery = useQuery({
		queryKey: ["coupon-inspect", normalizedCode, plan?.id],
		queryFn: () =>
			inspectCouponService({
				data: {
					code: normalizedCode,
					planId: plan?.id,
				},
			}),
		enabled: normalizedCode.length > 0 && !!plan?.id,
		staleTime: 30_000,
		retry: false,
	});

	const redeemMutation = useMutation({
		mutationFn: async ({
			inputCode,
			planId,
		}: {
			inputCode: string;
			planId: string;
		}) =>
			redeemCouponService({
				data: { code: inputCode, planId },
			}),
		onSuccess: ({ success }, redeemedCode) => {
			if (!success) {
				// TODO: UI Feedback to show that failed to redeem coupon
				return;
			}

			queryClient.removeQueries({
				queryKey: ["coupon-inspect", redeemedCode],
			});

			setCode("");
			setDebouncedCode("");

			navigate({ to: "/dashboard" })
		},
		onError: (error) => {
			// TODO: UI Feedback to show that failed to redeem coupon
		},
	});

	if (!plan) {
		return <div>Plan not found</div>;
	}

	const inspection = inspectQuery.data;
	const isCouponValid = inspection?.valid && inspection?.redeemable;

	let discountAmount = 0;

	if (isCouponValid) {
		if (
			inspection.type === "PERCENTAGE_DISCOUNT" &&
			inspection.percentageDiscount
		) {
			discountAmount = plan.price * (inspection.percentageDiscount / 100);
		} else if (
			inspection.type === "FIXED_DISCOUNT" &&
			inspection.fixedDiscount
		) {
			discountAmount = inspection.fixedDiscount;
		}
	}

	const finalPrice = Math.max(0, plan.price - discountAmount);

	const handleCheckout = () => {
		// TODO: Handle the checkout
	};

	const handleDirectRedeem = async () => {
		if (!normalizedCode || !plan?.id) {
			return;
		}

		await redeemMutation.mutateAsync({
			inputCode: normalizedCode,
			planId: plan.id,
		});
	};

	return (
		<main className="max-w-5xl mx-auto flex flex-col justify-center">
			<div className="grid grid-cols-2 gap-[15%] pt-18 pb-15">
				<section className="bg-cyan/20 rounded-lg h-fit w-fit px-2 py-4 flex flex-col" key={plan.id}>
					<h1 className="text-3xl">
						{plan.name}
					</h1>
					<p className="text-lg flex flex-row gap-1">
						<span className="line-through">
							{isCouponValid && formatPrice(plan.price, plan.currency)}
						</span>
						<span>{formatPrice(finalPrice, plan.currency)}</span>
					</p>
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
				</section>


				<section>

					<label htmlFor="code">Have a coupon?</label>
					<input
						type="text"
						name="code"
						placeholder="eg NEPTUNE20"
						autoComplete="off"
						spellCheck={false}
						disabled={redeemMutation.isPending}
						value={code}
						onChange={(e) => setCode(e.target.value.toUpperCase())}
					/>

					<div className="mt-2">
						{inspectQuery.isFetching && "Checking..."}

						{!inspectQuery.isFetching &&
							inspection &&
							(inspection.valid ? (
								<span>
									Coupon applied!{" "}
									{inspection.type === "PERCENTAGE_DISCOUNT"
										? `${inspection.percentageDiscount}% off`
										: `${formatPrice(inspection.fixedDiscount || 0, plan.currency)} off`}
								</span>
							) : (
								<span>{inspection.reason || "Invalid coupon"}</span>
							))}
					</div>

					<section className="mt-4">
						{isCouponValid &&
							(inspection.redeemptionType === "DIRECT_REDEEM" || finalPrice === 0) ? (
							<button
								className="app-button"
								type="button"
								onClick={handleDirectRedeem}
								disabled={redeemMutation.isPending}
							>
								{redeemMutation.isPending
									? "Redeeming..."
									: "Redeem & Activate Plan"}
							</button>
						) : (
							<button className="app-button" type="button" onClick={handleCheckout}>
								Pay {formatPrice(finalPrice, plan.currency)}
							</button>
						)}
					</section>
				</section>

			</div>
		</main>
	);
}
