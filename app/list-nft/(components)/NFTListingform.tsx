"use client"

import React from "react"

import { useState } from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertCircle,
  DollarSign,
  Truck,
  FileText,
  CheckSquare,
  ArrowRight,
} from "lucide-react"
import type { CraftItemDetails } from "./craft-item-detail-modal"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

// Add these imports at the top of the file
import { useReadContract, useAccount } from "wagmi"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { useEffect } from "react"

// Form schema
const listingFormSchema = z.object({
  nftId: z.string().min(1, "Please select an NFT to list"),
  price: z
    .string()
    .min(1, "Please enter a price")
    .refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
      message: "Price must be a positive number",
    }),
  shippingDetails: z.string().min(10, "Please provide shipping details"),
  shippingTimeframe: z.string().min(1, "Please select a shipping timeframe"),
  shippingRegions: z.string().min(1, "Please select shipping regions"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
})

type ListingFormValues = z.infer<typeof listingFormSchema>

// Add these constants after the form schema
const CONTRACT_ADDRESS = "0x7dE9da95ec835baF710F3Bca82ed399311293cb8"
const MARKETPLACE_CONRACT_ADDRESS = "0x586a3cB7d060d1D3082B451fc18067E5A71eB9B6"
const IPFS_GATEWAY = "https://ipfs.io/ipfs/"

// Add this ABI snippet
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

// Steps for the form
const steps = [
  { id: "select-nft", title: "Select NFT", icon: FileText },
  { id: "pricing", title: "Set Price", icon: DollarSign },
  { id: "shipping", title: "Shipping Info", icon: Truck },
  { id: "preview", title: "Preview", icon: CheckSquare },
]

// Transaction status types
type TransactionStatus = "idle" | "approving" | "approved" | "listing" | "success" | "error"

interface NFTListingFormProps {
  onPreview: (item: CraftItemDetails) => void
  onSuccess: () => void
}

export default function NFTListingForm({ onPreview, onSuccess }: NFTListingFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedNFT, setSelectedNFT] = useState<CraftItemDetails | null>(null)
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { data: hash, writeContract, isPending: isWritePending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Add these inside the NFTListingForm component after the state declarations
  const { address } = useAccount()
  const [tokenIds, setTokenIds] = useState<number[]>([])
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0)
  const currentTokenToCheck = tokenIds[currentTokenIndex]

  // Remove the mockOwnedNFTs array and replace with this state
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

  // Initialize form
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      nftId: "",
      price: "",
      shippingDetails: "",
      shippingTimeframe: "",
      shippingRegions: "",
      termsAccepted: false,
    },
  })

  // Watch form values
  const watchedNftId = form.watch("nftId")
  const watchedPrice = form.watch("price")

  // Update selected NFT when nftId changes
  const updateSelectedNFT = (id: string) => {
    const nft = ownedNFTs.find((nft) => nft.id.toString() === id) || null
    setSelectedNFT(nft)
  }

  // Handle NFT selection
  const handleNFTSelect = (id: string) => {
    form.setValue("nftId", id)
    updateSelectedNFT(id)
  }

  // Calculate marketplace fee (5%)
  const calculateMarketplaceFee = (price: string) => {
    const numPrice = Number.parseFloat(price) || 0
    return (numPrice * 0.05).toFixed(4)
  }

  // Calculate final amount
  const calculateFinalAmount = (price: string) => {
    const numPrice = Number.parseFloat(price) || 0
    const fee = numPrice * 0.05
    return (numPrice - fee).toFixed(4)
  }

  // Convert ETH to USD (mock function)
  const ethToUSD = (eth: string) => {
    const ethValue = Number.parseFloat(eth) || 0
    // Assuming 1 ETH = $3000 USD
    return (ethValue * 3000).toFixed(2)
  }

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Handle back step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle preview
  const handlePreviewClick = () => {
    if (selectedNFT) {
      onPreview(selectedNFT)
    }
  }

  // Handle form submission
  // Handle form submission
const onSubmit = async (data: ListingFormValues) => {
  try {
    console.log("entered");
    
    // Start approval process
    setTransactionStatus("approving")
    
    // Simulate blockchain approval (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Approval successful
    setTransactionStatus("approved")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setTransactionStatus("listing")
    
    // Call the listItem function on the marketplace contract
    writeContract({
      address: MARKETPLACE_CONRACT_ADDRESS,
      abi: [
        {
          inputs: [
            { internalType: "uint256", name: "tokenId", type: "uint256" },
            { internalType: "uint256", name: "price", type: "uint256" },
            { internalType: "string", name: "shippingInfo", type: "string" }
          ],
          name: "listItem",
          outputs: [],
          stateMutability: "nonpayable", 
          type: "function"
        }
      ],
      functionName: "listItem",
      args: [
        BigInt(data.nftId),
        // Convert ETH price to wei (1 ETH = 10^18 wei)
        BigInt(Math.floor(parseFloat(data.price) * 10**18)), 
        // Combine shipping details
        `Timeframe: ${data.shippingTimeframe}, Regions: ${data.shippingRegions}, Details: ${data.shippingDetails}`
      ]
    })
  } catch (error) {
    console.error("Transaction error:", error)
    setTransactionStatus("error")
    setErrorMessage("Transaction failed. Please try again.")
  }
}

  useEffect(() => {
    if (isConfirming) {
      setTransactionStatus("listing")
    }
    
    if (isConfirmed) {
      setTransactionStatus("success")
      // Redirect after success
      setTimeout(() => {
        onSuccess()
      }, 2000)
    }
  }, [isConfirming, isConfirmed, onSuccess])

  // Determine if the current step is valid
  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Select NFT
        return !!watchedNftId
      case 1: // Pricing
        return !!watchedPrice && !isNaN(Number.parseFloat(watchedPrice)) && Number.parseFloat(watchedPrice) > 0
      case 2: // Shipping
        return (
          form.getValues("shippingDetails") && form.getValues("shippingTimeframe") && form.getValues("shippingRegions")
        )
      case 3: // Preview
        return form.getValues("termsAccepted")
      default:
        return false
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="nftId"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Select an NFT to list</FormLabel>
                  <FormControl>
                    {loadingNFTs ? (
                      <div className="text-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-500" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Loading your NFTs {currentTokenIndex}/{tokenIds.length}
                        </p>
                      </div>
                    ) : ownedNFTs.length === 0 ? (
                      <div className="text-center p-8 border rounded-lg">
                        <p className="text-muted-foreground">You don't have any NFTs to list.</p>
                      </div>
                    ) : (
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value)
                          updateSelectedNFT(value)
                        }}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
                        {ownedNFTs.map((nft) => (
                          <div key={nft.id} className="relative">
                            <RadioGroupItem value={nft.id.toString()} id={`nft-${nft.id}`} className="sr-only" />
                            <Label
                              htmlFor={`nft-${nft.id}`}
                              className={`block cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                                watchedNftId === nft.id.toString()
                                  ? "border-cyan-500 ring-2 ring-cyan-500 ring-opacity-50"
                                  : "border-muted hover:border-muted-foreground/50"
                              }`}
                            >
                              <div className="relative aspect-square">
                                <Image
                                  src={nft.image || "/placeholder.svg"}
                                  alt={nft.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="p-3">
                                <h3 className="font-medium truncate">{nft.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">
                                  {nft.attributes.find((attr) => attr.trait_type === "Craft Type")?.value || "NFT"}
                                </p>
                              </div>
                              {watchedNftId === nft.id.toString() && (
                                <div className="absolute top-2 right-2">
                                  <Badge className="bg-gradient-to-r from-cyan-500 to-red-600 text-white">
                                    Selected
                                  </Badge>
                                </div>
                              )}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (ETH)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} type="number" step="0.0001" min="0" placeholder="0.00" className="pl-8" />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-muted-foreground">Ξ</span>
                      </div>
                    </div>
                  </FormControl>
                  {watchedPrice && !isNaN(Number.parseFloat(watchedPrice)) && (
                    <FormDescription>Approximately ${ethToUSD(watchedPrice)} USD</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedPrice && !isNaN(Number.parseFloat(watchedPrice)) && Number.parseFloat(watchedPrice) > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Fee Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Listing Price</span>
                      <span>Ξ {Number.parseFloat(watchedPrice).toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Marketplace Fee (5%)</span>
                      <span>Ξ {calculateMarketplaceFee(watchedPrice)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>You Receive</span>
                      <span>Ξ {calculateFinalAmount(watchedPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="shippingDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Details</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Provide details about shipping, packaging, and any special handling instructions."
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormDescription>This information will be visible to buyers after purchase.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shippingTimeframe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Shipping Timeframe</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipping timeframe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1-3_days">1-3 business days</SelectItem>
                      <SelectItem value="3-5_days">3-5 business days</SelectItem>
                      <SelectItem value="1-2_weeks">1-2 weeks</SelectItem>
                      <SelectItem value="2-4_weeks">2-4 weeks</SelectItem>
                      <SelectItem value="4-8_weeks">4-8 weeks</SelectItem>
                      <SelectItem value="custom">Custom (specify in details)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shippingRegions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Regions</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipping regions" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="worldwide">Worldwide</SelectItem>
                      <SelectItem value="north_america">North America Only</SelectItem>
                      <SelectItem value="europe">Europe Only</SelectItem>
                      <SelectItem value="asia">Asia Only</SelectItem>
                      <SelectItem value="custom">Custom Regions (specify in details)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            {selectedNFT && (
              <Card>
                <CardHeader>
                  <CardTitle>Listing Preview</CardTitle>
                  <CardDescription>Review your listing details before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative w-full md:w-1/3 aspect-square rounded-md overflow-hidden">
                      <Image
                        src={selectedNFT.image || "/placeholder.svg"}
                        alt={selectedNFT.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="w-full md:w-2/3 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{selectedNFT.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedNFT.attributes.find((attr) => attr.trait_type === "Craft Type")?.value} •
                          {selectedNFT.attributes.find((attr) => attr.trait_type === "Location")?.value}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
                          <p className="font-medium">Ξ {Number.parseFloat(form.getValues("price")).toFixed(4)}</p>
                          <p className="text-xs text-muted-foreground">${ethToUSD(form.getValues("price"))} USD</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Shipping</h4>
                          <p className="font-medium">
                            {form.getValues("shippingRegions") === "worldwide"
                              ? "Worldwide"
                              : form.getValues("shippingRegions") === "north_america"
                                ? "North America Only"
                                : form.getValues("shippingRegions") === "europe"
                                  ? "Europe Only"
                                  : form.getValues("shippingRegions") === "asia"
                                    ? "Asia Only"
                                    : "Custom Regions"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {form.getValues("shippingTimeframe") === "1-3_days"
                              ? "1-3 business days"
                              : form.getValues("shippingTimeframe") === "3-5_days"
                                ? "3-5 business days"
                                : form.getValues("shippingTimeframe") === "1-2_weeks"
                                  ? "1-2 weeks"
                                  : form.getValues("shippingTimeframe") === "2-4_weeks"
                                    ? "2-4 weeks"
                                    : form.getValues("shippingTimeframe") === "4-8_weeks"
                                      ? "4-8 weeks"
                                      : "Custom timeframe"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Shipping Details</h4>
                        <p className="text-sm">{form.getValues("shippingDetails")}</p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviewClick}
                        className="border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                      >
                        View Full NFT Details
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-md">
                    <h4 className="font-medium mb-2">Fee Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Listing Price</span>
                        <span>Ξ {Number.parseFloat(form.getValues("price")).toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Marketplace Fee (5%)</span>
                        <span>Ξ {calculateMarketplaceFee(form.getValues("price"))}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>You Receive</span>
                        <span>Ξ {calculateFinalAmount(form.getValues("price"))}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

<FormField
  control={form.control}
  name="termsAccepted"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
      <FormControl>
        <Checkbox 
          checked={field.value} 
          onCheckedChange={field.onChange} 
          id="terms"
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel htmlFor="terms">I agree to the marketplace terms and conditions</FormLabel>
        <FormDescription>
          By checking this box, you agree to our{" "}
          <a href="#" className="text-primary underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary underline">
            Listing Guidelines
          </a>
          .
        </FormDescription>
        <FormMessage />
      </div>
    </FormItem>
  )}
/>
          </div>
        )

      default:
        return null
    }
  }

  // Render transaction status
  const renderTransactionStatus = () => {
    if (transactionStatus === "idle") {
      return null
    }

    return (
      <div className="space-y-4 mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transaction Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress bar */}
              <Progress
                value={
                  transactionStatus === "approving"
                    ? 25
                    : transactionStatus === "approved"
                      ? 50
                      : transactionStatus === "listing"
                        ? 75
                        : transactionStatus === "success"
                          ? 100
                          : 0
                }
                className="h-2 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-red-600"
              />

              {/* Status steps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {transactionStatus === "approving" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                  ) : transactionStatus === "approved" ||
                    transactionStatus === "listing" ||
                    transactionStatus === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-cyan-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                  )}
                  <span
                    className={
                      transactionStatus === "approving"
                        ? "font-medium text-cyan-500"
                        : transactionStatus === "approved" ||
                            transactionStatus === "listing" ||
                            transactionStatus === "success"
                          ? "font-medium text-cyan-600"
                          : ""
                    }
                  >
                    NFT Approval
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {transactionStatus === "listing" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                  ) : transactionStatus === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-cyan-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                  )}
                  <span
                    className={
                      transactionStatus === "listing"
                        ? "font-medium text-cyan-500"
                        : transactionStatus === "success"
                          ? "font-medium text-cyan-600"
                          : ""
                    }
                  >
                    Listing Creation
                  </span>
                </div>
              </div>

              {/* Status message */}
              {transactionStatus === "approving" && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertTitle>Approving NFT</AlertTitle>
                  <AlertDescription>Please confirm the approval transaction in your wallet...</AlertDescription>
                </Alert>
              )}

              {transactionStatus === "approved" && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                  <AlertTitle>NFT Approved</AlertTitle>
                  <AlertDescription>Your NFT has been approved for trading on the marketplace.</AlertDescription>
                </Alert>
              )}

              {transactionStatus === "listing" && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertTitle>Creating Listing</AlertTitle>
                  <AlertDescription>Please confirm the listing transaction in your wallet...</AlertDescription>
                </Alert>
              )}

              {transactionStatus === "success" && (
                <Alert className="bg-cyan-50 text-cyan-800 border-cyan-200">
                  <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>Your NFT has been successfully listed on the marketplace.</AlertDescription>
                </Alert>
              )}

              {transactionStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {errorMessage || "An error occurred during the transaction. Please try again."}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Steps indicator */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                  currentStep >= index
                    ? "border-cyan-500 bg-gradient-to-r from-cyan-500 to-red-600 text-white"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {currentStep > index ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= index ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Mobile steps indicator */}
        <div className="md:hidden">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Step {currentStep + 1} of {steps.length}
          </p>
          <h2 className="text-xl font-semibold flex items-center">
            <span className="mr-2">{React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}</span>
            {steps[currentStep].title}
          </h2>
        </div>

        {/* Step content */}
        <div className="py-4">{renderStepContent()}</div>

        {/* Transaction status */}
        {renderTransactionStatus()}

        {/* Form navigation */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || transactionStatus !== "idle"}
          >
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid() || transactionStatus !== "idle"}
              className={
                !isStepValid() || transactionStatus !== "idle"
                  ? ""
                  : "bg-gradient-to-r from-cyan-500 to-red-600 hover:from-cyan-600 hover:to-red-700 text-white border-none"
              }
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={transactionStatus !== "idle"}
              className={
                transactionStatus !== "idle"
                  ? ""
                  : "bg-gradient-to-r from-cyan-500 to-red-600 hover:from-cyan-600 hover:to-red-700 text-white border-none"
              }
            >
              List NFT
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

// Label component for NFT selection
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  )
}
