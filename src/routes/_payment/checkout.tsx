import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { success, z } from "zod";
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
			<p>{formatPrice(plan.price, plan.currency)}</p>

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
