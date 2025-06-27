"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"

export default function ArtisanJourney() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Timeline progress animation
      gsap.to(".timeline-progress", {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: true,
        },
      })

      // Parallax for journey stages
      gsap.utils.toArray(".journey-stage").forEach((stage: any, i) => {
        const direction = i % 2 === 0 ? 1 : -1

        // Image parallax
        gsap.to(stage.querySelector(".stage-image"), {
          y: `${direction * 30}%`,
          ease: "none",
          scrollTrigger: {
            trigger: stage,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        })

        // Content reveal
        gsap.from(stage.querySelector(".stage-content"), {
          x: `${direction * 50}px`,
          opacity: 0,
          scrollTrigger: {
            trigger: stage,
            start: "top 70%",
            end: "top 40%",
            scrub: true,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const stages = [
    {
      title: "Raw Materials",
      description:
        "Ethically sourced materials from local suppliers, ensuring sustainability and supporting local economies.",
      image: "https://cdn.pixabay.com/photo/2020/04/19/12/26/sewing-kit-5063401_1280.jpg",
    },
    {
      title: "Artisan Creation",
      description:
        "Skilled craftspeople transform raw materials into beautiful handcrafted items using traditional techniques passed down through generations.",
      image: "https://cdn.pixabay.com/photo/2022/06/08/15/23/ceramics-7250708_1280.jpg",
    },
    {
      title: "Blockchain Verification",
      description:
        "Each product is registered on the blockchain with a unique digital certificate, ensuring authenticity and traceability.",
      image: "https://cdn.pixabay.com/photo/2018/07/30/11/34/block-chain-3572402_960_720.jpg",
    },
    {
      title: "Global Distribution",
      description:
        "Products are carefully packaged and shipped worldwide, connecting artisans to global markets and fair compensation.",
      image: "https://cdn.pixabay.com/photo/2020/11/03/05/34/workers-5708691_1280.jpg",
    },
  ]

  return (
    <section id="journey" ref={sectionRef} className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold mb-4">The Artisan Journey</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Follow the transformation from raw materials to finished products, with every step verified on the
            blockchain.
          </p>
        </motion.div>

        <div ref={timelineRef} className="relative max-w-5xl mx-auto">
          {/* Timeline progress bar */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-800">
            <div className="timeline-progress w-full bg-gradient-to-b from-cyan-500 to-red-600 h-0"></div>
          </div>

          {/* Journey stages */}
          {stages.map((stage, index) => (
            <div
              key={index}
              className={`journey-stage relative flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-8 mb-24 last:mb-0`}
            >
              {/* Timeline dot */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-red-500 bg-black z-10"></div>

              {/* Image */}
              <div className="stage-image md:w-1/2 overflow-hidden rounded-xl">
                <Image
                  src={stage.image || "/placeholder.svg"}
                  alt={stage.title}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Content */}
              <div className="stage-content md:w-1/2 p-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-2xl font-bold mb-3">{stage.title}</h3>
                  <p className="text-gray-300">{stage.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
