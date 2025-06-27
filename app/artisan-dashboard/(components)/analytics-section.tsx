"use client"

import { motion } from "framer-motion"
import { Star, Eye, MessageSquare, ShoppingBag } from "lucide-react"

export default function AnalyticsSection() {
  const reviews = [
    {
      id: 1,
      name: "Priya Sharma",
      rating: 5,
      comment: "The Baluchari saree is absolutely stunning! The craftsmanship is exceptional.",
      date: "March 28, 2025",
    },
    {
      id: 2,
      name: "Rajiv Mehta",
      rating: 4,
      comment: "Beautiful work. The colors are vibrant and the design is intricate.",
      date: "March 15, 2025",
    },
  ]

  const stats = [
    { icon: Eye, label: "Profile Views", value: "1,243" },
    { icon: ShoppingBag, label: "Total Sales", value: "9" },
    { icon: Star, label: "Avg. Rating", value: "4.8/5" },
    { icon: MessageSquare, label: "Reviews", value: "12" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold">Analytics & Feedback</h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-white rounded-lg shadow-sm mb-2">
                  <stat.icon className="h-5 w-5 text-gray-500" />
                </div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="font-bold text-lg">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-medium mb-3">Recent Reviews</h3>

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{review.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500">{review.date}</p>
              </div>
              <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">View All Reviews</button>
        </div>
      </div>
    </motion.div>
  )
}
