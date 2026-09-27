import { sessionMiddleware } from "#/middleware/authentication";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const getCollectionsOfUserParamSchema = z.object({
    userId: z.string().optional(),
    areaId: z.string().optional()
})

export const getCollectionsOfUser = createServerFn()
    .middleware([sessionMiddleware])
    .validator(getCollectionsOfUserParamSchema)
    .handler(async ({ data, context }) => {
        const { prisma } = await import("#/db.ts")

        const userId = data?.userId || context.session?.user.id

        if (!userId) {
            throw new Error("Unauthorized")
        }


        const collections = await prisma.collection.findMany({
            where: {
                userId,
                ...(data?.areaId ? { areaId: data.areaId } : {})
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                version: true,
                visibility: true,
                entryCount: true,
                isVirtualMount: true,
                syncMode: true,
                areaId: true,
                parentId: true,
                area: {
                    select: {
                        id: true,
                        name: true,
                        kind: true
                    }
                },
                entries: {
                    where: {
                        state: {
                            not: "REJECTED"
                        }
                    },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        content: true,
                        type: true,
                        version: true,
                        tags: true,
                        state: true,
                        recallPolicy: true,
                        origin: true,
                        confidenceScore: true,
                        expiresAt: true,
                        archivedAt: true,
                        metadata: true,
                        collectionId: true,
                        appMemoryId: true,
                        userId: true,
                        authorId: true,
                        sourcePackId: true,
                        upstreamEntryId: true,
                        citationCount: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        })

        return collections
    })

const createUserEntriesParamSchema = z.object({
    userId: z.string().optional(),
    payload: z.object({
        title: z.string(),
        content: z.string(),
        type: z.enum(["MEMORY", "NOTE", "REFERENCE", "CODE", "DOCUMENT", "SKILL", "WORKFLOW", "DECISION", "PROMPT", "CUSTOM"]),
    }),
    collection: z.object({
        create: z.boolean().default(true),
        collectionName: z.string().optional(),
        collectionId: z.string().optional()
    })
})

export const createUserEntries = createServerFn()
    .middleware([sessionMiddleware])
    .validator(createUserEntriesParamSchema)
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
                    userId,
                    slug: data.collection.collectionName ?? ""
                }
            })

            collectionId = collection.id
        } else {
            collectionId = data.collection.collectionId ?? ""
        }

        return await prisma.entry.create({
            data: {
                userId,
                title: data.payload.title,
                content: data.payload.content,
                type: data.payload.type,
                collectionId,
                authorId: userId,
            }
        })
    })