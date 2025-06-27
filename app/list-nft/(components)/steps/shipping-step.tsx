"use client"

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UseFormReturn } from "react-hook-form"

interface ShippingStepProps {
  form: UseFormReturn<any>
}

export function ShippingStep({ form }: ShippingStepProps) {
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
}
