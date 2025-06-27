"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"

interface NFTCardProps {
  title: string
  creator: string
  price: string
}

export default function NFTCard({ title, creator, price }: NFTCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
      whileHover={{
        y: -5,
        boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.3)",
      }}
    >
      <div className="relative aspect-square">
        <Image
          src="/placeholder.svg?height=400&width=400"
          alt={title}
          width={400}
          height={400}
          className="object-cover w-full h-full"
        />

        <button
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md ${
            isLiked ? "bg-pink-500/20 text-pink-500" : "bg-black/20 text-white hover:bg-black/40"
          } transition-colors`}
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart className={`h-5 w-5 ${isLiked ? "fill-pink-500" : ""}`} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{title}</h3>
        <p className="text-gray-400 text-sm mb-3">by {creator}</p>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400">Current Price</p>
            <p className="font-medium">{price}</p>
          </div>

          <motion.button
            className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium hover:bg-blue-600/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Buy Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
