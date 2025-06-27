"use client"

import { useEffect, useRef } from "react"
import { useInView } from "framer-motion"


export default function InkRevealSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })

  useEffect(() => {
    const loadAnime = async () => {
      const animeModule = await import("animejs");

      const anime = animeModule.default || animeModule
      if (isInView && svgRef.current) {
        anime({
          targets: svgRef.current?.querySelector(".ink-path"),
          d: [
            {
              value:
                "M0,0 C100,0 100,0 200,0 C300,0 300,0 400,0 C500,0 500,0 600,0 C700,0 700,0 800,0 C900,0 900,0 1000,0 V100 H0 Z",
            },
            {
              value:
                "M0,0 C100,20 100,-20 200,0 C300,20 300,-20 400,0 C500,20 500,-20 600,0 C700,20 700,-20 800,0 C900,20 900,-20 1000,0 V100 H0 Z",
            },
            {
              value:
                "M0,0 C100,40 100,-40 200,0 C300,40 300,-40 400,0 C500,40 500,-40 600,0 C700,40 700,-40 800,0 C900,40 900,-40 1000,0 V100 H0 Z",
            },
            {
              value:
                "M0,0 C100,80 100,-80 200,0 C300,80 300,-80 400,0 C500,80 500,-80 600,0 C700,80 700,-80 800,0 C900,80 900,-80 1000,0 V100 H0 Z",
            },
          ],
          easing: "easeOutQuad",
          duration: 2000,
          complete: () => {
            if (textRef.current) {
              anime({
                targets: textRef.current,
                opacity: [0, 1],
                translateY: [20, 0],
                delay: 300,
                duration: 800,
                easing: "easeOutQuad",
              })
            }
          },
        })
      }
    }

    loadAnime()
  }, [isInView])

  return (
    <div ref={sectionRef} className="relative py-24 bg-black overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* SVG mask for ink reveal */}
          <svg
            ref={svgRef}
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <defs>
              <mask id="inkMask">
                <rect width="100%" height="100%" fill="white" />
                <path
                  className="ink-path"
                  d="M0,0 C100,0 100,0 200,0 C300,0 300,0 400,0 C500,0 500,0 600,0 C700,0 700,0 800,0 C900,0 900,0 1000,0 V100 H0 Z"
                  fill="black"
                />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#inkGradient)" mask="url(#inkMask)" opacity="0.9" />
            <linearGradient id="inkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </svg>

          {/* Content that will be revealed */}
          <div
            ref={textRef}
            className="relative z-10 max-w-4xl mx-auto text-center opacity-0"
            style={{ willChange: "opacity, transform" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Preserving Heritage Through{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
                Innovation
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Our platform connects skilled artisans from rural communities directly with global markets, ensuring fair
              compensation and authentic provenance through blockchain technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}