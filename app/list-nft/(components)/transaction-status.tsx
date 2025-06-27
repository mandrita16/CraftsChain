import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { TransactionStatus as TransactionStatusType } from "./NFTListingform"

interface TransactionStatusProps {
  status: TransactionStatusType
  errorMessage: string | null
}

export function TransactionStatus({ status, errorMessage }: TransactionStatusProps) {
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
                status === "approving"
                  ? 25
                  : status === "approved"
                    ? 50
                    : status === "listing"
                      ? 75
                      : status === "success"
                        ? 100
                        : 0
              }
              className="h-2 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-red-600"
            />

            {/* Status steps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {status === "approving" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                ) : status === "approved" || status === "listing" || status === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-cyan-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                )}
                <span
                  className={
                    status === "approving"
                      ? "font-medium text-cyan-500"
                      : status === "approved" || status === "listing" || status === "success"
                        ? "font-medium text-cyan-600"
                        : ""
                  }
                >
                  NFT Approval
                </span>
              </div>

              <div className="flex items-center gap-2">
                {status === "listing" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                ) : status === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-cyan-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                )}
                <span
                  className={
                    status === "listing"
                      ? "font-medium text-cyan-500"
                      : status === "success"
                        ? "font-medium text-cyan-600"
                        : ""
                  }
                >
                  Listing Creation
                </span>
              </div>
            </div>

            {/* Status message */}
            {status === "approving" && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Approving NFT</AlertTitle>
                <AlertDescription>Please confirm the approval transaction in your wallet...</AlertDescription>
              </Alert>
            )}

            {status === "approved" && (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                <AlertTitle>NFT Approved</AlertTitle>
                <AlertDescription>Your NFT has been approved for trading on the marketplace.</AlertDescription>
              </Alert>
            )}

            {status === "listing" && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Creating Listing</AlertTitle>
                <AlertDescription>Please confirm the listing transaction in your wallet...</AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-cyan-50 text-cyan-800 border-cyan-200">
                <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>Your NFT has been successfully listed on the marketplace.</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
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
