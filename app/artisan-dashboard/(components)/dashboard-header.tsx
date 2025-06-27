"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bell, Menu, Search, X } from "lucide-react"
import Link from "next/link"

export default function DashboardHeader({ toggleSidebar }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Order Received",
      message: "You have received a new order for your Baluchari Saree",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "DAO Proposal Update",
      message: "New proposal for 'Feature Artisan of the Week' is ready for voting",
      time: "Yesterday",
      read: false,
    },
    {
      id: 3,
      title: "Eco Tokens Earned",
      message: "You earned 25 ECO tokens for using natural dyes",
      time: "3 days ago",
      read: true,
    },
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="hidden md:block ml-4">
              <div className="flex items-baseline space-x-4">
                <Link href="/artisan-dashboard" className="text-gray-900 font-medium">
                  Dashboard
                </Link>
                <Link href="/artisan-dashboard/orders" className="text-gray-500 hover:text-gray-900">
                  Orders
                </Link>
                <Link href="/artisan-dashboard/messages" className="text-gray-500 hover:text-gray-900">
                  Messages
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSearchOpen ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full sm:w-64 px-4 py-2 pr-8 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 rounded-full text-xs flex items-center justify-center text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-black font-medium">Notifications</h3>
                    <button className="text-xs text-blue-600 hover:text-blue-800">Mark all as read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${
                          !notification.read ? "bg-blue-50" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-black text-sm">{notification.title}</h4>
                          <span className="text-xs text-gray-500">{notification.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-200 text-center">
                    <Link href="/notifications" className="text-sm text-blue-600 hover:text-blue-800">
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-red-600 flex items-center justify-center text-white font-medium">
                RS
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
