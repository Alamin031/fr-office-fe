"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
import { Label } from "../../../components/ui/label"
import { Search, AlertCircle, CheckCircle, Calendar } from "lucide-react"
import { warrantyService } from "../../../lib/api/services"
import type { Warranty } from "../../../lib/api/types"
import { withProtectedRoute } from "../../../lib/auth/protected-route"
import { toast } from "sonner"

function UserWarrantyPage() {
  const [imei, setImei] = useState("")
  const [warranty, setWarranty] = useState<Warranty | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      if (!imei.trim()) {
        throw new Error("Please enter an IMEI number")
      }

      const response = await warrantyService.lookup(imei)
      setWarranty(response.warranty)
      toast.success(`Warranty found for IMEI: ${imei}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Warranty not found"
      setError(message)
      toast.error(message)
      setWarranty(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 border-green-200"
      case "expired":
        return "bg-red-500/10 text-red-600 border-red-200"
      case "claimed":
        return "bg-blue-500/10 text-blue-600 border-blue-200"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200"
    }
  }

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Check Your Warranty</h1>
        <p className="text-muted-foreground">
          Enter your device IMEI or serial number to check warranty status and coverage details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Warranty Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imei">IMEI / Serial Number</Label>
              <Input
                id="imei"
                placeholder="Enter your device IMEI or serial number"
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Usually found on your device packaging, receipt, or under Settings &gt; About Phone &gt; IMEI
              </p>
            </div>

            {error && (
              <div className="flex gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Searching..." : "Check Warranty"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && warranty && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Warranty Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm text-muted-foreground">Warranty Status</p>
                <p className="mt-1 text-lg font-semibold">
                  {warranty.status === "active"
                    ? "Active & Protected"
                    : warranty.status === "expired"
                      ? "Expired"
                      : "Claimed"}
                </p>
              </div>
              <Badge className={getStatusColor(warranty.status)} variant="secondary">
                {warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1)}
              </Badge>
            </div>

            {/* Duration Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </div>
                <p className="mt-2 font-semibold">{new Date(warranty.startDate).toLocaleDateString()}</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  End Date
                </div>
                <p className="mt-2 font-semibold">{new Date(warranty.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Days Remaining */}
            {warranty.status === "active" && (
              <div className="rounded-lg border-l-4 border-blue-500 bg-blue-500/5 p-4">
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {calculateDaysRemaining(warranty.endDate)} days
                </p>
              </div>
            )}

            {/* Details */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">IMEI / Serial Number</span>
                <span className="font-mono font-medium">{warranty.imei}</span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Warranty ID</span>
                <span className="font-mono text-sm">{warranty.id}</span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Product ID</span>
                <span className="font-mono text-sm">{warranty.productId}</span>
              </div>
            </div>

            {/* Activity Logs */}
            {warranty.logs && warranty.logs.length > 0 && (
              <div className="border-t border-border pt-4">
                <h3 className="mb-3 font-semibold">Activity History</h3>
                <div className="space-y-2">
                  {warranty.logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        {log.description && <p className="mt-1 text-xs text-muted-foreground">{log.description}</p>}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="border-t border-border pt-4">
              <h3 className="mb-2 font-semibold">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                If you have questions about your warranty or need to make a claim, please contact our customer support team.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {searched && !warranty && !error && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No warranty found for this IMEI.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please verify the IMEI number and try again.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default withProtectedRoute(UserWarrantyPage, {
  requiredRoles: ["user"],
  fallbackTo: "/login",
  showLoader: true,
})
