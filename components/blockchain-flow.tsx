"use client"

import { useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Paintbrush, Truck, ShoppingBag, User, ArrowRight } from "lucide-react"

export default function BlockchainFlow() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const flowRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })

  useEffect(() => {
    if (typeof window === "undefined") return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Animate the flow path
      gsap.fromTo(
        ".flow-path",
        { strokeDashoffset: 1000 },
        {
          strokeDashoffset: 0,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: flowRef.current,
            start: "top 70%",
            end: "bottom 70%",
            scrub: 1,
          },
        },
      )

      // Animate the flow nodes
      gsap.utils.toArray(".flow-node").forEach((node: any, i) => {
        gsap.fromTo(
          node,
          { scale: 0.5, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            scrollTrigger: {
              trigger: flowRef.current,
              start: `top 70%`,
              end: `bottom 70%`,
              scrub: 1,
            },
            delay: i * 0.2,
          },
        )
      })

      // Animate the timestamp markers
      gsap.utils.toArray(".timestamp-marker").forEach((marker: any, i) => {
        gsap.fromTo(
          marker,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            scrollTrigger: {
              trigger: flowRef.current,
              start: `top 60%`,
              end: `bottom 60%`,
              scrub: 1,
            },
            delay: i * 0.3 + 0.5,
          },
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const flowSteps = [
    {
      icon: <Paintbrush className="h-8 w-8" />,
      title: "Artisan",
      description: "Creates unique handcrafted product",
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Distributor",
      description: "Verifies and ships the product",
    },
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      title: "Marketplace",
      description: "Lists product with blockchain certificate",
    },
    {
      icon: <User className="h-8 w-8" />,
      title: "Buyer",
      description: "Purchases authentic handcrafted item",
    },
  ]

  return (
    <section id="blockchain" ref={sectionRef} className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold mb-4">Blockchain-Verified Supply Chain</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Every step in the journey is recorded on the blockchain, ensuring transparency and authenticity.
          </p>
        </motion.div>

        {/* Blockchain flow visualization */}
        <div ref={flowRef} className="relative max-w-4xl mx-auto py-16">
          {/* SVG path connecting the nodes */}
          <svg
            className="absolute top-1/2 left-0 w-full h-24 -translate-y-1/2 overflow-visible"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <path
              className="flow-path"
              d="M100,50 C150,50 150,20 200,20 L300,20 C350,20 350,80 400,80 L500,80 C550,80 550,20 600,20 L700,20 C750,20 750,80 800,80 L900,80"
              fill="none"
              stroke="url(#flowGradient)"
              strokeWidth="4"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              strokeLinecap="round"
            />
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#2596be" />
            </linearGradient>

            {/* Timestamp markers */}
            <circle className="timestamp-marker" cx="200" cy="20" r="6" fill="#fff" />
            <circle className="timestamp-marker" cx="400" cy="80" r="6" fill="#fff" />
            <circle className="timestamp-marker" cx="600" cy="20" r="6" fill="#fff" />
            <circle className="timestamp-marker" cx="800" cy="80" r="6" fill="#fff" />
          </svg>

          {/* Flow nodes */}
          <div className="relative flex justify-between">
            {flowSteps.map((step, index) => (
              <div key={index} className="flow-node relative z-10 w-1/4 px-4">
                <div className={`flex flex-col items-center ${index % 2 === 0 ? "pt-0 pb-32" : "pt-32 pb-0"}`}>
                  <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-cyan-500 flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 text-center">{step.description}</p>
                </div>

                {index < flowSteps.length - 1 && (
                  <div
                    className="absolute top-1/2 -right-4 transform translate-x-1/2 -translate-y-1/2 z-20"
                    style={{ color: "#fff" }}
                  >
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional information */}
        <div className="mt-16 max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold mb-4">How Blockchain Verification Works</h3>
          <p className="text-gray-300 mb-6">
            Each product is assigned a unique digital certificate stored on the blockchain. This certificate contains
            information about the artisan, materials used, creation date, and every step in the supply chain. Buyers can
            verify the authenticity of their purchase by scanning a QR code or checking the blockchain record.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-red-600 text-white font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
            <motion.button
              className="px-6 py-3 rounded-lg border border-gray-600 text-white font-medium hover:bg-gray-700/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Demo
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}
