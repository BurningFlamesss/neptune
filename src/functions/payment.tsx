import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

	return plans;
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
