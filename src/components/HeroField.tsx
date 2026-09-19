import { useRef, useState } from "react"

export default function HeroField() {
    const [selected, setSelected] = useState(0)
    const [paused, setPaused] = useState(false)
    const canvasRef = useRef(null)
    const stageRef = useRef(null)

    const focusNode = (index, element) => {
        const stage = stageRef.current.getBoundaryClientRect()
        const rectangle = element.getBoundaryClientRect()
        }

    return (
        <section>

            <canvas ref={canvasRef} aria-hidden />

            <div className="flex items-center justify-between pt-5 relative z-4 wrap">
                <h1>Your Intelligence, <br /> <span> everywhere. </span></h1>
                <p>Everything you know. Everything that makes you, you. <br /> One Intelligence, connected to the applications you choose. </p>

                <div>
                    <button>
                        Explore the idea
                    </button>
                </div>
            </div>
        </section>
    )
}