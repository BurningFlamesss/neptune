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
        const { prisma } = await import("#/db.ts")

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

const createUserAssetParamSchema = z.object({
    userId: z.string().optional(),
    payload: z.object({
        title: z.string(),
        content: z.string(),
        type: z.enum(["KNOWLEDGE", "SKILL", "AGENT", "RESEARCH", "PREFERENCE", "WORKFLOW"]),
    }),
    collection: z.object({
        create: z.boolean().default(true),
        collectionName: z.string().optional(),
        collectionId: z.string().optional()
    })
})

export const createUserAsset = createServerFn()
    .middleware([sessionMiddleware])
    .validator(createUserAssetParamSchema)
    .handler(async ({ data, context }) => {
        const { prisma } = await import("#/db")

        if (!data.userId || !context.session?.user.id) {
            throw new Error("Unauthorized")
        }

        const userId = data.userId || context.session.user.id

        let collectionId = ""

        if (data.collection.create) {
            const collection = await prisma.collection.create({
                data: {
                    name: data.collection.collectionName ?? "",
                    userId
                }
            })

            collectionId = collection.id
        } else {
            collectionId = data.collection.collectionId ?? ""
        }

        return await prisma.asset.create({
            data: {
                userId,
                title: data.payload.title,
                content: data.payload.content,
                type: data.payload.type,
                collectionId
            }
        })
    })