"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useReadContract, useAccount } from "wagmi"
import type { CraftItemDetails } from "./craft-item-detail-modal"

// Constants
const CONTRACT_ADDRESS = "0x7dE9da95ec835baF710F3Bca82ed399311293cb8"
const IPFS_GATEWAY = "https://ipfs.io/ipfs/"

// Contract ABI
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

// Context type
interface NFTDataContextType {
  ownedNFTs: CraftItemDetails[]
  loadingNFTs: boolean
}

// Create context
const NFTDataContext = createContext<NFTDataContextType>({
  ownedNFTs: [],
  loadingNFTs: true,
})

// Hook to use the context
export const useNFTData = () => useContext(NFTDataContext)

// Provider component
export function NFTDataProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount()
  const [tokenIds, setTokenIds] = useState<number[]>([])
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0)
  const currentTokenToCheck = tokenIds[currentTokenIndex]
  const [ownedNFTs, setOwnedNFTs] = useState<CraftItemDetails[]>([])
  const [loadingNFTs, setLoadingNFTs] = useState(true)

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
      setOwnedNFTs([])
      setLoadingNFTs(true)
      setCurrentTokenIndex(0)
    }
  }, [currentTokenId, address])

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
        setLoadingNFTs(false)
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

            // Clean image URI
            const imageUri = metadata.image.startsWith("ipfs://")
              ? metadata.image.replace("ipfs://", "")
              : metadata.image

            // Add item to our list
            setOwnedNFTs((prev) => [
              ...prev,
              {
                id: currentTokenToCheck,
                name: metadata.name,
                description: metadata.description,
                image: `${IPFS_GATEWAY}${imageUri}`,
                ipfsHash: cleanUri,
                attributes: metadata.attributes,
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

  return <NFTDataContext.Provider value={{ ownedNFTs, loadingNFTs }}>{children}</NFTDataContext.Provider>
}
