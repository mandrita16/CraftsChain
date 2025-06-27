"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, ChevronDown, User, Palette, X } from "lucide-react"

export default function RegisterButton() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleRegister = (type: "normal" | "artisan") => {
    setIsOpen(false)

    if (type === "artisan") {
      router.push("/artisan-verification")
    } else {
      router.push("/register")
    }
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-red-600 text-white font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <UserPlus className="h-4 w-4" />
        <span>Register</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-medium text-gray-800">Choose Account Type</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-2">
                <motion.button
                  onClick={() => handleRegister("normal")}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Normal User</p>
                    <p className="text-xs text-gray-500">Shop and collect unique crafts</p>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => handleRegister("artisan")}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-red-600 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Artisan</p>
                    <p className="text-xs text-gray-500">Showcase and sell your crafts</p>
                  </div>
                </motion.button>
              </div>

              <div className="bg-gray-50 p-3 text-xs text-gray-500">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                  Login here
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
