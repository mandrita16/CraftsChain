import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { UseFormReturn } from "react-hook-form"

interface PricingStepProps {
  form: UseFormReturn<any>
  watchedPrice: string
}

export function PricingStep({ form, watchedPrice }: PricingStepProps) {
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
}
