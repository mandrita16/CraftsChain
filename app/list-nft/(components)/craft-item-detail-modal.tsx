"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, MapPin, Leaf, Info, X } from "lucide-react"
import Image from "next/image"

const IPFS_GATEWAY = "https://ipfs.io/ipfs/"

export type CraftItemAttribute = {
  trait_type: string
  value: string
}

export interface CraftItemDetails {
  id: number
  name: string
  description: string
  image: string
  attributes: CraftItemAttribute[]
  ipfsHash: string
}

interface CraftItemDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: CraftItemDetails | null
}

export function CraftItemDetailModal({ open, onOpenChange, item }: CraftItemDetailModalProps) {
  if (!item) return null

  // Helper to get a specific attribute value
  const getAttributeValue = (traitType: string) => {
    const attribute = item.attributes.find((attr) => attr.trait_type === traitType)
    return attribute ? attribute.value : null
  }

  // Get location if available
  const location = getAttributeValue("Location")

  // Get eco-friendly status if available
  const ecoFriendly = getAttributeValue("Eco Friendly")

  // Get craft type if available
  const craftType = getAttributeValue("Craft Type")

  // Get all materials
  const materials = item.attributes
    .filter((attr) => attr.trait_type === "Materials" || attr.trait_type.includes("Material"))
    .map((attr) => attr.value)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white">
        {/* Custom close button with custom color */}
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4 text-red-500" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-sm text-gray-700">{item.description}</p>
            </div>

            {/* Craft Type */}
            {craftType && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Craft Type</h3>
                <div className="flex items-center gap-1">
                  <Info className="h-4 w-4 text-gray-500" />
                  <span className="text-sm capitalize">{craftType}</span>
                </div>
              </div>
            )}

            {/* Materials */}
            {materials.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {materials.map((material, index) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {location && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Origin</h3>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{location}</span>
                </div>
              </div>
            )}

            {/* Eco Friendly */}
            {ecoFriendly && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={ecoFriendly === "Yes" ? "bg-green-50 text-green-700 border-green-200" : ""}
                >
                  <Leaf className={`h-3.5 w-3.5 mr-1 ${ecoFriendly === "Yes" ? "text-green-500" : "text-gray-500"}`} />
                  {ecoFriendly === "Yes" ? "Eco Friendly" : "Not Eco Friendly"}
                </Badge>
              </div>
            )}

            {/* IPFS Link */}
            <div className="mt-auto pt-2">
              <a
                href={`${IPFS_GATEWAY}${item.ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <span>View Metadata on IPFS</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
