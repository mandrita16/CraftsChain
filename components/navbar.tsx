"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X, ShoppingBag } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import RegisterButton from "./register-button"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-md py-3" : "bg-transparent py-5"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-red-600 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-white font-bold text-xl">C</span>
          </motion.div>
          <span className="text-xl font-bold">CraftsChain</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#journey" className="text-gray-300 hover:text-white transition-colors">
            Artisan Journey
          </Link>
          <Link href="#products" className="text-gray-300 hover:text-white transition-colors">
            Products
          </Link>
          <Link href="/market-place" className="text-gray-300 hover:text-white transition-colors">
            NFT Marketplace
          </Link>
          <Link href="/artisan-dashboard" className="text-gray-300 hover:text-white transition-colors">
            Artisan Dashboard
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-gray-800 text-gray-300 hover:text-white relative"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
              3
            </span>
          </motion.button>

          <RegisterButton />

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-red-600 text-white font-medium"
          >
            <ConnectButton />
          </motion.div>
        </div>

        <button
          className="md:hidden p-2 rounded-full bg-gray-800 text-gray-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden bg-black/95 border-b border-gray-800"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="#journey"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Artisan Journey
              </Link>
              <Link
                href="#products"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="#blockchain"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blockchain
              </Link>
              <Link
                href="#nft"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                NFT Marketplace
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full bg-gray-800 text-gray-300 hover:text-white relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </button>

              <Link
                href="/register"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-red-600 text-white font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>

              <button className="flex-1 px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium">
                Connect Wallet
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
