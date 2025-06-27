"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import NFTCard from "./nft-card"

export default function TrendingSection() {
  const [category, setCategory] = useState("all")
  const [isOpen, setIsOpen] = useState(false)

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "art", name: "Art" },
    { id: "collectibles", name: "Collectibles" },
    { id: "domain", name: "Domain Names" },
    { id: "music", name: "Music" },
    { id: "photography", name: "Photography" },
    { id: "sports", name: "Sports" },
    { id: "trading", name: "Trading Cards" },
  ]

  const nfts = [
    { id: 1, title: "Abstract Illusion #024", creator: "ArtistOne", price: "0.45 ETH", category: "art" },
    { id: 2, title: "Crypto Punk #3429", creator: "CryptoPunks", price: "12.5 ETH", category: "collectibles" },
    { id: 3, title: "Bored Ape #6583", creator: "BoredApeYC", price: "86.2 ETH", category: "collectibles" },
    { id: 4, title: "Moonbirds #2137", creator: "Moonbirds", price: "8.9 ETH", category: "collectibles" },
    { id: 5, title: "Azuki #9839", creator: "Azuki", price: "11.2 ETH", category: "art" },
    { id: 6, title: "Doodle #8364", creator: "Doodles", price: "6.1 ETH", category: "art" },
    { id: 7, title: "CloneX #12583", creator: "RTFKT", price: "9.8 ETH", category: "collectibles" },
    { id: 8, title: "Meebits #17832", creator: "Meebits", price: "4.2 ETH", category: "collectibles" },
  ]

  const filteredNFTs = category === "all" ? nfts : nfts.filter((nft) => nft.category === category)

  return (
    <section className="py-16 container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <motion.h2
          className="text-3xl font-bold mb-4 md:mb-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Trending in{" "}
          <span className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="text-blue-500 flex items-center gap-1">
              {categories.find((c) => c.id === category)?.name}
              <ChevronDown className="h-5 w-5" />
            </button>

            {isOpen && (
              <motion.div
                className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl z-20 py-1 border border-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                      cat.id === category ? "text-blue-500" : "text-white"
                    }`}
                    onClick={() => {
                      setCategory(cat.id)
                      setIsOpen(false)
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </motion.div>
            )}
          </span>
        </motion.h2>

        <motion.div
          className="hidden md:flex gap-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                cat.id === category ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredNFTs.map((nft, index) => (
          <motion.div
            key={nft.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <NFTCard title={nft.title} creator={nft.creator} price={nft.price} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
