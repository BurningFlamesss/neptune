import { Link } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'

export const Route = createFileRoute('/contact')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <main>
            <div>
                <span>A conversation starts somewhere</span>
                <span>NepTune / Contact</span>
            </div>

            <div>
                <div>
                    <h1>Let's<br /> talk.</h1>

                    <div>
                        <p>Have an idea?</p>
                        <p>Found something broken?</p>
                        <p>Build something with NepTune?</p>
                    </div>

                    <p>
                        We're interested in the things <br /> you're thinking about.
                    </p>

                    <div>

                    </div>
                </div>

                <div>
                    <div>
                        <span>
                            Your words, a little space
                        </span>
                        <ArrowUpRight size={18} strokeWidth={1} />
                    </div>

                    {/* TODO: Add Form */}


                </div>
            </div>

            <div>
                <span>
                    Good questions are a good beginning.
                </span>
                <Link to="/">First, a little about us <ArrowUpRight/></Link>
            </div>
        </main>
    )
}
