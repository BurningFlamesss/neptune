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
                    <Link to='/developer' className='cursor-pointer hover:border-b'>Dashboard</Link>
                </ul>
            </nav>
            <div className='flex flex-row items-center justify-center'>
                {isValidUser ? (
                    <>
                        <Drawer direction='right'>
                            <DrawerTrigger className='app-button bg-cyan-dark! [clip-path:polygon(16px_0,100%_0,100%_100%,0_100%,0_16px)]!'>
                                <button>Capture</button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader>
                                    <DrawerTitle></DrawerTitle>
                                    <DrawerDescription></DrawerDescription>
                                </DrawerHeader>
                                <section className='flex-1 scroll-fade overflow-y-auto p-4'>

                                </section>
                                <DrawerFooter>
                                    <button>Capture</button>
                                    <DrawerClose>
                                        <button>Close</button>
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
                                    <DropdownMenuItem>
                                        <Link to='/recall'>
                                            Recall
                                        </Link>
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