import { useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { FIELD_CENTERS } from "./maths"
import { Link } from "@tanstack/react-router"

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

                <div className="flex items-center justify-between relative z-4 wrap">
                    <div className="relative text-center mx-auto z-2">
                        <h1 className="text-7xl font-medium mb-5">Your Intelligence, <br /> <span className="text-cyan-dark"> everywhere. </span></h1>
                        <p className="text-sm py-6 text-[#65777c]">Everything you know. Everything that makes you, you. <br /> One Intelligence, connected to the applications you choose. </p>

                        <div className="flex items-center justify-center gap-7 mt-6">
                            <button className="min-h-12 text-xs px-5.5 gap-7">
                                <Link className="flex flex-row w-full items-center justify-center gap-3 min-h-11 text-xs relative group" to="/">
                                    <div className="absolute bottom-1.25 left-0 right-0 h-px bg-cyan-dark scale-0 group-hover:scale-100 origin-left transition-transform duration-300 ease-linear" />
                                    Explore the idea <ArrowUpRight size={15} />
                                </Link>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}