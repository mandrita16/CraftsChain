"use client"

import { motion } from "framer-motion"
import { Vote, Users, MessageSquare } from "lucide-react"

export default function DaoSection() {
  const proposals = [
    {
      id: 1,
      title: "Feature Artisan of the Week",
      description: "Vote for the next featured artisan on the marketplace homepage",
      votes: 24,
      endDate: "April 10, 2025",
      status: "active",
    },
    {
      id: 2,
      title: "Fund New Loom in Nadia District",
      description: "Allocate community funds to support new loom infrastructure",
      votes: 18,
      endDate: "April 15, 2025",
      status: "active",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-black font-bold">Artisan DAO Participation</h2>
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
            <Vote className="h-3 w-3" />
            <span>6 Votes Cast</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-sm text-black font-medium mb-3">Active Proposals</h3>

        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4">
                <h4 className="font-medium">{proposal.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{proposal.description}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Vote className="h-3 w-3" />
                    <span>{proposal.votes} votes</span>
                  </div>
                  <div>Ends: {proposal.endDate}</div>
                </div>
              </div>

              <div className="flex border-t border-gray-200 divide-x divide-gray-200">
                <button className="flex-1 py-2 text-center text-sm text-blue-600 hover:bg-blue-50 transition-colors">
                  Cast Vote
                </button>
                <button className="flex-1 py-2 text-center text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button className="flex items-center justify-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">
            <Vote className="h-4 w-4" />
            <span>View All Proposals</span>
          </button>

          <button className="flex items-center justify-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">
            <MessageSquare className="h-4 w-4" />
            <span>Join Discussion Forum</span>
          </button>

          <button className="flex items-center justify-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">
            <Users className="h-4 w-4" />
            <span>Connect with Artisans</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
