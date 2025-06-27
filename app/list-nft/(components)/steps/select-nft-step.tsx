"use client"

import type React from "react"

import Image from "next/image"
import { Loader2 } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import type { CraftItemDetails } from "../craft-item-detail-modal"
import type { UseFormReturn } from "react-hook-form"

interface SelectNFTStepProps {
  form: UseFormReturn<any>
  watchedNftId: string
  loadingNFTs: boolean
  ownedNFTs: CraftItemDetails[]
  updateSelectedNFT: (id: string) => void
}

export function SelectNFTStep({ form, watchedNftId, loadingNFTs, ownedNFTs, updateSelectedNFT }: SelectNFTStepProps) {
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
                  <p className="mt-2 text-sm text-muted-foreground">Loading your NFTs</p>
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
                          <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium truncate">{nft.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {nft.attributes.find((attr) => attr.trait_type === "Craft Type")?.value || "NFT"}
                          </p>
                        </div>
                        {watchedNftId === nft.id.toString() && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-gradient-to-r from-cyan-500 to-red-600 text-white">Selected</Badge>
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
}

// Label component for NFT selection
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  )
}
