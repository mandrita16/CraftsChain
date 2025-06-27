"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PopupModalProps {
  onClose: () => void
}

export default function PopupModal({ onClose }: PopupModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* Glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-xl border border-white/10 z-0" />

        {/* Content */}
        <div className="relative z-10 p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">N</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">Start Earning XP on NFTSea</h2>

          <p className="text-gray-300 mb-6">
            Experience our reimagined marketplace with 0.5% platform fees, seamless cross-chain swaps, and an XP system
            designed to reward participation.
          </p>

          <div className="space-y-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button className="w-full py-6 text-lg font-medium rounded-xl relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="relative z-10">Enter NFTSea</span>
                {/* Glow effect */}
                <span className="absolute inset-0 w-full h-full bg-white/30 blur-xl group-hover:blur-2xl transition-all duration-300"></span>
              </Button>
            </motion.div>

            <button onClick={onClose} className="text-sm text-gray-400 hover:text-white transition-colors">
              No thanks, I'll stick with Classic
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
