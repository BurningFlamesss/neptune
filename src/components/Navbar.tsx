import { authClient } from '#/lib/auth-client'
import { Link } from '@tanstack/react-router'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from './ui/dropdown-menu'

function Navbar() {
    const { data } = authClient.useSession()
    const isValidUser = data?.user.id
    const user = data?.user

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
                </ul>
            </nav>
            <div className='flex flex-row items-center justify-center'>
                {isValidUser ? (
                    <>
                        <button className='app-button bg-cyan-dark! [clip-path:polygon(16px_0,100%_0,100%_100%,0_100%,0_16px)]!'>Capture</button>
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
                                        {user?.name}
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