"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import anime from "animejs"

export default function NFTMintSection() {
  const [activeNFT, setActiveNFT] = useState(0)
  const [isMinting, setIsMinting] = useState(false)
  const mintEffectRef = useRef<HTMLDivElement>(null)

  const nfts = [
    {
      id: 1,
      name: "Kantha Embroidery Collection",
      description: "Limited edition digital collectibles representing authentic Kantha embroidery from West Bengal.",
      image: "/placeholder.svg?height=600&width=600",
      price: "0.12 ETH",
    },
    {
      id: 2,
      name: "Terracotta Heritage Series",
      description: "Digital ownership of traditional terracotta art pieces with certificate of authenticity.",
      image: "/placeholder.svg?height=600&width=600",
      price: "0.08 ETH",
    },
    {
      id: 3,
      name: "Handloom Textile Tokens",
      description: "Exclusive NFTs representing handloom textiles with royalties supporting artisan communities.",
      image: "/placeholder.svg?height=600&width=600",
      price: "0.15 ETH",
    },
  ]

  const handleMint = () => {
    setIsMinting(true)

    // NFT mint spark animation
    if (mintEffectRef.current) {
      anime({
        targets: ".mint-particle",
        translateX: () => anime.random(-100, 100),
        translateY: () => anime.random(-100, 100),
        scale: [
          { value: 1, duration: 0 },
          { value: anime.random(1.5, 3), duration: 1000 },
          { value: 0, duration: 1000 },
        ],
        opacity: [
          { value: 1, duration: 0 },
          { value: 1, duration: 800 },
          { value: 0, duration: 400 },
        ],
        easing: "easeOutExpo",
        duration: 2000,
        delay: anime.stagger(100),
        complete: () => {
          setIsMinting(false)
        },
      })
    }
  }

  // Create particles for the mint effect
  const particles = Array.from({ length: 20 }).map((_, i) => (
    <div
      key={i}
      className="mint-particle absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-amber-500 opacity-0"
      style={{
        transform: "translate(-50%, -50%)",
      }}
    />
  ))

  return (
    <section id="nft" className="py-24 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold mb-4">NFT Marketplace</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Collect digital certificates of authentic handcrafted items, supporting artisans and preserving cultural
            heritage.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* NFT Display */}
          <div className="relative">
            <div ref={mintEffectRef} className="relative aspect-square max-w-md mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNFT}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-square rounded-2xl overflow-hidden border-2 border-amber-500/50"
                >
                  <Image
                    src={nfts[activeNFT].image || "/placeholder.svg"}
                    alt={nfts[activeNFT].name}
                    width={600}
                    height={600}
                    className="object-cover w-full h-full"
                  />

                  {/* NFT mint spark animation particles */}
                  {isMinting && particles}

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-red-600/10 pointer-events-none"></div>
                  <div className="absolute inset-0 animate-shimmer bg-[length:200%_100%] pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* NFT Selector */}
            <div className="flex justify-center mt-6 gap-3">
              {nfts.map((nft, index) => (
                <button
                  key={nft.id}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeNFT === index ? "bg-cyan-500 scale-125" : "bg-gray-600 hover:bg-gray-500"
                  }`}
                  onClick={() => setActiveNFT(index)}
                />
              ))}
            </div>
          </div>

          {/* NFT Info */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNFT}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-3xl font-bold mb-3">{nfts[activeNFT].name}</h3>
                <p className="text-gray-300 mb-6">{nfts[activeNFT].description}</p>

                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Price</span>
                    <span className="text-xl font-bold">{nfts[activeNFT].price}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Creator Royalty</span>
                    <span>10%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Authenticity</span>
                    <span className="text-green-500">Verified ✓</span>
                  </div>
                </div>

                <motion.button
                  className="w-full py-4 rounded-xl relative overflow-hidden group"
                  onClick={handleMint}
                  disabled={isMinting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Button background with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-red-600"></div>

                  {/* Glowing effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-white/20 blur-xl"></div>
                  </div>

                  {/* Button text */}
                  <span className="relative z-10 text-white font-bold text-lg">
                    {isMinting ? "Minting..." : "Mint NFT"}
                  </span>
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
