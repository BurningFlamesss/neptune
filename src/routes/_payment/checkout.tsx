import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
		enabled: normalizedCode.length > 0 && !plan?.id,
		staleTime: 30_000,
		retry: false,
	});

	const redeemMutation = useMutation({
		mutationFn: async (inputCode: string) =>
			redeemCouponService({
				data: { code: inputCode },
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

			// TODO: Redirect to dashboard or success page
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
		if (!normalizedCode) {
			return;
		}

		await redeemMutation.mutateAsync(normalizedCode);
	};

	return (
		<main>
			<h1>Billing</h1>

			<h1>{plan.name}</h1>
			<p className="line-through">
				{isCouponValid && formatPrice(plan.price, plan.currency)}
			</p>
			<p>{formatPrice(finalPrice, plan.currency)}</p>

			<form action="#" method="post">
				<label htmlFor="code">Have a coupon?</label>
				<input
					type="text"
					name="code"
					placeholder="eg NEPTUNE20"
					autoComplete="off"
					spellCheck={false}
					disabled={redeemMutation.isPending}
					onChange={(e) => setCode(e.target.value.toUpperCase())}
				/>
			</form>

			<div>
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

			<section>
				{isCouponValid &&
				(inspection.redeemptionType === "DIRECT_REDEEM" || finalPrice === 0) ? (
					<button
						type="button"
						onClick={handleDirectRedeem}
						disabled={redeemMutation.isPending}
					>
						{redeemMutation.isPending
							? "Redeeming..."
							: "Redeem & Activate Plan"}
					</button>
				) : (
					<button type="button" onClick={handleCheckout}>
						Pay {formatPrice(finalPrice, plan.currency)}
					</button>
				)}
			</section>
		</main>
	);
}
