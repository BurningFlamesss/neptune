import { sessionMiddleware } from "#/middleware/authentication";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const getCollectionsOfUserParamSchema = z.object({
    userId: z.string().optional()
})

export const getCollectionsOfUser = createServerFn()
    .middleware([sessionMiddleware])
    .validator(getCollectionsOfUserParamSchema)
    .handler(async ({ data, context }) => {
        const {prisma} = await import("#/db.ts")
        
        if (!data.userId || !context.session?.user.id) {
			throw new Error("Unauthorized")
		}

		const userId = data.userId || context.session.user.id

        const collections = await prisma.collection.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                name: true,
                description: true,
                version: true,
                visibility: true,
                assets: true,
            }
        })

        return collections
    })