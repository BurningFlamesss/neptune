import { sessionMiddleware } from "#/middleware/authentication";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import slugify from "slugify"

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
        slug: z.string().optional(),
        content: z.string(),
        type: z.enum(["MEMORY", "NOTE", "REFERENCE", "CODE", "DOCUMENT", "SKILL", "WORKFLOW", "DECISION", "PROMPT", "CUSTOM"]),
        tags: z.array(z.string()).optional().default([]),
        state: z.enum(["SUGGESTED", "CONFIRMED", "REJECTED", "ARCHIVED"]).optional(),
        recall_policy: z.enum(["AUTOMATIC", "WHEN_RELEVANT", "MANUAL", "EXCLUDED"]).optional(),
        origin: z.enum(["USER", "APP", "COMMUNITY", "IMPORTED", "CONNECTED_SOURCE", "RECALL"]).optional().default("USER"),
        appMemoryId: z.string().optional()
    }),
    collection: z.object({
        create: z.boolean().default(true),
        collectionName: z.string().optional(),
        collectionSlug: z.string().optional(),
        collectionId: z.string().optional(),
        areaId: z.string().optional()
    })
})

export const createUserEntries = createServerFn()
    .middleware([sessionMiddleware])
    .validator(createUserEntriesParamSchema)
    .handler(async ({ data, context }) => {
        const { prisma } = await import("#/db")

        const userId = data?.userId || context.session?.user.id

        if (!userId) {
            throw new Error("Unauthorized")
        }

        return await prisma.$transaction(async (transaction) => {

            let collectionId = ""

            if (data.collection.create) {
                const name = data.collection.collectionName?.trim() ?? "Untitled Collection"
                const slug = data.collection.collectionSlug?.trim() ?? slugify(name)

                const collection = await prisma.collection.create({
                    data: {
                        name,
                        slug,
                        userId,
                        areaId: data.collection.areaId,
                        entryCount: 1
                    }
                })
                collectionId = collection.id
            } else {
                if (!data.collection.collectionId) {
                    throw new Error("collectionId is required when collection.create is false")
                }

                collectionId = data.collection.collectionId

                await transaction.collection.update({
                    where: {
                        id: collectionId
                    },
                    data: {
                        entryCount: {
                            increment: 1
                        }
                    }
                })
            }


            return await prisma.entry.create({
                data: {
                    userId,
                    authorId: userId,
                    collectionId,
                    appMemoryId: data.payload.appMemoryId,
                    title: data.payload.title,
                    slug: data.payload.slug ?? slugify(data.payload.title),
                    content: data.payload.content,
                    type: data.payload.type,
                    tags: data.payload.tags,
                    state: data.payload.state,
                    recallPolicy: data.payload.recall_policy,
                    origin: data.payload.origin
                }
            })

        })
    })