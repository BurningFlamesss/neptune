import { authClient } from '#/lib/auth-client'
import { Link, useLoaderData } from '@tanstack/react-router'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import React, { Activity, useState } from 'react';

function Navbar() {
    const { data } = authClient.useSession()
    const isValidUser = data?.user.id
    const user = data?.user

    const serverData = useLoaderData({ from: "__root__" })
    const plan = serverData?.plan

    const collections = serverData?.collections

    const [collectionOptions, setCollectionOptions] = useState<string>("")
    const [type, setType] = useState<string>("")
    const [existingCollectionId, setExistingCollectionId] = useState<string>("")

    const capture = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)

        const resolvedCollection = collectionOptions === "create-your-own" ? formData.get("newCollectionName") : formData.get("exisitingCollectionId")

        const payload = {
            title: formData.get("title"),
            content: formData.get("content"),
            type: formData.get("type"),
            collectionMode: collectionOptions,
            collection: resolvedCollection
        }

        console.log("Sending to the server.... ", payload)
    }

    return (
        <header className='max-w-6xl mx-auto flex flex-row items-center justify-between'>
            <Link to="/" className='cursor-pointer'>
                NEPTUNE
            </Link>
            <nav className='flex flex-row'>
                <ul className='flex flex-row items-center justify-center gap-6'>
                    <Link to='/about' className='cursor-pointer hover:border-b'>About</Link>
                    <Link to='/pricing' className='cursor-pointer hover:border-b'>Pricing</Link>
                    <Link to='/contact' className='cursor-pointer hover:border-b'>Contact</Link>
                    <Link to='/developer' className='cursor-pointer hover:border-b'>Developer</Link>
                    <Link to='/dashboard' className='cursor-pointer hover:border-b'>Dashboard</Link>
                </ul>
            </nav>
            <div className='flex flex-row items-center justify-center isolate relative'>
                {isValidUser ? (
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

                                        <Label className="mb-4" htmlFor="type">Type</Label>
                                        <Select name="type" value={type} onValueChange={setType}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="KNOWLEDGE">KNOWLEDGE</SelectItem>
                                                    <SelectItem value="SKILL">SKILL</SelectItem>
                                                    <SelectItem value="AGENT">AGENT</SelectItem>
                                                    <SelectItem value="RESEARCH">RESEARCH</SelectItem>
                                                    <SelectItem value="PREFERENCE">PREFERENCE</SelectItem>
                                                    <SelectItem value="WORKFLOW">WORKFLOW</SelectItem>
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
                                        <button className='app-button bg-cyan-dark!'>Capture</button>
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
                ) : (
                    <>
                        <Link to='/signup' className='app-button bg-cyan-dark! [clip-path:polygon(16px_0,100%_0,100%_100%,0_100%,0_16px)]!'>SignUp</Link>
                        <Link to='/login' className='app-button'>Login</Link>
                    </>
                )}
            </div>
        </header>
    )
}

export default Navbar