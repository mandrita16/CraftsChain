"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, ExternalLink, MoreHorizontal, Edit, Trash, QrCode, Video } from "lucide-react"
import Image from "next/image"
import { useReadContract, useAccount } from "wagmi"
import { MintNftModal } from "./mint-nft-modal"
import { CraftItemDetailModal, type CraftItemDetails } from "./craft-item-detail-modal"

// ABI snippet for the needed functions from the contract
const contractAbi = [
  {
    inputs: [],
    name: "getCurrentTokenId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "isEcoFriendly",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
]

const CONTRACT_ADDRESS = "0x7dE9da95ec835baF710F3Bca82ed399311293cb8"
const IPFS_GATEWAY = "https://ipfs.io/ipfs/"

export default function CraftItemsSection() {
  const { address } = useAccount()
  const [craftItems, setCraftItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tokenIds, setTokenIds] = useState([])
  const [mintModalOpen, setMintModalOpen] = useState(false)

  const [selectedItem, setSelectedItem] = useState<CraftItemDetails | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  // Get total token count
  const { data: currentTokenId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: "getCurrentTokenId",
  })

  // Initialize token IDs to check once we have the currentTokenId
  useEffect(() => {
    if (currentTokenId && address) {
      // Reset and generate array of token IDs to check (0 to currentTokenId-1)
      const ids = []
      for (let i = 0; i < Number(currentTokenId); i++) {
        ids.push(i)
      }
      setTokenIds(ids)
      setCraftItems([])
      setLoading(true)
    }
  }, [currentTokenId, address])

  // Check ownership for each token one by one
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0)
  const currentTokenToCheck = tokenIds[currentTokenIndex]

  // 1. Check token ownership
  const { data: tokenOwner, isSuccess: ownerCheckDone } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: "ownerOf",
    args: [currentTokenToCheck],
    query: {
      enabled: address !== undefined && currentTokenToCheck !== undefined,
    },
  })

  // 2. Get token URI if user owns the token
  const isOwner = ownerCheckDone && tokenOwner?.toLowerCase() === address?.toLowerCase()
  const { data: tokenURI, isSuccess: uriCheckDone } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: "tokenURI",
    args: [currentTokenToCheck],
    query: {
      enabled: isOwner === true,
    },
  })

  // 3. Get eco-friendly status if user owns the token
  const { data: isEcoFriendly, isSuccess: ecoCheckDone } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: "isEcoFriendly",
    args: [currentTokenToCheck],
    query: {
      enabled: isOwner === true,
    },
  })

  // 4. Process token data and move to the next token
  useEffect(() => {
    const processCurrentToken = async () => {
      // Check if we're done with all tokens
      if (currentTokenIndex >= tokenIds.length) {
        setLoading(false)
        return
      }

      // Skip to next token if not owned by current user
      if (ownerCheckDone && !isOwner) {
        setCurrentTokenIndex(currentTokenIndex + 1)
        return
      }

      // Process token if owned and URI is available
      if (isOwner && uriCheckDone && ecoCheckDone) {
        try {
          // Process the token only if we have all the data
          if (tokenURI) {
            // Fetch metadata from IPFS
            const cleanUri = tokenURI.replace("ipfs://", "")
            const response = await fetch(`${IPFS_GATEWAY}${cleanUri}`)
            const metadata = await response.json()

            // Extract materials
            const materials = metadata.attributes
              .filter((attr) => attr.trait_type.includes("Material") || attr.trait_type === "Craft Type")
              .map((attr) => attr.value)

            // Clean image URI
            const imageUri = metadata.image.startsWith("ipfs://")
              ? metadata.image.replace("ipfs://", "")
              : metadata.image

            // Add item to our list
            setCraftItems((prev) => [
              ...prev,
              {
                id: currentTokenToCheck,
                name: metadata.name,
                image: `${IPFS_GATEWAY}${imageUri}`,
                nftId: `#${currentTokenToCheck}`,
                status: "in-progress", // Default status (would need provenance for accurate status)
                creationDate: new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                materials,
                ipfsHash: cleanUri,
                ecoFriendly: isEcoFriendly,
              },
            ])
          }
        } catch (error) {
          console.error(`Error processing token ${currentTokenToCheck}:`, error)
        }

        // Move to next token regardless of success or failure
        setCurrentTokenIndex(currentTokenIndex + 1)
      }
    }

    processCurrentToken()
  }, [
    currentTokenIndex,
    tokenIds,
    ownerCheckDone,
    uriCheckDone,
    ecoCheckDone,
    isOwner,
    tokenURI,
    currentTokenToCheck,
    isEcoFriendly,
  ])

  const getStatusBadge = (status) => {
    switch (status) {
      case "sold":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✅ Sold</span>
      case "listed":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">🔄 Listed</span>
      case "in-progress":
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">🛠️ In Progress</span>
      default:
        return null
    }
  }

  const handleItemClick = async (item) => {
    try {
      // Fetch the full metadata from IPFS
      const response = await fetch(`${IPFS_GATEWAY}${item.ipfsHash}`)
      const metadata = await response.json()

      // Create a complete item object with all details
      const detailedItem: CraftItemDetails = {
        id: item.id,
        name: metadata.name,
        description: metadata.description,
        image: item.image, // Use the already processed image URL
        attributes: metadata.attributes,
        ipfsHash: item.ipfsHash,
      }

      setSelectedItem(detailedItem)
      setDetailModalOpen(true)
    } catch (error) {
      console.error("Error fetching item details:", error)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl text-black font-bold">My Craft Items</h2>
            <button
              onClick={() => setMintModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-red-600 text-white rounded-lg text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading your craft items {currentTokenIndex}/{tokenIds.length}
          </div>
        ) : craftItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            You don't have any craft items yet. Create your first one!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {craftItems.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-24 sm:h-24 rounded-lg overflow-hidden relative">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-black">{item.name}</h3>
                      <div className="relative group">
                        <button className="p-1 rounded-full hover:bg-gray-100">
                          <MoreHorizontal className="h-5 w-5 text-gray-500" />
                        </button>

                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-10 hidden group-hover:block">
                          <button className="flex items-center gap-2 text-gray-500 w-full px-4 py-2 text-sm text-left hover:bg-gray-50">
                            <Edit className="h-4 w-4 text-gray-500" />
                            <span>Edit Item</span>
                          </button>
                          <button className="flex items-center gap-2 text-gray-500 w-full px-4 py-2 text-sm text-left hover:bg-gray-50">
                            <Video className="h-4 w-4 text-gray-500" />
                            <span>Add Making Video</span>
                          </button>
                          <button className="flex items-center gap-2 text-gray-500 w-full px-4 py-2 text-sm text-left hover:bg-gray-50">
                            <QrCode className="h-4 w-4 text-gray-500" />
                            <span>Print QR Tag</span>
                          </button>
                          <button className="flex items-center gap-2 text-gray-500 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50">
                            <Trash className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="font-medium">NFT ID:</span>
                        <span>{item.nftId}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="font-medium">Created:</span>
                        <span>{item.creationDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.materials.map((material, index) => (
                        <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {material}
                        </span>
                      ))}
                      {item.ecoFriendly && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Eco Friendly
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {getStatusBadge(item.status)}

                      <a
                        href={`${IPFS_GATEWAY}${item.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <span>View on IPFS</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 text-center border-t border-gray-100">
          <button className="text-sm text-blue-600 hover:text-blue-800">View All Craft Items</button>
        </div>
      </motion.div>

      <CraftItemDetailModal open={detailModalOpen} onOpenChange={setDetailModalOpen} item={selectedItem} />
      <MintNftModal open={mintModalOpen} onOpenChange={setMintModalOpen} />
    </>
  )
}
