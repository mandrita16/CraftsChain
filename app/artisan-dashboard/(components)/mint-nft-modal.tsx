"use client"

import React, { useState } from "react"
import axios from "axios"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImagePlus, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAccount, useWriteContract, useWatchContractEvent, useWaitForTransactionReceipt } from "wagmi"

// Contract address - replace with your deployed contract address
const CONTRACT_ADDRESS = "0x7dE9da95ec835baF710F3Bca82ed399311293cb8"

// ABI from the provided contract
const craftNFTAbi = [
  {
    name: "mintCraftNFT",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenURI", type: "string" },
      { name: "initialStage", type: "string" },
      { name: "location", type: "string" },
      { name: "isEco", type: "bool" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  }
]

// Pinata API configuration - you'll need to set these up in your environment variables
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY

interface MintNftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MintNftModal({ open, onOpenChange }: MintNftModalProps) {
  const { toast } = useToast()
  const { address } = useAccount()
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isEcoFriendly, setIsEcoFriendly] = useState(false)
  const [materials, setMaterials] = useState<string[]>([])
  const [currentMaterial, setCurrentMaterial] = useState("")
  const [itemName, setItemName] = useState("")
  const [description, setDescription] = useState("")
  const [craftType, setCraftType] = useState("")
  const [location, setLocation] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState("")
  const [metadataURI, setMetadataURI] = useState<string | null>(null)

  // Use the updated wagmi hooks
  const { data: hash, isPending: isMinting, writeContract } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isSuccess } = useWaitForTransactionReceipt({ 
    hash,
    onSuccess: () => {
      toast({
        title: "NFT Minted Successfully!",
        description: `Your craft NFT has been minted and is now on the blockchain.`,
      })
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: "Your NFT minting transaction failed.",
      })
    }
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addMaterial = () => {
    if (currentMaterial && !materials.includes(currentMaterial)) {
      setMaterials([...materials, currentMaterial])
      setCurrentMaterial("")
    }
  }

  const removeMaterial = (material: string) => {
    setMaterials(materials.filter((m) => m !== material))
  }

  // Upload image to Pinata
  const uploadImageToPinata = async () => {
    if (!imageFile) return null

    setCurrentStep("Uploading image to IPFS...")
    
    const formData = new FormData()
    formData.append('file', imageFile)
    
    const pinataMetadata = JSON.stringify({
      name: `${itemName}-image`,
    })
    formData.append('pinataMetadata', pinataMetadata)
    
    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY
        }
      })
      
      return res.data.IpfsHash
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload image to IPFS."
      })
      return null
    }
  }

  // Upload metadata to Pinata
  const uploadMetadataToPinata = async (imageHash: string) => {
    setCurrentStep("Creating metadata on IPFS...")
    
    const metadata = {
      name: itemName,
      description: description,
      image: `ipfs://${imageHash}`,
      attributes: [
        {
          trait_type: "Craft Type",
          value: craftType
        },
        {
          trait_type: "Materials",
          value: materials.join(", ")
        },
        {
          trait_type: "Location",
          value: location
        },
        {
          trait_type: "Eco Friendly",
          value: isEcoFriendly ? "Yes" : "No"
        }
      ]
    }
    
    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY
          }
        }
      )
      
      return res.data.IpfsHash
    } catch (error) {
      console.error("Error uploading metadata:", error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload metadata to IPFS."
      })
      return null
    }
  }

  const mintNFT = () => {
    if (!address || !metadataURI) return;
    
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: craftNFTAbi,
      functionName: 'mintCraftNFT',
      args: [
        address,
        metadataURI,
        "Created", // initial stage
        location,
        isEcoFriendly
      ]
    })
  }

  const handlePrepareNFT = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint an NFT."
      })
      return
    }
    
    if (!itemName || !description || !craftType || !location || !imageFile) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill all required fields and upload an image."
      })
      return
    }
    
    setIsUploading(true)
    
    try {
      // 1. Upload image to Pinata
      const imageHash = await uploadImageToPinata()
      if (!imageHash) {
        setIsUploading(false)
        return
      }
      
      // 2. Upload metadata to Pinata
      const metadataHash = await uploadMetadataToPinata(imageHash)
      if (!metadataHash) {
        setIsUploading(false)
        return
      }
      
      // 3. Set the metadata URI to be used in the contract call
      const uri = `ipfs://${metadataHash}`
      setMetadataURI(uri)
      
      toast({
        title: "Ready to Mint",
        description: "Your craft NFT is ready to be minted. Click the Mint NFT button to confirm.",
      })
    } catch (error) {
      console.error("Error preparing NFT:", error)
      toast({
        variant: "destructive",
        title: "Preparation Failed",
        description: "Failed to prepare your NFT for minting."
      })
    } finally {
      setIsUploading(false)
      setCurrentStep("")
    }
  }

  const resetForm = () => {
    setImagePreview(null)
    setImageFile(null)
    setIsEcoFriendly(false)
    setMaterials([])
    setCurrentMaterial("")
    setItemName("")
    setDescription("")
    setCraftType("")
    setLocation("")
    setMetadataURI(null)
  }

  const isLoading = isUploading || isMinting || isConfirming

  return (
    <Dialog open={open} onOpenChange={(newState) => {
      if (!isLoading) onOpenChange(newState)
    }}>
      <DialogContent className="sm:max-w-[500px] bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-xl text-black">Mint New Craft NFT</DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a new NFT for your handcrafted item. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handlePrepareNFT} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nft-image" className="text-black">
              Item Image
            </Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => !isLoading && document.getElementById("nft-image")?.click()}
            >
              {imagePreview ? (
                <div className="relative w-full h-48">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="NFT Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-600">
                  <ImagePlus className="h-12 w-12 mb-2" />
                  <p className="text-sm">Click to upload an image of your craft item</p>
                  <p className="text-xs mt-1">PNG, JPG or GIF (max. 10MB)</p>
                </div>
              )}
              <input 
                id="nft-image" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nft-name" className="text-black">
              Item Name
            </Label>
            <Input
              id="nft-name"
              placeholder="e.g., Handcrafted Wooden Bowl"
              className="bg-white border-gray-300 focus:border-cyan-500 text-black"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nft-description" className="text-black">
              Description
            </Label>
            <Textarea
              id="nft-description"
              placeholder="Describe your craft item, its uniqueness, and the story behind it..."
              rows={3}
              className="bg-white border-gray-300 focus:border-cyan-500 text-black"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="craft-type" className="text-black">
                Craft Type
              </Label>
              <Select value={craftType} onValueChange={setCraftType} disabled={isLoading}>
                <SelectTrigger id="craft-type" className="bg-white border-gray-300 text-black">
                  <SelectValue placeholder="Select craft type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="woodworking">Woodworking</SelectItem>
                  <SelectItem value="pottery">Pottery</SelectItem>
                  <SelectItem value="textile">Textile Art</SelectItem>
                  <SelectItem value="jewelry">Jewelry</SelectItem>
                  <SelectItem value="leatherwork">Leatherwork</SelectItem>
                  <SelectItem value="glasswork">Glasswork</SelectItem>
                  <SelectItem value="kantha">Kantha</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location" className="text-black">
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., Jaipur, Rajasthan"
                className="bg-white border-gray-300 focus:border-cyan-500 text-black"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-black">Materials Used</Label>
            <div className="flex gap-2">
              <Input
                value={currentMaterial}
                onChange={(e) => setCurrentMaterial(e.target.value)}
                placeholder="Add material (e.g., Oak Wood)"
                className="bg-white border-gray-300 focus:border-cyan-500 text-black"
                disabled={isLoading}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addMaterial} 
                className="bg-white border-gray-300 hover:bg-green-50"
                disabled={isLoading}
              >
                Add
              </Button>
            </div>

            {materials.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {materials.map((material, index) => (
                  <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
                    <span>{material}</span>
                    <button 
                      type="button"
                      onClick={() => removeMaterial(material)} 
                      className="text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="eco-friendly" className="text-black">
                Eco-Friendly
              </Label>
              <p className="text-sm text-gray-600">Is this item made with sustainable materials?</p>
            </div>
            <Switch
              id="eco-friendly"
              checked={isEcoFriendly}
              onCheckedChange={setIsEcoFriendly}
              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
              disabled={isLoading}
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm">
                {isUploading && currentStep}
                {isMinting && "Confirming transaction in wallet..."}
                {isConfirming && "Transaction in progress..."}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={() => onOpenChange(false)}
              className="bg-red-400 hover:bg-red-600 text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            {!metadataURI ? (
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-cyan-500 to-red-600 hover:from-cyan-600 hover:to-red-700"
                disabled={isLoading || !address}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Prepare NFT
                  </>
                )}
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={mintNFT}
                className="bg-gradient-to-r from-cyan-500 to-red-600 hover:from-cyan-600 hover:to-red-700"
                disabled={isLoading}
              >
                {isMinting || isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Mint NFT
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}