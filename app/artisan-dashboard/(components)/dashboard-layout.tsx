"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import DashboardSidebar from "./dashboard-sidebar"
import DashboardHeader from "./dashboard-header"

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`transition-all duration-300 ${isSidebarOpen && !isMobile ? "lg:ml-64" : ""}`}>
        <DashboardHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-6 max-w-7xl"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
