import { createServerFn } from "@tanstack/react-start";
import { date, z } from "zod";
import { sessionMiddleware } from "#/middleware/authentication.tsx";

export const getPlans = createServerFn().handler(async () => {
	const { prisma } = await import("#/db.ts");

	return await prisma.plan.findMany({
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
			features: true,
			notIncludedFeatures: true,
			intelligenceStorage: true,
			recall: true,
			sharing: true,
			sync: true,
			versioning: true,
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
});

const getIndividualPackParamSchema = z.object({
	plan: z.string(),
});

export const getIndividualPack = createServerFn()
	.validator(getIndividualPackParamSchema)
	.handler(async ({ data }) => {
		const { prisma } = await import("#/db.ts");

		return await prisma.plan.findFirst({
			where: {
				name: data.plan,
				isActive: true,
			},
			select: {
				currency: true,
				price: true,
				comparedAtPrice: true,
				name: true,
				id: true,
				features: true,
				notIncludedFeatures: true,
				intelligenceStorage: true,
				recall: true,
				sharing: true,
				sync: true,
				versioning: true,
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
				total: true,
				discount: true,
				status: true,
				plan: true,
				metadata: true,
				currency: true,
				provider: true,
				paidAt: true,
			},
		});
	});

const redeemCouponServiceParamSchema = z.object({
	code: z.string()
})

export const redeemCouponService = createServerFn()
	.middleware([sessionMiddleware])
	.validator(redeemCouponServiceParamSchema)
	.handler(async ({ data, context }) => {
		const session = context.session

		if (!session) {
			throw new Error("Unauthorized")
		}

		const now = new Date()
		const userId = session.user.id

		const {prisma} = await import("#/db.ts")
		let attempt = 0

		while (true) {
			attempt++

			try {
				return await prisma.$transaction(async (transaction) => {
					const coupon = await transaction.coupon.findUnique({
						where: {
							code: data.code
						},
						select: {
							id: true,
							code: true,
							status: true,
							redeemptionType: true,
							maxUses: true,
							usedCount: true,
							perUserLimit: true,
							startsAt: true,
							expiresAt: true,
						}
					})

					if (!coupon) {
						throw new Error("Invalid coupon")
					}

					if (coupon.status !== "ACTIVE") {
						throw new Error("Coupon inactive")
					}

					if (coupon.startsAt && coupon.startsAt > now) {
						throw new Error("Coupon not started")
					}

					if (coupon.expiresAt && coupon.expiresAt < now) {
						throw new Error("Coupon expired")
					}

					if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
						throw new Error("Coupon exhausted")
					}

				})
			} catch (error) {
				
			}
		}
	});
