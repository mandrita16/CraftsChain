"use client"

import { useEffect, useState } from "react"
import { 
  useAccount,
  useConnect,
  useDisconnect,
  useWaitForTransactionReceipt,
  useReadContract,
  useWriteContract
} from "wagmi"

// Contract ABI - converted to proper format for viem
const contractABI = [
    {
      name: 'getCurrentTokenId',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'uint256' }]
    },
    {
      name: 'ownerOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [{ name: '', type: 'address' }]
    },
    {
      name: 'tokenURI',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [{ name: '', type: 'string' }]
    },
    {
      name: 'isEcoFriendly',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [{ name: '', type: 'bool' }]
    },
    {
      name: 'craftArtisan',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [{ name: '', type: 'address' }]
    },
    {
      name: 'getProvenanceHistory',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [{ 
        name: '', 
        type: 'tuple[]',
        components: [
          { name: 'stage', type: 'string' },
          { name: 'actor', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'location', type: 'string' }
        ]
      }]
    },
    {
      name: 'addProvenanceEntry',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'stage', type: 'string' },
        { name: 'location', type: 'string' }
      ],
      outputs: []
    },
    {
      name: 'mintCraftNFT',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'tokenURI', type: 'string' },
        { name: 'initialStage', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'isEco', type: 'bool' }
      ],
      outputs: [{ name: '', type: 'uint256' }]
    },
    {
      name: 'linkToArtisan',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'artisan', type: 'address' }
      ],
      outputs: []
    },
    {
      name: 'setEcoStatus',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'status', type: 'bool' }
      ],
      outputs: []
    },
    {
      name: 'getArtisanData',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [
        { name: 'name', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'craftType', type: 'string' }
      ]
    },
    {
      name: 'tokenExists',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [{ name: '', type: 'bool' }]
    },
    {
      name: 'ProvenanceAdded',
      type: 'event',
      inputs: [
        { name: 'tokenId', type: 'uint256', indexed: true },
        { name: 'stage', type: 'string', indexed: false },
        { name: 'actor', type: 'address', indexed: false }
      ]
    },
    {
      name: 'ArtisanLinked',
      type: 'event',
      inputs: [
        { name: 'tokenId', type: 'uint256', indexed: true },
        { name: 'artisan', type: 'address', indexed: true }
      ]
    },
    {
      name: 'EcoStatusUpdated',
      type: 'event',
      inputs: [
        { name: 'tokenId', type: 'uint256', indexed: true },
        { name: 'status', type: 'bool', indexed: false }
      ]
    }
  ] as const;

// Contract address
const CONTRACT_ADDRESS = "0x7dE9da95ec835baF710F3Bca82ed399311293cb8"

/**
 * Custom hook to interact with the CraftNFT contract
 * @param {number} maxTokens - Maximum number of tokens to fetch (default: 10)
 * @returns {Object} Contract interaction state and functions
 */
export function useCraftContract(maxTokens = 10) {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [craftItems, setCraftItems] = useState([])
  const [txSuccess, setTxSuccess] = useState(false)
  
  // Use writeContract hook for transaction operations
  const { 
    writeContract,
    data: txHash,
    isPending: isWriting,
    isSuccess: isWriteSuccess,
    error: writeError
  } = useWriteContract()
  
  // Watch for transaction completion
  const { 
    isLoading: isWaitingForTx, 
    isSuccess: isTxSuccess 
  } = useWaitForTransactionReceipt({
    hash: txHash,
    enabled: !!txHash,
  })
  
  // Use readContract for getCurrentTokenId
  const { 
    data: currentTokenId,
    isLoading: isLoadingTokenId,
    refetch: refetchTokenId
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'getCurrentTokenId',
    enabled: isConnected
  })
  
  // Update txSuccess state when transaction completes
  useEffect(() => {
    if (isTxSuccess) {
      setTxSuccess(true)
      fetchCraftItems()
    }
  }, [isTxSuccess])
  
  // Update error state if write operation fails
  useEffect(() => {
    if (writeError) {
      setError(`Transaction failed: ${writeError.message}`)
    }
  }, [writeError])
  
  // Helper function to determine status from provenance stage
  const determineStatus = (stage) => {
    const stageLower = stage.toLowerCase()
    if (stageLower.includes("sold")) return "sold"
    if (stageLower.includes("list")) return "listed"
    if (stageLower.includes("creat") || stageLower.includes("progress")) return "in-progress"
    return "listed" // Default status
  }

  // Function to read contract data for a specific token ID
  const readTokenData = async (tokenId) => {
    try {
      // Check if token exists by getting owner
      const owner = await fetch({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)]
      })
      
      // Get token URI
      const tokenURI = await fetch({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)]
      })
      console.log(tokenURI);
      
      // Get eco-friendly status
      const isEco = await fetch({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'isEcoFriendly',
        args: [BigInt(tokenId)]
      })
      
      // Get provenance history
      const provenanceHistory = await fetch({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'getProvenanceHistory',
        args: [BigInt(tokenId)]
      })
      
      return { tokenURI, isEco, provenanceHistory }
    } catch (err) {
      console.log(`Token ${tokenId} might not exist or has an error: ${err.message}`)
      return null
    }
  }
  
  // Function to fetch metadata from IPFS
  const fetchMetadata = async (tokenURI) => {
    console.log(tokenURI);
    
    const ipfsHash = tokenURI.replace("ipfs://", "")
    const metadataUrl = `https://ipfs.io/ipfs/${ipfsHash}`
    const response = await fetch(metadataUrl)
    return await response.json()
  }
  
  // Function to fetch craft items
  const fetchCraftItems = async () => {
    if (!isConnected) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Refetch token ID to get the latest count
      await refetchTokenId()
      
      if (!currentTokenId) {
        throw new Error("Failed to get current token ID")
      }
      
      const totalTokens = Number(currentTokenId)
      const tokensToFetch = Math.min(totalTokens, maxTokens)
      const items = []
      
      for (let i = 0; i < tokensToFetch; i++) {
        const tokenData = await readTokenData(i)
        console.log(tokenData);
        
        
        if (tokenData) {
          const { tokenURI, isEco, provenanceHistory } = tokenData
          const metadata = await fetchMetadata(tokenURI)
          
          const latestProvenance = provenanceHistory[provenanceHistory.length - 1]
          
          // Parse image URL
          const imageIpfsHash = metadata.image.replace("ipfs://", "")
          const imageUrl = `https://ipfs.io/ipfs/${imageIpfsHash}`
          
          // Find craft type and region from attributes
          const craftType = metadata.attributes.find(attr => attr.trait_type === "Craft Type")?.value || "Unknown"
          const region = metadata.attributes.find(attr => attr.trait_type === "Region")?.value || "Unknown"
          
          // Determine status based on provenance stage
          const status = determineStatus(latestProvenance.stage)
          
          // Format date (timestamp is in seconds, JS uses milliseconds)
          const creationDate = new Date(Number(latestProvenance.timestamp) * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          
          items.push({
            id: i,
            name: metadata.name,
            image: imageUrl,
            nftId: `#${i}`,
            status: status,
            creationDate: creationDate,
            materials: [craftType, region],
            isEco: isEco,
            provenanceHistory: provenanceHistory,
            metadata: metadata
          })
        }
      }
      
      setCraftItems(items)
    } catch (err) {
      setError(`Failed to fetch craft items: ${err.message}`)
      console.error("Error fetching craft items:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch items when connection is available or tokens change
  useEffect(() => {
    if (isConnected && currentTokenId !== undefined) {
      fetchCraftItems()
    }
  }, [isConnected, currentTokenId])

  // Function to get a single craft item by ID
  const getCraftItemById = async (tokenId) => {
    if (!isConnected) return null
    
    try {
      const tokenData = await readTokenData(tokenId)
      
      if (!tokenData) return null
      
      const { tokenURI, isEco, provenanceHistory } = tokenData
      const metadata = await fetchMetadata(tokenURI)
      
      const latestProvenance = provenanceHistory[provenanceHistory.length - 1]
      
      // Parse image URL
      const imageIpfsHash = metadata.image.replace("ipfs://", "")
      const imageUrl = `https://ipfs.io/ipfs/${imageIpfsHash}`
      
      // Find craft type and region from attributes
      const craftType = metadata.attributes.find(attr => attr.trait_type === "Craft Type")?.value || "Unknown"
      const region = metadata.attributes.find(attr => attr.trait_type === "Region")?.value || "Unknown"
      
      // Determine status based on provenance stage
      const status = determineStatus(latestProvenance.stage)
      
      // Format date
      const creationDate = new Date(Number(latestProvenance.timestamp) * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      return {
        id: Number(tokenId),
        name: metadata.name,
        image: imageUrl,
        nftId: `#${tokenId}`,
        status: status,
        creationDate: creationDate,
        materials: [craftType, region],
        isEco: isEco,
        provenanceHistory: provenanceHistory,
        metadata: metadata
      }
    } catch (err) {
      console.error(`Error fetching token ${tokenId}:`, err)
      return null
    }
  }

  // Function to add a new provenance entry
  const addProvenanceEntry = async (tokenId, stage, location) => {
    if (!isConnected) throw new Error("Wallet not connected")
    
    try {
      setTxSuccess(false)
      
      // Write to contract using the hook
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'addProvenanceEntry',
        args: [BigInt(tokenId), stage, location]
      })
      
      return txHash
    } catch (err) {
      console.error("Error adding provenance:", err)
      throw err
    }
  }

  // Connect wallet function
  const connectWallet = async () => {
    if (connectors.length > 0) {
      try {
        await connect({ connector: connectors[0] })
      } catch (err) {
        setError(`Failed to connect wallet: ${err.message}`)
      }
    } else {
      setError("No wallet connectors available")
    }
  }

  return {
    address,
    isConnected,
    loading: loading || isWriting || isWaitingForTx || isLoadingTokenId,
    error,
    craftItems,
    fetchCraftItems,
    getCraftItemById,
    addProvenanceEntry,
    connectWallet,
    disconnect,
    txSuccess
  }
}