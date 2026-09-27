import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import React, { Activity, useState } from 'react';
import { createUserEntries } from '#/functions/knowledge.tsx';
import { Link, useLoaderData, useRouteContext, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { authClient } from '#/lib/auth-client.ts';
import { router } from 'better-auth/api';

type EntryTypeOption =
    "MEMORY" |
    "NOTE" |
    "REFERENCE" |
    "CODE" |
    "DOCUMENT" |
    "SKILL" |
    "WORKFLOW" |
    "DECISION" |
    "PROMPT" |
    "CUSTOM"


type RecallPolicyOption =
    "AUTOMATIC" |
    "WHEN_RELEVANT" |
    "MANUAL" |
    "EXCLUDED"

const ENTRY_TYPES: EntryTypeOption[] = ["MEMORY", "NOTE", "REFERENCE", "CODE", "DOCUMENT", "SKILL", "WORKFLOW", "DECISION", "PROMPT", "CUSTOM"]
const RECALL_POLICY: RecallPolicyOption[] = ["AUTOMATIC", "WHEN_RELEVANT", "MANUAL", "EXCLUDED"]


function UserNav() {
    const router = useRouter()
    const context = useRouteContext({ from: "__root__" })
    const user = context.session?.user
    const serverData = useLoaderData({ from: "__root__" })
    const plan = serverData?.plan

    const collections = serverData?.collections

    const [collectionOptions, setCollectionOptions] = useState<string>("create-your-own")
    const [type, setType] = useState<EntryTypeOption>("MEMORY")
    const [recallPolicy, setRecallPolicy] = useState<RecallPolicyOption>("WHEN_RELEVANT")
    const [existingCollectionId, setExistingCollectionId] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!user) {
        return "No user data"
    }

    const capture = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const form = event.currentTarget
        const formData = new FormData(form)

        const title = (formData.get("title") as string)?.trim()
        const content = (formData.get("content") as string)?.trim()
        const rawTags = formData.get("tags") as string ?? ""

        if (!title || !content) {
            toast.error("Title and content are required")
            return
        }

        const tags = rawTags.split(",").map(tag => tag.trim()).filter(Boolean)

        const payload = {
            title,
            content,
            type: (type || formData.get("type") as EntryTypeOption) ?? "",
            tags,
            recallPolicy,
            state: "CONFIRMED" as const,
            origin: "USER" as const
        }

        const isCreatingCollection = collectionOptions === "create-your-own"

        const collectionPayload = {
            create: isCreatingCollection,
            collectionId: isCreatingCollection ? undefined : (existingCollectionId || (formData.get("exisitingCollectionId") as string)),
            collectionName: isCreatingCollection ? ((formData.get("newCollectionName") as string).trim() || "Untitled Collection") : undefined
        }

        if (!isCreatingCollection && !collectionPayload.collectionId) {
            toast.error("Please select an existing collection")
            return
        }

        console.log("Sending to the server.... ", {
            userId: user.id,
            collection: {
                ...collectionPayload
            },
            payload: {
                ...payload
            }
        })

        try {
            setIsSubmitting(true)

            await createUserEntries({
                data: {
                    userId: user.id,
                    collection: {
                        ...collectionPayload
                    },
                    payload: {
                        ...payload
                    }
                }
            })

            toast.success("Entry capture successfully!!!")
            form.reset()
            await router.invalidate()
        } catch (error) {
            toast.error("Error")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Drawer direction='right'>
                <DrawerTrigger className='app-button bg-cyan-dark! [clip-path:polygon(16px_0,100%_0,100%_100%,0_100%,0_16px)]! cursor-pointer'>
                    <button className='cursor-pointer'>Capture</button>
                </DrawerTrigger>
                <DrawerContent>
                    <form onSubmit={capture} action="#" method="post" className="flex flex-col h-full">
                        <DrawerHeader>
                            <DrawerTitle>Capture a Knowledge</DrawerTitle>
                            <DrawerDescription>DEMO ONLY</DrawerDescription>
                        </DrawerHeader>
                        <main className='flex-1 scroll-fade overflow-y-auto p-4'>

                            <Label htmlFor="title">Title</Label>
                            <input type="text" name="title" id="title" /> <br />

                            <Label htmlFor="content">Content</Label>
                            <textarea name="content" id="content" ></textarea> <br />

                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <input
                                type="text"
                                name="tags"
                                id="tags"
                                placeholder="e.g. preference, journal#number"
                            />
                            <br />

                            <Label className="mb-4" htmlFor="type">Type</Label>
                            <Select name="type" value={type} onValueChange={value => setType(value as EntryTypeOption)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {
                                            ENTRY_TYPES.map(entry_type => <SelectItem key={`select-entry-${entry_type}`} value={entry_type}>{entry_type}</SelectItem>)
                                        }
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <Label className="mb-4" htmlFor="recallPolicy">Recall Policy</Label>
                            <Select name="recallPolicy" value={recallPolicy} onValueChange={value => setRecallPolicy(value as RecallPolicyOption)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="recall policy" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {
                                            RECALL_POLICY.map(recall_policy => <SelectItem key={`select-policy-${recall_policy}`} value={recall_policy}>{recall_policy}</SelectItem>)
                                        }
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <Label className="mt-6 mb-4" htmlFor="collection">Collection</Label>
                            <RadioGroup name="collectionMode" value={collectionOptions} onValueChange={setCollectionOptions} >
                                <section className="flex flex-col items-start gap-2 mb-2">
                                    <div className="flex flex-row items-center gap-2">
                                        <RadioGroupItem className="cursor-pointer" value="create-your-own" id="create-your-own" />
                                        <Label className="cursor-pointer" htmlFor="create-your-own">A new Collection</Label>
                                    </div>
                                    <Activity mode={collectionOptions === "create-your-own" ? "visible" : "hidden"} >
                                        <div className="ml-6">
                                            <input type="text" name="newCollectionName" id="name" placeholder="Collection Name" />
                                        </div>
                                    </Activity>
                                </section>
                                <section className="flex flex-col items-start gap-2 mb-4">
                                    <div className="flex flex-row items-center gap-2">
                                        <RadioGroupItem className="cursor-pointer" value="choose-existing" id="choose-existing" />
                                        <Label className="cursor-pointer" htmlFor="choose-existing">
                                            A collection I choose
                                        </Label>
                                    </div>
                                    <Activity mode={collectionOptions === "choose-existing" ? "visible" : "hidden"}>
                                        <div className="ml-6">
                                            <Select name="exisitingCollectionId" value={existingCollectionId} onValueChange={setExistingCollectionId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pick a Collection" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {collections?.length > 0 ? collections?.map((collection, index) => {
                                                        return (
                                                            <SelectItem value={collection.id} key={collection.id}>
                                                                {collection.name}
                                                            </SelectItem>
                                                        )
                                                    }) : <SelectItem value="no-collection" disabled>No Collection Found</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </Activity>
                                </section>
                            </RadioGroup>
                        </main>
                        <DrawerFooter className='flex flex-row items-center justify-between'>
                            <button type='submit' disabled={isSubmitting} className='app-button bg-cyan-dark!'>
                                {isSubmitting ? "Capturing..." : "Capture"}
                            </button>
                            <DrawerClose>
                                <button className='app-button bg-destructive! [clip-path:polygon(16px_0,100%_0,100%_100%,0_100%,0_16px)]!'>Close</button>
                            </DrawerClose>
                        </DrawerFooter>
                    </form>
                </DrawerContent>
            </Drawer>

            <DropdownMenu>
                <DropdownMenuTrigger className='app-button cursor-pointer'>
                    <button className='cursor-pointer'>Profile</button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>
                            Profile
                        </DropdownMenuLabel>
                        <DropdownMenuItem>
                            {user?.name} ({plan?.name})
                        </DropdownMenuItem>
                        <Link to='/recall' className='cursor-pointer'>
                            <DropdownMenuItem className='cursor-pointer'>
                                Recall
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem onClick={async () => {
                            await authClient.signOut()
                        }}>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export default UserNav