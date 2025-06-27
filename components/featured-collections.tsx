"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronRight } from "lucide-react"

export default function FeaturedCollections() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const x1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const x2 = useTransform(scrollYProgress, [0, 1], [0, 200])

  const collections = [
    { id: 1, name: "Bored Ape Yacht Club", items: 10000, floor: "68.49 ETH" },
    { id: 2, name: "CryptoPunks", items: 10000, floor: "63.95 ETH" },
    { id: 3, name: "Azuki", items: 10000, floor: "11.75 ETH" },
    { id: 4, name: "Doodles", items: 10000, floor: "5.97 ETH" },
    { id: 5, name: "CloneX", items: 20000, floor: "9.49 ETH" },
    { id: 6, name: "Moonbirds", items: 10000, floor: "8.49 ETH" },
  ]

  const collections2 = [
    { id: 7, name: "Pudgy Penguins", items: 8888, floor: "6.23 ETH" },
    { id: 8, name: "Meebits", items: 20000, floor: "3.89 ETH" },
    { id: 9, name: "Otherdeed", items: 100000, floor: "1.82 ETH" },
    { id: 10, name: "World of Women", items: 10000, floor: "2.94 ETH" },
    { id: 11, name: "Mutant Ape Yacht Club", items: 20000, floor: "13.8 ETH" },
    { id: 12, name: "Cool Cats", items: 9999, floor: "2.1 ETH" },
  ]

  return (
    <section ref={containerRef} className="py-16 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <div className="flex justify-between items-center">
          <motion.h2
            className="text-3xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Featured Collections
          </motion.h2>

          <motion.button
            className="flex items-center gap-1 text-blue-500 hover:text-blue-400 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ x: 5 }}
          >
            View All <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* First row - scrolls left */}
      <motion.div className="flex gap-4 mb-4 px-4" style={{ x: x1 }}>
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            name={collection.name}
            items={collection.items}
            floor={collection.floor}
          />
        ))}
      </motion.div>

      {/* Second row - scrolls right */}
      <motion.div className="flex gap-4 px-4" style={{ x: x2 }}>
        {collections2.map((collection) => (
          <CollectionCard
            key={collection.id}
            name={collection.name}
            items={collection.items}
            floor={collection.floor}
          />
        ))}
      </motion.div>
    </section>
  )
}

interface CollectionCardProps {
  name: string
  items: number
  floor: string
}

function CollectionCard({ name, items, floor }: CollectionCardProps) {
  return (
    <motion.div
      className="flex-shrink-0 w-[280px] bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
      whileHover={{
        y: -5,
        boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.3)",
      }}
    >
      <div className="relative h-[140px] overflow-hidden">
        <Image
          src="/placeholder.svg?height=140&width=280"
          alt={name}
          width={280}
          height={140}
          className="object-cover w-full h-full"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
            <Image
              src="/placeholder.svg?height=48&width=48"
              alt={`${name} logo`}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>

          <div className="flex-1 truncate">
            <h3 className="font-semibold text-white truncate">{name}</h3>
          </div>
        </div>
      </div>

      <div className="p-4 flex justify-between">
        <div>
          <p className="text-xs text-gray-400">Items</p>
          <p className="font-medium">{items.toLocaleString()}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400">Floor</p>
          <p className="font-medium">{floor}</p>
        </div>
      </div>
    </motion.div>
  )
}
