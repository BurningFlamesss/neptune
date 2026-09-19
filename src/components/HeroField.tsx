import { useRef, useState } from "react"
import { FIELD_CENTERS } from "./maths"

const CONCEPTS = [
    {
        id: "knowledge",
        label: "Knowledge",
        index: "01",
        detail: "",
        note: "WHAT YOU KNOW",
        center: FIELD_CENTERS[0]
    },
    {
        id: "skills",
        label: "Skills",
        index: "02",
        detail: "",
        note: "WHAT YOU CAN DO",
        center: FIELD_CENTERS[1]
    },
    {
        id: "context",
        label: "Context",
        index: "03",
        detail: "",
        note: "WHAT MAKES YOU, YOU",
        center: FIELD_CENTERS[2]
    },
    {
        id: "research",
        label: "research",
        index: "04",
        detail: "",
        note: "WHAT YOU DISCOVERS",
        center: FIELD_CENTERS[3]
    },
]

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
        <section className="bg-paper relative">

            <div className="relative isolate w-full h-190 min-h-160 overflow-hidden" ref={stageRef}>
                <canvas ref={canvasRef} aria-hidden />

                <div className="flex items-center justify-between pt-5 relative z-4 wrap">
                    <div className="relative text-center m-[38px_auto_0] z-2">
                        <h1>Your Intelligence, <br /> <span> everywhere. </span></h1>
                        <p>Everything you know. Everything that makes you, you. <br /> One Intelligence, connected to the applications you choose. </p>

                        <div>
                            <button>
                                Explore the idea
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}