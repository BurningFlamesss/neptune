import { authClient } from '#/lib/auth-client'
import { Link, useLoaderData } from '@tanstack/react-router'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'

function Navbar() {
    const { data } = authClient.useSession()
    const isValidUser = data?.user.id
    const user = data?.user

    const { plan } = useLoaderData({ from: "__root__" })

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
                                <DrawerHeader>
                                    <DrawerTitle>Capture a Knowledge</DrawerTitle>
                                    <DrawerDescription>DEMO ONLY</DrawerDescription>
                                </DrawerHeader>
                                <section className='flex-1 scroll-fade overflow-y-auto p-4'>
                                    <label htmlFor="title">Title</label>
                                    <input type="text" name="title" id="title" /> <br />
                                    <label htmlFor="content">Content</label>
                                    <textarea name="content" id="content" ></textarea> <br />
                                    <label htmlFor="type">Type</label>
                                    <input type="text" name="type" id="type" /> <br />

                                    <label htmlFor="collection">Collection</label>
                                    <input type="text" name="collection" id="collection" />
                                </section>
                                <DrawerFooter className='flex flex-row items-center justify-between'>
                                    <button className='app-button bg-cyan-dark!'>Capture</button>
                                    <DrawerClose>
                                        <button className='app-button bg-destructive! [clip-path:polygon(16px_0,100%_0,100%_100%,0_100%,0_16px)]!'>Close</button>
                                    </DrawerClose>
                                </DrawerFooter>
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