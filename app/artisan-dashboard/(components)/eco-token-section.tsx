"use client"

import { motion } from "framer-motion"
import { Leaf, TrendingUp, History, Award } from "lucide-react"

export default function EcoTokenSection() {
  const ecoActivities = [
    {
      id: 1,
      title: "Using Natural Dyes",
      tokens: 25,
      date: "April 2, 2025",
    },
    {
      id: 2,
      title: "Handloom Certification",
      tokens: 100,
      date: "March 15, 2025",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl text-black font-bold">Eco Token Tracker</h2>
      </div>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="sm:w-1/3 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-700">Current Balance</p>
                <p className="text-2xl font-bold text-green-800">125 ECO</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-700">
              <TrendingUp className="h-4 w-4" />
              <span>+25 tokens this month</span>
            </div>
          </div>

          <div className="sm:w-2/3">
            <div className="mb-4">
              <h3 className="text-sm text-black font-medium mb-2">Earned via</h3>
              <div className="space-y-3">
                {ecoActivities.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-black">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                    <div className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                      +{activity.tokens} ECO
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-800">Next Milestone</p>
                <p className="text-sm text-amber-700">"Green Artisan of the Month" badge (75 more ECO)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
          <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            <History className="h-4 w-4" />
            <span>View Eco Token History</span>
          </button>

          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Redeem Tokens</button>
        </div>
      </div>
    </motion.div>
  )
}
