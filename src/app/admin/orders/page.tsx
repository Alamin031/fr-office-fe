'use client'

import { useState } from "react"
import Link from "next/link"
import { Search, Filter, Eye, MoreVertical, Download, Printer, Plus, Mail, X } from "lucide-react"
import { withProtectedRoute } from "../../lib/auth/protected-route"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Checkbox } from "../../components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "../../components/ui/sheet"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { formatPrice } from "../../lib/utils/format"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customer: string
  email: string
  items: number
  total: number
  status: string
  payment: string
  date: string
  address?: string
  phone?: string
  orderItems?: OrderItem[]
}

const initialOrders: Order[] = [
  {
    id: "ORD-2024-001",
    customer: "John Doe",
    email: "john@example.com",
    items: 2,
    total: 148399,
    status: "Processing",
    payment: "Paid",
    date: "Nov 20, 2024",
    address: "123 Main Street, Dhaka, Bangladesh",
    phone: "+880 1234567890",
    orderItems: [
      { id: "1", name: "iPhone 15 Pro Max", quantity: 1, price: 129999 },
      { id: "2", name: "Sony WH-1000XM5", quantity: 1, price: 29999 },
    ],
  },
  {
    id: "ORD-2024-002",
    customer: "Jane Smith",
    email: "jane@example.com",
    items: 1,
    total: 49999,
    status: "Shipped",
    payment: "Paid",
    date: "Nov 19, 2024",
    address: "456 Oak Avenue, Chittagong, Bangladesh",
    phone: "+880 9876543210",
    orderItems: [
      { id: "3", name: "iPad Pro 12.9", quantity: 1, price: 49999 },
    ],
  },
  {
    id: "ORD-2024-003",
    customer: "Bob Wilson",
    email: "bob@example.com",
    items: 3,
    total: 79999,
    status: "Delivered",
    payment: "Paid",
    date: "Nov 18, 2024",
    address: "789 Pine Road, Sylhet, Bangladesh",
    phone: "+880 5555555555",
    orderItems: [
      { id: "4", name: "Samsung Galaxy S24 Ultra", quantity: 1, price: 89999 },
    ],
  },
  {
    id: "ORD-2024-004",
    customer: "Alice Brown",
    email: "alice@example.com",
    items: 1,
    total: 15999,
    status: "Pending",
    payment: "Pending",
    date: "Nov 17, 2024",
    address: "321 Elm Street, Rajshahi, Bangladesh",
    phone: "+880 3333333333",
    orderItems: [
      { id: "5", name: "Wireless Earbuds", quantity: 1, price: 15999 },
    ],
  },
  {
    id: "ORD-2024-005",
    customer: "Charlie Davis",
    email: "charlie@example.com",
    items: 2,
    total: 249999,
    status: "Cancelled",
    payment: "Refunded",
    date: "Nov 16, 2024",
    address: "654 Birch Lane, Khulna, Bangladesh",
    phone: "+880 7777777777",
    orderItems: [
      { id: "6", name: "MacBook Air M3", quantity: 1, price: 79999 },
      { id: "7", name: "Magic Mouse", quantity: 1, price: 10000 },
    ],
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-green-500/10 text-green-600"
    case "Shipped":
      return "bg-blue-500/10 text-blue-600"
    case "Processing":
      return "bg-yellow-500/10 text-yellow-600"
    case "Pending":
      return "bg-orange-500/10 text-orange-600"
    case "Cancelled":
      return "bg-red-500/10 text-red-600"
    default:
      return ""
  }
}

function getPaymentColor(payment: string) {
  switch (payment) {
    case "Paid":
      return "bg-green-500/10 text-green-600"
    case "Pending":
      return "bg-yellow-500/10 text-yellow-600"
    case "Refunded":
      return "bg-gray-500/10 text-gray-600"
    default:
      return ""
  }
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [viewOpen, setViewOpen] = useState(false)
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [newOrderForm, setNewOrderForm] = useState({
    customer: "",
    email: "",
    phone: "",
    address: "",
    items: [{ name: "", quantity: 1, price: 0 }],
    status: "Pending",
    payment: "Pending",
  })

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!newOrderForm.customer.trim()) {
      errors.customer = "Customer name is required"
    }
    if (!newOrderForm.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newOrderForm.email)) {
      errors.email = "Please enter a valid email"
    }
    if (!newOrderForm.phone.trim()) {
      errors.phone = "Phone is required"
    }
    if (!newOrderForm.address.trim()) {
      errors.address = "Address is required"
    }

    const validItems = newOrderForm.items.filter(item => item.name.trim() !== "")
    if (validItems.length === 0) {
      errors.items = "At least one item is required"
    }

    validItems.forEach((item, index) => {
      if (item.quantity < 1) {
        errors[`item-qty-${index}`] = "Quantity must be at least 1"
      }
      if (item.price < 0) {
        errors[`item-price-${index}`] = "Price cannot be negative"
      }
    })

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleViewClick = (order: Order) => {
    setSelectedOrder(order)
    setViewOpen(true)
  }

  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open("", "", "height=600,width=800")
    if (printWindow) {
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${order.id}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: white; }
              .invoice-container { max-width: 800px; margin: 0 auto; padding: 40px; }
              .header { text-align: center; margin-bottom: 40px; }
              .header h1 { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
              .header p { color: #666; font-size: 14px; }
              .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
              .invoice-section h3 { font-weight: bold; margin-bottom: 10px; font-size: 14px; }
              .invoice-section p { font-size: 13px; color: #666; line-height: 1.8; }
              .invoice-section .label { font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin: 30px 0; }
              table thead { background-color: #f5f5f5; }
              table th { padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
              table td { padding: 12px; border-bottom: 1px solid #eee; }
              table tr:last-child td { border-bottom: 2px solid #ddd; }
              .total-section { display: flex; justify-content: flex-end; margin-top: 30px; margin-bottom: 30px; }
              .total-box { width: 300px; padding: 20px; border-top: 2px solid #333; }
              .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
              .total-row.final { font-size: 18px; font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px; }
              .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
              @media print { body { margin: 0; padding: 0; } .invoice-container { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="header">
                <h1>INVOICE</h1>
                <p>${order.id}</p>
              </div>

              <div class="invoice-details">
                <div class="invoice-section">
                  <h3>From:</h3>
                  <p><span class="label">Your Store Name</span><br>123 Business Street<br>Dhaka, Bangladesh</p>
                </div>
                <div class="invoice-section">
                  <h3>Bill To:</h3>
                  <p>
                    <span class="label">${order.customer}</span><br>
                    ${order.email}<br>
                    ${order.phone}<br>
                    ${order.address}
                  </p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th style="text-align: right; width: 80px;">Qty</th>
                    <th style="text-align: right; width: 100px;">Price</th>
                    <th style="text-align: right; width: 120px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.orderItems?.map((item) => `
                    <tr>
                      <td>${item.name}</td>
                      <td style="text-align: right;">${item.quantity}</td>
                      <td style="text-align: right;">৳ ${item.price.toLocaleString("en-BD")}</td>
                      <td style="text-align: right;">৳ ${(item.price * item.quantity).toLocaleString("en-BD")}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>

              <div class="total-section">
                <div class="total-box">
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <span>৳ ${order.total.toLocaleString("en-BD")}</span>
                  </div>
                  <div class="total-row final">
                    <span>Total:</span>
                    <span>৳ ${order.total.toLocaleString("en-BD")}</span>
                  </div>
                </div>
              </div>

              <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Payment Status:</strong> ${order.payment}</p>
              </div>

              <div class="footer">
                <p>Thank you for your business!</p>
                <p>Invoice generated on ${new Date().toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            </div>
          </body>
        </html>
      `
      printWindow.document.write(invoiceHTML)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleSendInvoiceEmail = (order: Order) => {
    alert(`Invoice email sent to ${order.email}`)
  }

  const handleAddOrder = () => {
    if (!validateForm()) {
      return
    }

    const validItems = newOrderForm.items.filter(item => item.name.trim() !== "")
    const totalAmount = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const newOrder: Order = {
      id: `ORD-2024-${String(orders.length + 1).padStart(3, "0")}`,
      customer: newOrderForm.customer,
      email: newOrderForm.email,
      items: validItems.length,
      total: totalAmount,
      status: newOrderForm.status,
      payment: newOrderForm.payment,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      address: newOrderForm.address,
      phone: newOrderForm.phone,
      orderItems: validItems.map((item, idx) => ({
        id: String(idx),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }
    setOrders([newOrder, ...orders])
    setAddDrawerOpen(false)
    setFormErrors({})
    setNewOrderForm({
      customer: "",
      email: "",
      phone: "",
      address: "",
      items: [{ name: "", quantity: 1, price: 0 }],
      status: "Pending",
      payment: "Pending",
    })
  }

  const addOrderItem = () => {
    setNewOrderForm({
      ...newOrderForm,
      items: [...newOrderForm.items, { name: "", quantity: 1, price: 0 }],
    })
  }

  const removeOrderItem = (index: number) => {
    setNewOrderForm({
      ...newOrderForm,
      items: newOrderForm.items.filter((_, i) => i !== index),
    })
  }

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...newOrderForm.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setNewOrderForm({ ...newOrderForm, items: updatedItems })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and process customer orders.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setAddDrawerOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Order
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all">All (234)</TabsTrigger>
                <TabsTrigger value="pending">Pending (12)</TabsTrigger>
                <TabsTrigger value="processing">Processing (8)</TabsTrigger>
                <TabsTrigger value="shipped">Shipped (15)</TabsTrigger>
                <TabsTrigger value="delivered">Delivered (189)</TabsTrigger>
              </TabsList>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search orders..." className="pl-9" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>

            <TabsContent value="all">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-sm text-muted-foreground">
                      <th className="pb-3 pr-4">
                        <Checkbox />
                      </th>
                      <th className="pb-3 pr-4">Order</th>
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Items</th>
                      <th className="pb-3 pr-4">Total</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Payment</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-border">
                        <td className="py-4 pr-4">
                          <Checkbox />
                        </td>
                        <td className="py-4 pr-4">
                          <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                            {order.id}
                          </Link>
                        </td>
                        <td className="py-4 pr-4">
                          <div>
                            <p className="font-medium">{order.customer}</p>
                            <p className="text-sm text-muted-foreground">{order.email}</p>
                          </div>
                        </td>
                        <td className="py-4 pr-4">{order.items}</td>
                        <td className="py-4 pr-4 font-medium">{formatPrice(order.total)}</td>
                        <td className="py-4 pr-4">
                          <Badge variant="secondary" className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant="secondary" className={getPaymentColor(order.payment)}>
                            {order.payment}
                          </Badge>
                        </td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">{order.date}</td>
                        <td className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewClick(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrintInvoice(order)}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendInvoiceEmail(order)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing 1-5 of 234 orders</p>
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

      {/* View Details Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Complete order information and items</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Order ID</Label>
                  <p className="mt-1 font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Order Date</Label>
                  <p className="mt-1 font-medium">{selectedOrder.date}</p>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <h3 className="font-semibold">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Name</Label>
                    <p className="mt-1 font-medium">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Email</Label>
                    <p className="mt-1 font-medium text-sm">{selectedOrder.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Phone</Label>
                    <p className="mt-1 font-medium">{selectedOrder.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Address</Label>
                    <p className="mt-1 font-medium text-sm">{selectedOrder.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <h3 className="font-semibold">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <h3 className="font-semibold">Order Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Status</Label>
                    <div className="mt-1">
                      <Badge variant="secondary" className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Payment</Label>
                    <div className="mt-1">
                      <Badge variant="secondary" className={getPaymentColor(selectedOrder.payment)}>
                        {selectedOrder.payment}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-lg font-bold">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Manual Order Drawer */}
      <Sheet open={addDrawerOpen} onOpenChange={(open) => {
        setAddDrawerOpen(open)
        if (!open) {
          setFormErrors({})
        }
      }}>
        <SheetContent side="right" className="w-full sm:w-[650px] overflow-y-auto flex flex-col">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-2xl">Add Manual Order</SheetTitle>
            <SheetDescription>Create a new order by filling in the customer and order details below</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 py-4">
              {/* Customer Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <h3 className="text-lg font-semibold">Customer Information</h3>
                  <span className="text-sm text-red-500">*</span>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="order-customer" className="flex gap-1">
                      Customer Name
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="order-customer"
                      value={newOrderForm.customer}
                      onChange={(e) => {
                        setNewOrderForm({ ...newOrderForm, customer: e.target.value })
                        if (formErrors.customer) setFormErrors({ ...formErrors, customer: "" })
                      }}
                      placeholder="John Doe"
                      className={formErrors.customer ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {formErrors.customer && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span>•</span> {formErrors.customer}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="order-email" className="flex gap-1">
                        Email
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="order-email"
                        type="email"
                        value={newOrderForm.email}
                        onChange={(e) => {
                          setNewOrderForm({ ...newOrderForm, email: e.target.value })
                          if (formErrors.email) setFormErrors({ ...formErrors, email: "" })
                        }}
                        placeholder="john@example.com"
                        className={formErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span>•</span> {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="order-phone" className="flex gap-1">
                        Phone
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="order-phone"
                        value={newOrderForm.phone}
                        onChange={(e) => {
                          setNewOrderForm({ ...newOrderForm, phone: e.target.value })
                          if (formErrors.phone) setFormErrors({ ...formErrors, phone: "" })
                        }}
                        placeholder="+880 1234567890"
                        className={formErrors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span>•</span> {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order-address" className="flex gap-1">
                      Delivery Address
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="order-address"
                      value={newOrderForm.address}
                      onChange={(e) => {
                        setNewOrderForm({ ...newOrderForm, address: e.target.value })
                        if (formErrors.address) setFormErrors({ ...formErrors, address: "" })
                      }}
                      placeholder="Enter full delivery address"
                      rows={3}
                      className={formErrors.address ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {formErrors.address && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span>•</span> {formErrors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Order Items</h3>
                    <span className="text-sm text-red-500">*</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addOrderItem}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {formErrors.items && (
                  <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 border border-red-200 rounded px-3 py-2">
                    <span>•</span> {formErrors.items}
                  </p>
                )}

                <div className="space-y-3">
                  {newOrderForm.items.map((item, index) => (
                    <div key={index} className="space-y-3 rounded-lg border border-border bg-card/30 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                        {newOrderForm.items.length > 1 && (
                          <button
                            onClick={() => removeOrderItem(index)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Remove item"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`item-name-${index}`} className="text-xs font-medium">
                          Product Name
                        </Label>
                        <Input
                          id={`item-name-${index}`}
                          value={item.name}
                          onChange={(e) => updateOrderItem(index, "name", e.target.value)}
                          placeholder="e.g., iPhone 15 Pro Max"
                          className="text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`item-qty-${index}`} className="text-xs font-medium">
                            Quantity
                          </Label>
                          <Input
                            id={`item-qty-${index}`}
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, "quantity", Number(e.target.value))}
                            min="1"
                            className={`text-sm ${formErrors[`item-qty-${index}`] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          />
                          {formErrors[`item-qty-${index}`] && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              <span>•</span> {formErrors[`item-qty-${index}`]}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`item-price-${index}`} className="text-xs font-medium">
                            Price
                          </Label>
                          <Input
                            id={`item-price-${index}`}
                            type="number"
                            value={item.price}
                            onChange={(e) => updateOrderItem(index, "price", Number(e.target.value))}
                            min="0"
                            placeholder="0"
                            className={`text-sm ${formErrors[`item-price-${index}`] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          />
                          {formErrors[`item-price-${index}`] && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              <span>•</span> {formErrors[`item-price-${index}`]}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.name && item.price > 0 && (
                        <div className="rounded bg-muted px-3 py-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Subtotal</span>
                          <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold pb-2">Order Status</h3>
                <div className="rounded-lg border border-border bg-card/50 p-4 grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="order-status" className="text-sm font-medium">
                      Order Status
                    </Label>
                    <Select value={newOrderForm.status} onValueChange={(value) => setNewOrderForm({ ...newOrderForm, status: value })}>
                      <SelectTrigger id="order-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order-payment" className="text-sm font-medium">
                      Payment Status
                    </Label>
                    <Select value={newOrderForm.payment} onValueChange={(value) => setNewOrderForm({ ...newOrderForm, payment: value })}>
                      <SelectTrigger id="order-payment">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Total Amount Section */}
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Amount</span>
                  <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                    {formatPrice(newOrderForm.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="border-t pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setAddDrawerOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddOrder}
              className="flex-1"
            >
              Create Order
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  )
}

export default withProtectedRoute(AdminOrdersPage, {
  requiredRoles: ["admin"],
  fallbackTo: "/login",
  showLoader: true,
})
