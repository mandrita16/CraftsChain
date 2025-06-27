"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { type CraftItemDetails, CraftItemDetailModal } from "./(components)/craft-item-detail-modal"
import NFTListingForm from "./(components)/NFTListingform"

export default function ListNFTPage() {
  const router = useRouter()
  const [previewItem, setPreviewItem] = useState<CraftItemDetails | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Function to handle preview
  const handlePreview = (item: CraftItemDetails) => {
    setPreviewItem(item)
    setIsPreviewOpen(true)
  }

  // Function to handle successful listing
  const handleSuccess = () => {
    // Redirect to dashboard or success page
    router.push("/dashboard?listing=success")
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-5xl py-8 px-4 md:px-6 mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-black">List Your NFT</h1>
            <p className="text-gray-500">
              Create a listing for your NFT on the marketplace. You'll need to approve the NFT for sale before
              finalizing your listing.
            </p>
          </div>

          <NFTListingForm onPreview={handlePreview} onSuccess={handleSuccess} />

          {/* Preview Modal */}
          <CraftItemDetailModal open={isPreviewOpen} onOpenChange={setIsPreviewOpen} item={previewItem} />
        </div>
      </div>
    </div>
  )
}
