"use client"

import { motion } from "framer-motion"
import { Shield, ExternalLink, Upload, Loader2 } from "lucide-react"
import { useArtisanSBT } from "@/hooks/useArtisanSBT"
import { formatDistanceToNow } from "date-fns"

export default function IdentitySection() {
  const { 
    isConnected, 
    hasArtisanSBT, 
    artisanData, 
    isLoading, 
    error,
    walletAddress 
  } = useArtisanSBT();

  // Format the SBT ID (shortened wallet address or token ID)
  const formattedSbtId = artisanData?.tokenId 
    ? `0x${artisanData.tokenId.toString(16).padStart(4, '0')}` 
    : walletAddress 
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
      : "Not connected";

  // Format the verification date
  const formattedVerificationDate = artisanData?.issuedAt 
    ? formatDistanceToNow(artisanData.issuedAt, { addSuffix: true }) 
    : "N/A";

  // Get district from region (assuming format like "Nadia, West Bengal")
  const district = artisanData?.region || "Not verified";

  // Determine verification status
  const isVerified = hasArtisanSBT && artisanData?.active;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
        {/* <span className="ml-3 text-gray-600">Loading identity data...</span> */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-red-600">Error Loading Identity</h2>
        <p className="mt-2 text-gray-600">There was a problem connecting to your identity SBT.</p>
        <button className="mt-4 px-4 py-2 bg-gray-200 rounded-lg text-sm">Try Again</button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl text-black font-bold">My Identity (SBT)</h2>
        <p className="mt-2 text-gray-600">Please connect your wallet to view your identity SBT.</p>
      </div>
    );
  }

  if (!hasArtisanSBT) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl text-black font-bold">My Identity (SBT)</h2>
        <p className="mt-2 text-gray-600">You don't have an artisan identity SBT.</p>
        <p className="text-sm text-gray-500">Contact your local verification authority to get verified.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-black font-bold">My Identity (SBT)</h2>
          <div className={`flex items-center gap-1 px-2 py-1 ${isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full text-xs`}>
            <Shield className="h-3 w-3" />
            <span>{isVerified ? 'Verified' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="sm:w-1/3">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-cyan-500/10 to-red-600/10 flex items-center justify-center border border-gray-200 relative overflow-hidden">
              {/* Traditional pattern background */}
              <div className="absolute inset-0 opacity-5 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat"></div>

              <div className="relative z-10 text-center p-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-red-600 flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-2xl">
                    {artisanData?.fullName.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase() || '??'}
                  </span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2">
                  <p className="font-medium text-black text-gray-900">{artisanData?.fullName}</p>
                  <p className="text-xs text-gray-500">{district}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sm:w-2/3 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Traditional Skill</p>
                <p className="font-medium text-black">{artisanData?.craftType || "Not specified"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">Issued By</p>
                <p className="font-medium text-black">
                  {artisanData?.verifier ? `${artisanData.verifier.slice(0, 6)}...${artisanData.verifier.slice(-4)}` : "Not verified"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">Verification Date</p>
                <p className="font-medium text-black">{formattedVerificationDate}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">SBT ID</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-sm text-black">{formattedSbtId}</p>
                  <a 
                    href={`https://sepolia.basescan.org/token/${walletAddress}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => window.open(`https://sepolia.basescan.org/token/0xa71dbeE2B0094ea44eF5D08A290663d3eE06FE71?a=${artisanData?.tokenId}`, '_blank')}
                  className="flex items-center justify-center gap-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-red-600 text-white rounded-lg text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View SBT On-Chain</span>
                </button>

                <button className="flex items-center justify-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">
                  <Upload className="h-4 w-4" />
                  <span>Update KYC Documents</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}