"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { X, DollarSign, Truck, Tag } from "lucide-react"
import type { CraftItemDetails } from "./craft-item-detail-modal"
import { useAccount, useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"

// ABI fragment for the listItem function
const abi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "shippingInfo",
        "type": "string"
      }
    ],
    "name": "listItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

interface SellNFTModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: CraftItemDetails
}

export function SellNFTModal({ open, onOpenChange, item }: SellNFTModalProps) {
  const [price, setPrice] = useState("")
  const [shippingInfo, setShippingInfo] = useState("")
  const [includeShipping, setIncludeShipping] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { address } = useAccount()
  
  // Simulate the contract interaction (similar to the old usePrepareContractWrite)
  const { data: simulateData, error: simulateError } = useSimulateContract({
    address: "0x586a3cB7d060d1D3082B451fc18067E5A71eB9B6",
    abi,
    functionName: "listItem",
    args: [
      BigInt(item.id || 0), // tokenId
      price ? parseEther(price) : BigInt(0), // price in wei
      includeShipping ? shippingInfo : "", // shipping info
    ],
    query: {
      enabled: Boolean(price && item.id && address),
    }
  })
  
  // Write to the contract (similar to the old useContractWrite)
  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract()
  
  // Wait for transaction to be mined (similar to the old useWaitForTransaction)
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (!simulateData?.request) {
        throw new Error("Unable to list NFT. Please check your inputs and try again.")
      }
      
      // Execute the write operation
      writeContract(simulateData.request)
    } catch (error) {
      console.error("Error listing NFT:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // When transaction succeeds, close the modal
  useEffect(() => {
    if (isConfirmed) {
      onOpenChange(false)
      // You could add a toast notification here
    }
  }, [isConfirmed, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-100 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4 text-black" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-xl text-black font-bold">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              <span>List "{item.name}" for Sale</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Price Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                Price (ETH)
              </Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.00"
                  className="pl-9"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Shipping Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeShipping"
                checked={includeShipping}
                onCheckedChange={(checked) => setIncludeShipping(checked as boolean)}
              />
              <Label htmlFor="includeShipping" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Truck className="h-4 w-4" />
                Include Physical Shipment
              </Label>
            </div>

            {includeShipping && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="shippingInfo" className="text-sm font-medium text-gray-700">
                    Shipping Information
                  </Label>
                  <Textarea
                    id="shippingInfo"
                    placeholder="Enter complete shipping address and any special instructions"
                    value={shippingInfo}
                    onChange={(e) => setShippingInfo(e.target.value)}
                    required={includeShipping}
                    className="resize-none h-24"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Display any errors */}
          {(simulateError || writeError) && (
            <div className="text-red-500 text-sm">
              {(simulateError || writeError)?.message || "Error preparing transaction. Please try again."}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white" 
              disabled={isSubmitting || isWritePending || isConfirming || !simulateData?.request}
            >
              {isWritePending || isConfirming ? "Listing..." : "List for Sale"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}