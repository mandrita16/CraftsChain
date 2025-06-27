"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Parallax effect for the background image
      gsap.to(".hero-bg", {
        y: "30%",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })

      // Text animation
      gsap.to(textRef.current, {
        y: "100%",
        opacity: 0,
        ease: "power2.in",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "center center",
          end: "bottom top",
          scrub: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="relative h-screen overflow-hidden">
      {/* Background image with parallax */}
      <div className="hero-bg absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-110">
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"
          style={{ 
            backgroundImage: `
            linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)), 
            url('https://cdn.pixabay.com/photo/2024/02/20/20/28/sculpture-8586186_1280.jpg')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          //filter: "blur(12px)",
          opacity: 0.5,
           }}
          ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div ref={textRef} className="max-w-3xl">
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Authentic Bengal Handicrafts on the Blockchain
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Connecting traditional craftsmanship with modern technology to create a transparent, fair marketplace for
              authentic handcrafted goods.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="./market-place"><button className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-red-600 text-white font-medium text-lg hover:shadow-lg hover:shadow-amber-500/20 transition-all">
                Explore Marketplace
              </button></Link>
              <button className="px-8 py-3 rounded-full border-2 border-white/20 text-white font-medium text-lg hover:bg-white/10 transition-all">
                Learn More
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <p className="text-sm text-gray-400 mb-2">Scroll to discover</p>
        <motion.div
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center p-1"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        >
          <motion.div className="w-1.5 h-1.5 bg-white rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  )
}
