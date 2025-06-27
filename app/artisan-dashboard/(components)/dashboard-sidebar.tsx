"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Home,
  Package,
  ShoppingBag,
  Users,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Palette,
  Award,
  Vote,
  MessageCircle,
  AlertCircle
} from "lucide-react"
import { useArtisanSBT } from "@/hooks/useArtisanSBT"
import { Loader } from "@/components/loader"

export default function DashboardSidebar({ isOpen, setIsOpen }) {
  // Use the custom hook to get artisan SBT data
  const { hasArtisanSBT, artisanData, isLoading, error } = useArtisanSBT();  

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/artisan-dashboard" },
    { icon: Palette, label: "My Crafts", href: "/artisan-dashboard/crafts" },
    { icon: Package, label: "Orders", href: "/artisan-dashboard/orders" },
    { icon: ShoppingBag, label: "Marketplace", href: "/market-place" },
    { icon: Award, label: "Eco Tokens", href: "/artisan-dashboard/eco-tokens" },
    { icon: Vote, label: "DAO Governance", href: "/artisan-dashboard/dao" },
    { icon: MessageCircle, label: "Messages", href: "/artisan-dashboard/messages" },
    { icon: BarChart2, label: "Analytics", href: "/artisan-dashboard/analytics" },
    { icon: Users, label: "Community", href: "/artisan-dashboard/community" },
  ]

  const bottomMenuItems = [
    { icon: Settings, label: "Settings", href: "/artisan-dashboard/settings" },
    { icon: HelpCircle, label: "Help & Support", href: "/artisan-dashboard/support" },
    { icon: LogOut, label: "Logout", href: "/logout" },
  ]

  // Generate initials from the artisan's name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: isOpen ? 0 : -100 }}
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 shadow-lg lg:shadow-none transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold">CraftsChain</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {isLoading ? "..." : (artisanData ? getInitials(artisanData.fullName) : "?")}
              </span>
            </div>
            <div>
              {isLoading ? (
                <Loader />
              ) : error ? (
                <h3 className="font-medium text-red-500">Connection Error</h3>
              ) : artisanData ? (
                <>
                  <h3 className="font-medium text-black">{artisanData.fullName}</h3>
                  <div className="flex items-center gap-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${artisanData.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs text-gray-500">
                      {artisanData.active ? 'Verified' : 'Verification Revoked'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-medium text-black">Guest User</h3>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="text-xs text-gray-500">Not Verified</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Error connecting to blockchain</span>
            </div>
          )}

          {!hasArtisanSBT && !isLoading && !error && (
            <div className="mb-4 p-2 bg-yellow-50 text-yellow-700 text-sm rounded flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>No Artisan SBT found</span>
            </div>
          )}

          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <item.icon className="h-5 w-5 text-gray-500" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <nav className="space-y-1">
            {bottomMenuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <item.icon className="h-5 w-5 text-gray-500" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </motion.aside>
    </>
  )
}