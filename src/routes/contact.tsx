import { Link } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'

export const Route = createFileRoute('/contact')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <main className="contact-page wrap max-w-5xl mx-auto flex flex-col justify-center">
            <div className='contact-layout grid grid-cols-2 gap-[15%] pt-18 pb-15'>
                <div className='relative'>
                    <h1 className='text-7xl'>Let's <span className='text-cyan-dark'>talk.</span></h1>

                    <div className='contact-prompts mt-8 text-[16px] leading-[1.8]'>
                        <p>Have an idea?</p>
                        <p>Found something broken?</p>
                        <p>Build something with NepTune?</p>
                    </div>

                    <p className='contact-intro text-xs text-muted mt-5'>
                        We're interested in the things <br /> you're thinking about.
                    </p>

                    <div className='contact-ring'>

                    </div>
                </div>

                <div className='contact-form-column pt-1.5'>
                    <div className='form-topline flex items-center justify-between mb-8'>
                        <span className='mono text-[8px] text-[#7d9095]'>
                            Your words, a little space
                        </span>
                        <ArrowUpRight className='text-cyan-dark' size={18} strokeWidth={1} />
                    </div>

                    {/* TODO: Add Form */}


                </div>
            </div>

            <div className='contact-bottom flex justify-between items-center gap-7.5 pt-7.5 pb-9 border-t border-t-line'>
                <span className='mono text-[8px] text-[#7d9095]'>
                    Good questions are a good beginning.
                </span>
                <Link className='text-button text-xs flex justify-center items-center' to="/">First, a little about us <ArrowUpRight size={18} /></Link>
            </div>
        </main>
    )
}
