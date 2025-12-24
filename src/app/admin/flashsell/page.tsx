"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Checkbox } from "../../components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog"
import { Badge } from "../../components/ui/badge"
import { Plus, Edit2, Trash2, Zap, Calendar, AlertCircle, Image as ImageIcon } from "lucide-react"
import { flashsellService, type Flashsell } from "../../lib/api/services/flashsell"
import { productsService } from "../../lib/api/services"
import type { Product } from "../../lib/api/types"
import { withProtectedRoute } from "../../lib/auth/protected-route"
import { toast } from "sonner"
import Image from "next/image"

interface FormData {
  title: string
  bannerImg: File | string | null
  productIds: string[]
  startTime: string
  endTime: string
  discountpercentage: number
  stock: number
}



function AdminFlashsellPage() {
  const [flashsells, setFlashsells] = useState<Flashsell[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Flashsell | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState("")

  const [form, setForm] = useState<FormData>({
    title: "",
    bannerImg: null,
    productIds: [],
    startTime: "",
    endTime: "",
    discountpercentage: 0,
    stock: 0,
  })

  useEffect(() => {
    fetchFlashsells()
    fetchAllProducts()
  }, [])

  const fetchFlashsells = async () => {
    try {
      const data = await flashsellService.findAll()
      setFlashsells(data)
    } catch {
      toast.error("Failed to load flashsell events")
    }
  }

  const fetchAllProducts = async () => {
    try {
      const response = await productsService.getAllLite({}, 1, 1000)
      const products = Array.isArray(response) ? response : response.data || []
      setAllProducts(products)
    } catch {
      toast.error("Failed to load products")
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditMode(false)
    setEditingId(null)
    setBannerPreview(null)
    setProductSearch("")
    setForm({
      title: "",
      bannerImg: null,
      productIds: [],
      startTime: "",
      endTime: "",
      discountpercentage: 0,
      stock: 0,
    })
  }

  const handleAddClick = () => {
    setForm({
      title: "",
      bannerImg: null,
      productIds: [],
      startTime: "",
      endTime: "",
      discountpercentage: 0,
      stock: 0,
    })
    setBannerPreview(null)
    setProductSearch("")
    setEditMode(false)
    setEditingId(null)
    setModalOpen(true)
  }

  const handleEditClick = (flashsell: Flashsell) => {
    setForm({
      title: flashsell.title,
      bannerImg: flashsell.bannerImg,
      productIds: flashsell.productIds,
      startTime: flashsell.startTime,
      endTime: flashsell.endTime,
      discountpercentage: flashsell.discountpercentage,
      stock: flashsell.stock,
    })
    setBannerPreview(flashsell.bannerImg)
    setProductSearch("")
    setEditingId(flashsell.id)
    setEditMode(true)
    setModalOpen(true)
  }

  const handleDeleteClick = (flashsell: Flashsell) => {
    setDeleteTarget(flashsell)
    setDeleteModalOpen(true)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "discountpercentage" || name === "stock") {
      setForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm((prev) => ({ ...prev, bannerImg: file }))

      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProductToggle = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }))
  }

  const handleSave = async () => {
    if (!form.title || !form.startTime || !form.endTime || form.productIds.length === 0) {
      toast.error("Please fill in all required fields and select at least one product")
      return
    }

    if (form.discountpercentage <= 0 || form.stock <= 0) {
      toast.error("Discount percentage and stock must be greater than 0")
      return
    }

    const startDate = new Date(form.startTime)
    const endDate = new Date(form.endTime)

    if (startDate >= endDate) {
      toast.error("End time must be after start time")
      return
    }

    setLoading(true)
    try {
      if (editMode && editingId) {
        await flashsellService.update(editingId, {
          ...form,
          bannerImg: form.bannerImg === null ? undefined : form.bannerImg,
        })
        toast.success("Flashsell updated successfully!")
      } else {
        await flashsellService.create({
          ...form,
          bannerImg: form.bannerImg === null ? undefined : form.bannerImg,
        })
        toast.success("Flashsell created successfully!")
      }

      await fetchFlashsells()
      handleModalClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save flashsell"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setLoading(true)
    try {
      await flashsellService.remove(deleteTarget.id)
      toast.success("Flashsell deleted successfully!")
      await fetchFlashsells()
      setDeleteModalOpen(false)
      setDeleteTarget(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete flashsell"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getFlashsellStatus = (startTime: string, endTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (now < start) {
      return { label: "Upcoming", color: "bg-blue-500/10 text-blue-600" }
    } else if (now > end) {
      return { label: "Ended", color: "bg-gray-500/10 text-gray-600" }
    } else {
      return { label: "Active", color: "bg-green-500/10 text-green-600" }
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const filteredProducts = allProducts.filter((product) =>
    product.name?.toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flash Sale Management</h1>
          <p className="text-muted-foreground">Create and manage flash sale events.</p>
        </div>
        <Button onClick={handleAddClick} className="gap-2">
          <Plus className="h-4 w-4" />
          New Flash Sale
        </Button>
      </div>

      {flashsells.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Zap className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No flash sale events yet</p>
            <Button onClick={handleAddClick} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create First Flash Sell
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flashsells.map((flashsell) => {
            const status = getFlashsellStatus(flashsell.startTime, flashsell.endTime)
            return (
              <Card key={flashsell.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-1 gap-4">
                      {flashsell.bannerImg && (
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={flashsell.bannerImg}
                            alt={flashsell.title}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{flashsell.title}</h3>
                          <Badge className={status.color} variant="secondary">
                            {status.label}
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Discount %:</span>
                            <span className="font-medium">{flashsell.discountpercentage}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Stock:</span>
                            <span className="font-medium">{flashsell.stock} units</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Products:</span>
                            <span className="font-medium">{flashsell.productIds.length}</span>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Start:</span>
                            <span>{formatDateTime(flashsell.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">End:</span>
                            <span>{formatDateTime(flashsell.endTime)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(flashsell)}
                        className="gap-1"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(flashsell)}
                        className="gap-1 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {editMode ? "Edit Flash Sell" : "Create New Flash Sell"}
            </DialogTitle>
            <DialogDescription>
              {editMode ? "Update the flash sale event details." : "Set up a new flash sale event."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Summer Flash Sale"
                value={form.title}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>

            {/* Banner Image Upload */}
            <div className="space-y-2">
              <Label>Banner Image *</Label>
              <div className="flex flex-col gap-3">
                {bannerPreview && (
                  <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border bg-muted">
                    <Image
                      src={bannerPreview}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 transition-colors hover:bg-muted/50">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload banner image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Discount and Stock */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discountpercentage">Discount Percentage (%) *</Label>
                <Input
                  id="discountpercentage"
                  name="discountpercentage"
                  type="number"
                  placeholder="0"
                  value={form.discountpercentage || ""}
                  onChange={handleFormChange}
                  disabled={loading}
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  placeholder="0"
                  value={form.stock || ""}
                  onChange={handleFormChange}
                  disabled={loading}
                  min="0"
                />
              </div>
            </div>

            {/* Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={handleFormChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  value={form.endTime}
                  onChange={handleFormChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Products * ({form.productIds.length} selected)</Label>
              </div>
              <Input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                disabled={loading}
                className="mb-2"
              />
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No products found</p>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50"
                    >
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={form.productIds.includes(product.id)}
                        onCheckedChange={() => handleProductToggle(product.id)}
                        disabled={loading}
                      />
                      <label
                        htmlFor={`product-${product.id}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku || product.id}</p>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : editMode ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={handleModalClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Flash Sell
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 pt-4">
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={loading} className="flex-1">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withProtectedRoute(AdminFlashsellPage, {
  requiredRoles: ["admin"],
  fallbackTo: "/login",
  showLoader: true,
})
