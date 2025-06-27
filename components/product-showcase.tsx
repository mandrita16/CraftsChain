"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface Product {
  id: number
  name: string
  category: string
  artisan: string
  price: string
  images: string[]
}

export default function ProductShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const categories = [
    { id: "all", name: "All Products" },
    { id: "jute", name: "Jute Crafts" },
    { id: "terracotta", name: "Terracotta" },
    { id: "saree", name: "Handloom Sarees" },
    { id: "bamboo", name: "Bamboo Crafts" },
  ]

  const products: Product[] = [
    {
      id: 1,
      name: "Baluchari Silk Saree",
      category: "saree",
      artisan: "Meena Devi",
      price: "0.15 ETH",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    },
    {
      id: 2,
      name: "Terracotta Wall Hanging",
      category: "terracotta",
      artisan: "Rajesh Kumar",
      price: "0.08 ETH",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    },
    {
      id: 3,
      name: "Jute Handbag",
      category: "jute",
      artisan: "Priya Singh",
      price: "0.05 ETH",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    },
    {
      id: 4,
      name: "Bamboo Table Lamp",
      category: "bamboo",
      artisan: "Amit Sharma",
      price: "0.12 ETH",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    },
    {
      id: 5,
      name: "Kantha Embroidery Scarf",
      category: "saree",
      artisan: "Lakshmi Rao",
      price: "0.07 ETH",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    },
    {
      id: 6,
      name: "Terracotta Planter",
      category: "terracotta",
      artisan: "Vikram Patel",
      price: "0.06 ETH",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    },
    {
      id: 7,
      name: "Jute Floor Mat",
      category: "jute",
      artisan: "Sunita Devi",
      price: "0.09 ETH",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    },
    {
      id: 8,
      name: "Bamboo Storage Basket",
      category: "bamboo",
      artisan: "Ravi Kumar",
      price: "0.04 ETH",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
    },
  ]

  const filteredProducts =
    selectedCategory === "all" ? products : products.filter((product) => product.category === selectedCategory)

  // Fabric ripple effect for sarees
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".product-card")
      cards.forEach((card: any) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
          card.style.setProperty("--mouse-x", `${x}px`)
          card.style.setProperty("--mouse-y", `${y}px`)
        }
      })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove as any)
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove as any)
      }
    }
  }, [])

  return (
    <section id="products" className="py-24 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold mb-4">Handcrafted Products</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Each product is unique, handcrafted by skilled artisans and authenticated on the blockchain.
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              className={`px-6 py-2 rounded-full text-sm transition-colors ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-cyan-500 to-red-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.name}
            </motion.button>
          ))}
        </div>

        {/* Products grid */}
        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className="product-card relative bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="relative aspect-square overflow-hidden">
                  {/* 3D Flip Card Effect */}
                  <div
                    className={`w-full h-full transition-all duration-700 ${
                      hoveredProduct === product.id ? "rotate-y-180" : ""
                    }`}
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Front */}
                    <div
                      className="absolute w-full h-full backface-hidden"
                      style={{
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        width={600}
                        height={600}
                        className="object-cover w-full h-full"
                      />

                      {/* Fabric ripple effect for sarees */}
                      {product.category === "saree" && (
                        <div
                          className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background:
                              "radial-gradient(circle 100px at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.1), transparent)",
                          }}
                        ></div>
                      )}
                    </div>

                    {/* Back */}
                    <div
                      className="absolute w-full h-full backface-hidden rotate-y-180"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <Image
                        src={product.images[1] || "/placeholder.svg"}
                        alt={`${product.name} detail`}
                        width={600}
                        height={600}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">by {product.artisan}</p>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">Price</p>
                      <p className="font-medium">{product.price}</p>
                    </div>

                    <motion.button
                      className="px-3 py-1 bg-blue-600/20 text-cyan-400 rounded-full text-xs font-medium hover:bg-blue-600/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View NFT
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
