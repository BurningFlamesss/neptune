import { authClient } from '#/lib/auth-client'
import { Link } from '@tanstack/react-router'
import UserNav from './UserNav';

function Navbar() {
    const { data } = authClient.useSession()
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
                    <Link to='/dashboard' className='cursor-pointer hover:border-b'>Dashboard</Link>
                </ul>
            </nav>
            <div className='flex flex-row items-center justify-center isolate relative'>
                {user ? (
                    <UserNav user={user} />
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