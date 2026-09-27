import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { delay } from "#/lib/utils.ts";
import { sessionMiddleware } from "#/middleware/authentication.tsx";

function serializePlan<T extends { storageLimitBYtes?: bigint | null }>(plan: T) {
	return {
		...plan,
		storageLimitBytes: plan.storageLimitBYtes !== null && plan.storageLimitBYtes !== undefined ? Number(plan.storageLimitBYtes) : null
	}
}

export const getPlans = createServerFn().handler(async () => {
	const { prisma } = await import("#/db.ts");

	const plans = await prisma.plan.findMany({
		where: {
			isActive: true,
		},
		orderBy: {
			sortOrder: "asc",
		},
		select: {
			currency: true,
			price: true,
			comparedAtPrice: true,
			name: true,
			id: true,
			interval: true,
			basePFactor: true,
			monthlyComputeQuotaCents: true,
			monthlyMarketplaceCreditsCents: true,
			rateLimitPerMinute: true,
			maxConnectedApps: true,
			storageLimitBytes: true,
			displayFeaturesIncluded: true,
			displayFeaturesNotIncluded: true,
			_count: {
				select: {
					payments: {
						where: {
							status: "SUCCEEDED",
						},
					},
				},
			},
		},
	});

	return plans.map(serializePlan)
});

const getIndividualPackParamSchema = z.object({
	plan: z.string(),
	billing: z.enum(["monthly", "annually", "lifetime"]).optional()
});

export const getIndividualPack = createServerFn()
	.validator(getIndividualPackParamSchema)
	.handler(async ({ data }) => {
		const { prisma } = await import("#/db.ts");

		const intervalMap = {
			monthly: "MONTHLY",
			annually: "ANNUALLY",
			lifetime: "LIFETIME",
		} as const

		const plan = await prisma.plan.findFirst({
			where: {
				name: data.plan,
				isActive: true,
				...(data.billing ? { interval: intervalMap[data.billing] } : {})
			},
			select: {
				currency: true,
				price: true,
				comparedAtPrice: true,
				name: true,
				id: true,
				interval: true,
				basePFactor: true,
				monthlyComputeQuotaCents: true,
				monthlyMarketplaceCreditsCents: true,
				rateLimitPerMinute: true,
				maxConnectedApps: true,
				storageLimitBytes: true,
				displayFeaturesIncluded: true,
				displayFeaturesNotIncluded: true,
				_count: {
					select: {
						payments: {
							where: {
								status: "SUCCEEDED",
							},
						},
					},
				},
			},
		});

		return plan ? serializePlan(plan) : null
	});

const getRecentTransactionParamSchema = z.object({
	userId: z.string(),
});

export const getRecentTransaction = createServerFn()
	.validator(getRecentTransactionParamSchema)
	.handler(async ({ data }) => {
		const { prisma } = await import("#/db");

		return prisma.payment.findMany({
			where: {
				userId: data.userId,
			},
			take: 20,
			skip: 0,
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				orderId: true,
				purpose: true,
				subTotal: true,
				total: true,
				discount: true,
				status: true,
				plan: {
					select: {
						id: true,
						name: true,
						interval: true
					}
				},
				metadata: true,
				currency: true,
				provider: true,
				paidAt: true,
			},
		});
	});

const redeemCouponServiceParamSchema = z.object({
	code: z.string(),
	planId: z.string().optional(),
});

const MAX_ATTEMPTS = 3;

export const redeemCouponService = createServerFn()
	.middleware([sessionMiddleware])
	.validator(redeemCouponServiceParamSchema)
	.handler(async ({ data, context }) => {
		const session = context.session;

		if (!session) {
			throw new Error("Unauthorized");
		}

		if (!data.planId) {
			throw new Error("Plan ID is required")
		}

		const now = new Date();
		const userId = session.user.id;

		const { prisma } = await import("#/db.ts");
		let attempt = 0;

		while (true) {
			attempt++;

			try {
				return await prisma.$transaction(
					async (transaction) => {
						const coupon = await transaction.coupon.findUnique({
							where: {
								code: data.code,
							},
							select: {
								id: true,
								code: true,
								type: true,
								percentageDiscount: true,
								fixedDiscount: true,
								status: true,
								redeemptionType: true,
								maxUses: true,
								usedCount: true,
								perUserLimit: true,
								startsAt: true,
								expiresAt: true,
								applicablePlans: {
									select: {
										id: true
									}
								}
							},
						});

						if (!coupon) {
							throw new Error("Invalid coupon");
						}

						if (coupon.status !== "ACTIVE") {
							throw new Error("Coupon inactive");
						}

						if (coupon.startsAt && coupon.startsAt > now) {
							throw new Error("Coupon not started");
						}

						if (coupon.expiresAt && coupon.expiresAt < now) {
							throw new Error("Coupon expired");
						}

						if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
							throw new Error("Coupon exhausted");
						}

						const plan = await transaction.plan.findUnique({
							where: {
								id: data.planId,
							},
						});

						if (!plan) {
							throw new Error("Plan not found");
						}

						if (coupon.applicablePlans.length > 0 && !coupon.applicablePlans.some(applicablePlan => applicablePlan.id === plan.id)) {
							throw new Error("Coupon isnot valid for this plan")
						}

						const redeemptionCount = await transaction.couponUsage.count({
							where: {
								couponId: coupon.id,
								userId,
							},
						});

						if (redeemptionCount >= coupon.perUserLimit) {
							throw new Error("Redeemption limit reached");
						}

						let discountApplied = plan.price

						if (coupon.type === "PERCENTAGE_DISCOUNT" && coupon.percentageDiscount !== null) {
							discountApplied = Math.min(
								plan.price,
								Math.round(plan.price * (coupon.percentageDiscount / 100))
							)
						} else if (coupon.type === "FIXED_DISCOUNT" && coupon.fixedDiscount !== null) {
							discountApplied = Math.min(plan.price, coupon.fixedDiscount)
						}

						const finalTotal = Math.max(0, plan.price - discountApplied)

						if (coupon.redeemptionType === "CHECKOUT" && finalTotal > 0) {
							throw new Error(
								"This coupon must be applied during checkout payment.",
							);
						}

						const usage = await transaction.couponUsage.create({
							data: {
								userId,
								couponId: coupon.id,
								discountApplied
							},
						});

						const newUsedCount = coupon.usedCount + 1

						await transaction.coupon.update({
							where: {
								id: coupon.id,
							},
							data: {
								usedCount: { increment: 1 },
								...(coupon.maxUses !== null && newUsedCount >= coupon.maxUses ? { status: "EXHAUSTED" } : {})
							},
						});

						await transaction.payment.create({
							data: {
								userId,
								purpose: "SUBSCRIPTION",
								provider: "MANUAL",
								status: "SUCCEEDED",
								currency: plan.currency,
								subTotal: plan.price,
								discount: plan.price,
								total: 0,
								couponUsageId: usage.id,
								planId: plan.id,
								paidAt: now,
								orderId: Math.floor(Math.random() * 1000000000),
							},
						});

						const currentPeriodStart = new Date();
						const currentPeriodEnd = new Date();

						if (plan.interval === "MONTHLY") {
							currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
						} else if (plan.interval === "ANNUALLY") {
							currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
						} else {
							currentPeriodEnd.setFullYear(
								currentPeriodEnd.getFullYear() + 100,
							);
						}

						const existingSubscriber = await transaction.subscription.findFirst(
							{
								where: {
									userId,
								},
								orderBy: {
									createdAt: "desc",
								},
							},
						);

						if (existingSubscriber) {
							await transaction.subscription.update({
								where: {
									id: existingSubscriber.id,
								},
								data: {
									planId: plan.id,
									status: "ACTIVE",
									currentPeriodStart,
									currentPeriodEnd,
								},
							});
						} else {
							await transaction.subscription.create({
								data: {
									userId,
									planId: plan.id,
									status: "ACTIVE",
									currentPeriodStart,
									currentPeriodEnd,
								},
							});
						}

						await transaction.user.update({
							where: {
								id: userId
							},
							data: {
								computeQuotaBalanceCents: plan.monthlyComputeQuotaCents,
								marketplaceCreditBalanceCents: plan.monthlyMarketplaceCreditsCents,
								currentBillingCycleStart: currentPeriodStart
							}
						})

						return {
							success: true,
						};
					},
					{ isolationLevel: "ReadCommitted" },
				);
			} catch (error) {
				const message = String(error?.message || error);

				if (
					attempt < MAX_ATTEMPTS &&
					/transaction|serialize|start as transaction|could not obtain lock/i.test(
						message,
					)
				) {
					await delay(50 * attempt);
					continue;
				}

				throw error;
			}
		}
	});

const inspectCouponServiceParamSchema = z.object({
	code: z.string(),
	planId: z.string().optional(),
});

export const inspectCouponService = createServerFn()
	.middleware([sessionMiddleware])
	.validator(inspectCouponServiceParamSchema)
	.handler(async ({ data, context }) => {
		const session = context.session;

		if (!session) {
			return {
				valid: false,
				redeemable: false,
				reason: "Unauthorized",
			};
		}

		const userId = session.user.id;

		const { prisma } = await import("#/db");

		const now = Date.now();

		const coupon = await prisma.coupon.findUnique({
			where: {
				code: data.code,
			},
			select: {
				id: true,
				status: true,
				redeemptionType: true,
				maxUses: true,
				usedCount: true,
				perUserLimit: true,
				startsAt: true,
				expiresAt: true,
				applicablePlans: true,
				fixedDiscount: true,
				percentageDiscount: true,
				type: true,
			},
		});

		if (!coupon) {
			return {
				valid: false,
				redeemable: false,
				reason: "No coupon found",
			};
		}

		const nowDate = new Date(now);

		if (coupon.status !== "ACTIVE") {
			return { valid: false, redeemable: false, reason: "Coupon inactive" };
		}

		if (coupon.startsAt && coupon.startsAt > nowDate) {
			return { valid: false, redeemable: false, reason: "Coupon not started" };
		}

		if (coupon.expiresAt && coupon.expiresAt < nowDate) {
			return { valid: false, redeemable: false, reason: "Coupon expired" };
		}

		if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
			return { valid: false, redeemable: false, reason: "Coupon exhausted" };
		}

		if (coupon.applicablePlans.length > 0) {
			if (!data.planId) {
				return {
					valid: false,
					redeemable: false,
					reason: "Please select a plan first",
				};
			}

			const isPlanValid = coupon.applicablePlans.some(
				(plan) => plan.id === data.planId,
			);
			if (!isPlanValid) {
				return {
					valid: false,
					redeemable: false,
					reason: "Coupon is not valid for this plan",
				};
			}
		}

		const redeemptionCount = await prisma.couponUsage.count({
			where: {
				couponId: coupon.id,
				userId,
			},
		});

		if (redeemptionCount >= coupon.perUserLimit) {
			return {
				valid: true,
				redeemable: false,
				reason: "Redeemption limit reached",
			};
		}

		const remainingUses =
			coupon.maxUses === null
				? undefined
				: Math.max(0, coupon.maxUses - coupon.usedCount);
		const perUserRemaining = Math.max(
			0,
			coupon.perUserLimit - redeemptionCount,
		);

		return {
			valid: true,
			redeemable: true,
			redeemptionType: coupon.redeemptionType,
			perUserRemaining,
			remainingUses,
			type: coupon.type,
			fixedDiscount: coupon.fixedDiscount,
			percentageDiscount: coupon.percentageDiscount,
		};
	});

const getUserPlanParamSchema = z.object({
	userId: z.string().optional()
})



export const getUserPlan = createServerFn()
	.middleware([sessionMiddleware])
	.validator(getUserPlanParamSchema)
	.handler(async ({ data, context }) => {
		const { prisma } = await import("#/db.ts")

		const userId = data?.userId || context.session?.user.id

		if (!userId) {
			throw new Error("Unauthorized")
		}


		const activeSubscription = await prisma.subscription.findFirst({
			where: {
				userId,
				status: "ACTIVE",
				currentPeriodEnd: {
					gt: new Date()
				}
			},
			include: {
				plan: true
			},
			orderBy: {
				currentPeriodEnd: "desc"
			}
		})

		if (activeSubscription?.plan) {
			return serializePlan(activeSubscription.plan)
		}

		const freePlan = await prisma.plan.findFirst({
			where: {
				price: 0,
				isActive: true
			}
		})

		if (!freePlan) {
			throw new Error("Critical Error: No free plan configured in the database")
		}

		return serializePlan(freePlan)
	})
