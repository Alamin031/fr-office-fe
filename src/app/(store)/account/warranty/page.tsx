/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [formData, setFormData] = useState({
    imei: "",
    serial: "",
    phone: "",
  })
  const [warranty, setWarranty] = useState<Warranty | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.imei.trim() && !formData.serial.trim()) {
      errors.identifier = "Please enter either IMEI or Serial Number"
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const lookupData: Record<string, string> = {}

      if (formData.imei.trim()) {
        lookupData.imei = formData.imei.trim()
      }
      if (formData.serial.trim()) {
        lookupData.serial = formData.serial.trim()
      }
      if (formData.phone.trim()) {
        lookupData.phone = formData.phone.trim()
      }

      const response = await warrantyService.lookup(lookupData)
      setWarranty(response)
      toast.success(`Warranty found`)
    } catch (err) {
      const getErrorMessage = (error: unknown) => {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as any).response?.data?.message
        ) {
          return (error as any).response.data.message as string
        }
        if (error instanceof Error) return error.message
        return "Warranty not found"
      }

      const message = getErrorMessage(err)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Check Your Warranty</h1>
        <p className="text-muted-foreground">
          Enter your device IMEI or serial number and phone number to check warranty status and coverage details.
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="imei">IMEI Number</Label>
                <Input
                  id="imei"
                  name="imei"
                  placeholder="Enter IMEI number"
                  value={formData.imei}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={formErrors.identifier ? "border-red-500" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  Usually found under Settings &gt; About Phone &gt; IMEI
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial">Serial Number</Label>
                <Input
                  id="serial"
                  name="serial"
                  placeholder="Or enter Serial Number"
                  value={formData.serial}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={formErrors.identifier ? "border-red-500" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  Found on device packaging or receipt
                </p>
              </div>
            </div>

            {formErrors.identifier && (
              <div className="flex gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formErrors.identifier}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
                className={formErrors.phone ? "border-red-500" : ""}
              />
              {formErrors.phone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.phone}
                </p>
              )}
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
                <p className="mt-2 font-semibold">{formatDate(warranty.startDate)}</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  End Date
                </div>
                <p className="mt-2 font-semibold">{formatDate(warranty.endDate)}</p>
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

            {/* Details (IMEI/Serial only) */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">IMEI / Serial Number</span>
                <span className="font-mono font-medium">{warranty.imei}</span>
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
                          {formatDate(log.createdAt)} {new Date(log.createdAt).toLocaleTimeString()}
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
            <p className="mt-4 text-muted-foreground">No warranty found.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please verify the IMEI/Serial number and phone number, then try again.
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
