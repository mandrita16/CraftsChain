"use client"

import Image from "next/image"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { CraftItemDetails } from "../craft-item-detail-modal"
import type { UseFormReturn } from "react-hook-form"

interface PreviewStepProps {
  form: UseFormReturn<any>
  selectedNFT: CraftItemDetails | null
  handlePreviewClick: () => void
}

export function PreviewStep({ form, selectedNFT, handlePreviewClick }: PreviewStepProps) {
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
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>I agree to the marketplace terms and conditions</FormLabel>
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
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
