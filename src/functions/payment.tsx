import { createServerFn } from "@tanstack/react-start";


export const getPlans = createServerFn()
    .handler(async () => {
        const {prisma} = await import("#/db.ts")

        const plans = await prisma.plan.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                sortOrder: "asc"
            },
            select: {
                currency: true,
                price: true,
                comparedAtPrice: true,
                name: true,
                id: true,
                features: true,
                maxCollections: true
            }
        })

        return plans
    })

