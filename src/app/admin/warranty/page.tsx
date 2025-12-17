"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Label } from "../../components/ui/label"
import { Plus, Search, AlertCircle, CheckCircle } from "lucide-react"
import { warrantyService } from "../../lib/api/services"
import type { Warranty, ActivateWarrantyRequest } from "../../lib/api/types"
import { withProtectedRoute } from "../../lib/auth/protected-route"
import { toast } from "sonner"
import { formatPrice } from "../../lib/utils/format"

interface ActivateFormData {
  orderId: string
  productId: string
  imei: string
}

function WarrantyAdminPage() {
  const [activeTab, setActiveTab] = useState<"activate" | "lookup">("activate")
  const [warranty, setWarranty] = useState<Warranty | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [activateForm, setActivateForm] = useState<ActivateFormData>({
    orderId: "",
    productId: "",
    imei: "",
  })

  const [lookupImei, setLookupImei] = useState("")

  const handleActivateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setActivateForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!activateForm.orderId || !activateForm.productId || !activateForm.imei) {
        throw new Error("All fields are required")
      }

      const response = await warrantyService.activate(activateForm as ActivateWarrantyRequest)
      toast.success(`Warranty activated for IMEI: ${response.imei}`)
      setWarranty(response)
      setActivateForm({ orderId: "", productId: "", imei: "" })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to activate warranty"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!lookupImei) {
        throw new Error("IMEI is required")
      }

      const response = await warrantyService.lookup(lookupImei)
      setWarranty(response.warranty)
      toast.success(`Warranty found for IMEI: ${lookupImei}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Warranty not found"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600"
      case "expired":
        return "bg-red-500/10 text-red-600"
      case "claimed":
        return "bg-blue-500/10 text-blue-600"
      default:
        return "bg-gray-500/10 text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Warranty Management</h1>
        <p className="text-muted-foreground">Manage product warranties and activations.</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => {
            setActiveTab("activate")
            setError(null)
            setWarranty(null)
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "activate"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Activate Warranty
        </button>
        <button
          onClick={() => {
            setActiveTab("lookup")
            setError(null)
            setWarranty(null)
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "lookup"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Lookup Warranty
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {activeTab === "activate" ? "Activate New Warranty" : "Lookup Warranty"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={activeTab === "activate" ? handleActivateSubmit : handleLookupSubmit}
              className="space-y-4"
            >
              {activeTab === "activate" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input
                      id="orderId"
                      name="orderId"
                      placeholder="Enter order ID"
                      value={activateForm.orderId}
                      onChange={handleActivateChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productId">Product ID</Label>
                    <Input
                      id="productId"
                      name="productId"
                      placeholder="Enter product ID"
                      value={activateForm.productId}
                      onChange={handleActivateChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imei">IMEI / Serial Number</Label>
                    <Input
                      id="imei"
                      name="imei"
                      placeholder="Enter IMEI or serial number"
                      value={activateForm.imei}
                      onChange={handleActivateChange}
                      disabled={loading}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="lookup-imei">IMEI / Serial Number</Label>
                  <Input
                    id="lookup-imei"
                    placeholder="Enter IMEI to lookup warranty"
                    value={lookupImei}
                    onChange={(e) => setLookupImei(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {error && (
                <div className="flex gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : activeTab === "activate" ? "Activate Warranty" : "Lookup"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Section */}
        {warranty && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Warranty Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(warranty.status)} variant="secondary">
                    {warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">IMEI / Serial</span>
                  <span className="font-mono font-medium">{warranty.imei}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Start Date</span>
                  <span>{new Date(warranty.startDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">End Date</span>
                  <span>{new Date(warranty.endDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Warranty ID</span>
                  <span className="font-mono text-sm">{warranty.id}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Product ID</span>
                  <span className="font-mono text-sm">{warranty.productId}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-sm">{warranty.orderId}</span>
                </div>
              </div>

              {warranty.logs && warranty.logs.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="mb-3 font-semibold">Activity Logs</h3>
                  <div className="space-y-2">
                    {warranty.logs.map((log) => (
                      <div key={log.id} className="rounded-lg bg-muted/50 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{log.action}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {log.description && <p className="mt-1 text-muted-foreground">{log.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default withProtectedRoute(WarrantyAdminPage, {
  requiredRoles: ["admin"],
  fallbackTo: "/login",
  showLoader: true,
})
