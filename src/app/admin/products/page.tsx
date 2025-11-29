'use client'

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Copy } from "lucide-react"
import { withProtectedRoute } from "../../lib/auth/protected-route"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Checkbox } from "../../components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog"
import { formatPrice } from "../../lib/utils/format"

interface Product {
  id: string
  name: string
  image: string
  sku: string
  category: string
  price: number
  stock: number
  status: string
  description?: string
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    image: "/placeholder.svg?key=fzlxk",
    sku: "IPH-15PM-256",
    category: "Smartphones",
    price: 129999,
    stock: 45,
    status: "Active",
    description: "Latest iPhone with advanced features and powerful performance.",
  },
  {
    id: "2",
    name: "MacBook Air M3",
    image: "/placeholder.svg?key=qlv3u",
    sku: "MAC-AIR-M3-256",
    category: "Laptops",
    price: 79999,
    stock: 23,
    status: "Active",
    description: "Lightweight laptop with M3 chip for seamless performance.",
  },
  {
    id: "3",
    name: "Samsung Galaxy S24 Ultra",
    image: "/placeholder.svg?key=u1e3e",
    sku: "SAM-S24U-256",
    category: "Smartphones",
    price: 89999,
    stock: 0,
    status: "Out of Stock",
    description: "Premium smartphone with cutting-edge technology.",
  },
  {
    id: "4",
    name: "Sony WH-1000XM5",
    image: "/placeholder.svg?key=b6kf9",
    sku: "SON-WH1000XM5",
    category: "Audio",
    price: 29999,
    stock: 67,
    status: "Active",
    description: "High-quality wireless headphones with noise cancellation.",
  },
  {
    id: "5",
    name: "iPad Pro 12.9",
    image: "/placeholder.svg?key=7t86x",
    sku: "IPD-PRO-129",
    category: "Tablets",
    price: 99999,
    stock: 12,
    status: "Low Stock",
    description: "Powerful tablet for professionals and creators.",
  },
]

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Product | null>(null)

  const handleViewClick = (product: Product) => {
    setSelectedProduct(product)
    setViewOpen(true)
  }

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setEditFormData({ ...product })
    setEditOpen(true)
  }

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product)
    setDeleteOpen(true)
  }

  const handleSaveEdit = () => {
    if (editFormData) {
      setProducts(products.map((p) => (p.id === editFormData.id ? editFormData : p)))
      setEditOpen(false)
      setEditFormData(null)
    }
  }

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      setProducts(products.filter((p) => p.id !== selectedProduct.id))
      setDeleteOpen(false)
      setSelectedProduct(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-9" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="smartphones">Smartphones</SelectItem>
                  <SelectItem value="laptops">Laptops</SelectItem>
                  <SelectItem value="tablets">Tablets</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4">
                    <Checkbox />
                  </th>
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4">SKU</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Price</th>
                  <th className="pb-3 pr-4">Stock</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border">
                    <td className="py-4 pr-4">
                      <Checkbox />
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm text-muted-foreground">{product.sku}</td>
                    <td className="py-4 pr-4 text-sm">{product.category}</td>
                    <td className="py-4 pr-4 font-medium">{formatPrice(product.price)}</td>
                    <td className="py-4 pr-4">{product.stock}</td>
                    <td className="py-4 pr-4">
                      <Badge
                        variant="secondary"
                        className={
                          product.status === "Active"
                            ? "bg-green-500/10 text-green-600"
                            : product.status === "Low Stock"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-red-500/10 text-red-600"
                        }
                      >
                        {product.status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewClick(product)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(product)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing 1-5 of 456 products</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Product</DialogTitle>
            <DialogDescription>Product details and information</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-lg bg-muted p-4">
                  <Image
                    src={selectedProduct.image || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    width={200}
                    height={200}
                    className="h-48 w-full object-cover rounded"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Product Name</Label>
                    <p className="mt-1 font-medium text-base">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">SKU</Label>
                    <p className="mt-1 font-medium text-base">{selectedProduct.sku}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Category</Label>
                    <p className="mt-1 font-medium text-base">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Price</Label>
                    <p className="mt-1 font-medium text-base">{formatPrice(selectedProduct.price)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Stock</Label>
                    <p className="mt-1 font-medium text-base">{selectedProduct.stock}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Status</Label>
                    <div className="mt-1">
                      <Badge
                        variant="secondary"
                        className={
                          selectedProduct.status === "Active"
                            ? "bg-green-500/10 text-green-600"
                            : selectedProduct.status === "Low Stock"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-red-500/10 text-red-600"
                        }
                      >
                        {selectedProduct.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              {selectedProduct.description && (
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Description</Label>
                  <p className="mt-2 text-sm">{selectedProduct.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          {editFormData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sku">SKU</Label>
                  <Input
                    id="edit-sku"
                    value={editFormData.sku}
                    onChange={(e) => setEditFormData({ ...editFormData, sku: e.target.value })}
                    placeholder="Enter SKU"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    placeholder="Enter category"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                    placeholder="Enter price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editFormData.stock}
                    onChange={(e) => setEditFormData({ ...editFormData, stock: Number(e.target.value) })}
                    placeholder="Enter stock quantity"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editFormData.status} onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{selectedProduct?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default withProtectedRoute(AdminProductsPage, {
  requiredRoles: ["admin"],
  fallbackTo: "/login",
  showLoader: true,
})
