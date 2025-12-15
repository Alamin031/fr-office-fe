'use client'

import { useState, useEffect } from "react"
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
import { ordersService } from "../../lib/api/services"
import type { Order as ApiOrder } from "../../lib/api/types"

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
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusUpdateData, setStatusUpdateData] = useState({
    orderId: "",
    newStatus: "",
  })
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

  const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"]

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await ordersService.getAll(1, 100)
        let fetchedOrders: ApiOrder[] = []

        if (Array.isArray(res)) {
          fetchedOrders = res
        } else if (res && res.data && Array.isArray(res.data)) {
          fetchedOrders = res.data
        }

        const mappedOrders = fetchedOrders.map((order: ApiOrder) => ({
          id: order.id,
          customer: order.shippingAddress?.fullName || order.shippingAddress?.name || "Unknown",
          email: order.shippingAddress?.email || "",
          items: (order.orderItems || []).length,
          total: order.total,
          status: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Pending",
          payment: order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : "Pending",
          date: new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
          address: order.shippingAddress?.address || "",
          phone: order.shippingAddress?.phone || "",
          orderItems: (order.orderItems || []).map((item: any, idx: number) => ({
            id: String(idx),
            name: item.productName || item.name || "Product",
            quantity: item.quantity,
            price: item.price,
          })),
        }))

        setOrders(mappedOrders)
      } catch (err) {
        setError("Failed to load orders. Please try again.")
        console.error("Error fetching orders:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

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

  const handleStatusUpdate = async () => {
    if (!statusUpdateData.newStatus) {
      setFormErrors({ status: "Please select a status" })
      return
    }

    setStatusUpdating(true)
    try {
      const statusLowerCase = statusUpdateData.newStatus.toLowerCase()
      await ordersService.updateStatus(statusUpdateData.orderId, {
        status: statusLowerCase as any,
      })

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === statusUpdateData.orderId
            ? {
                ...order,
                status: statusUpdateData.newStatus,
              }
            : order
        )
      )

      setStatusUpdateOpen(false)
      setStatusUpdateData({ orderId: "", newStatus: "" })
      setFormErrors({})
    } catch (err) {
      setFormErrors({ status: "Failed to update status. Please try again." })
      console.error("Error updating status:", err)
    } finally {
      setStatusUpdating(false)
    }
  }

  const openStatusUpdateDialog = (order: Order) => {
    setStatusUpdateData({
      orderId: order.id,
      newStatus: order.status,
    })
    setStatusUpdateOpen(true)
    setFormErrors({})
  }

  const handleAddOrder = async () => {
    if (!validateForm()) {
      return
    }

    const validItems = newOrderForm.items.filter(item => item.name.trim() !== "")
    const totalAmount = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    try {
      const orderData = {
        fullName: newOrderForm.customer,
        email: newOrderForm.email,
        phone: newOrderForm.phone,
        address: newOrderForm.address,
        orderItems: validItems.map((item) => ({
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: totalAmount,
      }

      await ordersService.create(orderData as any)

      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
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
    } catch (err) {
      setFormErrors({ submit: "Failed to create order. Please try again." })
      console.error("Error creating order:", err)
    }
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-red-500">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="all">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <TabsList>
                  <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({orders.filter((o) => o.status === "Pending").length})
                  </TabsTrigger>
                  <TabsTrigger value="processing">
                    Processing ({orders.filter((o) => o.status === "Processing").length})
                  </TabsTrigger>
                  <TabsTrigger value="shipped">
                    Shipped ({orders.filter((o) => o.status === "Shipped").length})
                  </TabsTrigger>
                  <TabsTrigger value="delivered">
                    Delivered ({orders.filter((o) => o.status === "Delivered").length})
                  </TabsTrigger>
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
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                ) : (
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
                                  <DropdownMenuItem onClick={() => openStatusUpdateDialog(order)}>
                                    <span className="mr-2">📊</span>
                                    Update Status
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
                )}
              </TabsContent>

              <TabsContent value="pending">
                {orders.filter((o) => o.status === "Pending").length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">No pending orders</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left text-sm text-muted-foreground">
                          <th className="pb-3 pr-4"><Checkbox /></th>
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
                        {orders
                          .filter((o) => o.status === "Pending")
                          .map((order) => (
                            <tr key={order.id} className="border-b border-border">
                              <td className="py-4 pr-4"><Checkbox /></td>
                              <td className="py-4 pr-4"><Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">{order.id}</Link></td>
                              <td className="py-4 pr-4"><div><p className="font-medium">{order.customer}</p><p className="text-sm text-muted-foreground">{order.email}</p></div></td>
                              <td className="py-4 pr-4">{order.items}</td>
                              <td className="py-4 pr-4 font-medium">{formatPrice(order.total)}</td>
                              <td className="py-4 pr-4"><Badge variant="secondary" className={getStatusColor(order.status)}>{order.status}</Badge></td>
                              <td className="py-4 pr-4"><Badge variant="secondary" className={getPaymentColor(order.payment)}>{order.payment}</Badge></td>
                              <td className="py-4 pr-4 text-sm text-muted-foreground">{order.date}</td>
                              <td className="py-4"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleViewClick(order)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem><DropdownMenuItem onClick={() => openStatusUpdateDialog(order)}><span className="mr-2">📊</span>Update Status</DropdownMenuItem><DropdownMenuItem onClick={() => handlePrintInvoice(order)}><Printer className="mr-2 h-4 w-4" />Print Invoice</DropdownMenuItem><DropdownMenuItem onClick={() => handleSendInvoiceEmail(order)}><Mail className="mr-2 h-4 w-4" />Send Invoice</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="processing">
                {orders.filter((o) => o.status === "Processing").length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">No processing orders</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left text-sm text-muted-foreground">
                          <th className="pb-3 pr-4"><Checkbox /></th>
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
                        {orders
                          .filter((o) => o.status === "Processing")
                          .map((order) => (
                            <tr key={order.id} className="border-b border-border">
                              <td className="py-4 pr-4"><Checkbox /></td>
                              <td className="py-4 pr-4"><Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">{order.id}</Link></td>
                              <td className="py-4 pr-4"><div><p className="font-medium">{order.customer}</p><p className="text-sm text-muted-foreground">{order.email}</p></div></td>
                              <td className="py-4 pr-4">{order.items}</td>
                              <td className="py-4 pr-4 font-medium">{formatPrice(order.total)}</td>
                              <td className="py-4 pr-4"><Badge variant="secondary" className={getStatusColor(order.status)}>{order.status}</Badge></td>
                              <td className="py-4 pr-4"><Badge variant="secondary" className={getPaymentColor(order.payment)}>{order.payment}</Badge></td>
                              <td className="py-4 pr-4 text-sm text-muted-foreground">{order.date}</td>
                              <td className="py-4"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleViewClick(order)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem><DropdownMenuItem onClick={() => openStatusUpdateDialog(order)}><span className="mr-2">📊</span>Update Status</DropdownMenuItem><DropdownMenuItem onClick={() => handlePrintInvoice(order)}><Printer className="mr-2 h-4 w-4" />Print Invoice</DropdownMenuItem><DropdownMenuItem onClick={() => handleSendInvoiceEmail(order)}><Mail className="mr-2 h-4 w-4" />Send Invoice</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="shipped">
                {orders.filter((o) => o.status === "Shipped").length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">No shipped orders</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left text-sm text-muted-foreground">
                          <th className="pb-3 pr-4"><Checkbox /></th>
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
                        {orders
                          .filter((o) => o.status === "Shipped")
                          .map((order) => (
                            <tr key={order.id} className="border-b border-border">
                              <td className="py-4 pr-4"><Checkbox /></td>
                              <td className="py-4 pr-4"><Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">{order.id}</Link></td>
                              <td className="py-4 pr-4"><div><p className="font-medium">{order.customer}</p><p className="text-sm text-muted-foreground">{order.email}</p></div></td>
                              <td className="py-4 pr-4">{order.items}</td>
                              <td className="py-4 pr-4 font-medium">{formatPrice(order.total)}</td>
                              <td className="py-4 pr-4"><Badge variant="secondary" className={getStatusColor(order.status)}>{order.status}</Badge></td>
                              <td className="py-4 pr-4"><Badge variant="secondary" className={getPaymentColor(order.payment)}>{order.payment}</Badge></td>
                              <td className="py-4 pr-4 text-sm text-muted-foreground">{order.date}</td>
                              <td className="py-4"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleViewClick(order)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem><DropdownMenuItem onClick={() => openStatusUpdateDialog(order)}><span className="mr-2">📊</span>Update Status</DropdownMenuItem><DropdownMenuItem onClick={() => handlePrintInvoice(order)}><Printer className="mr-2 h-4 w-4" />Print Invoice</DropdownMenuItem><DropdownMenuItem onClick={() => handleSendInvoiceEmail(order)}><Mail className="mr-2 h-4 w-4" />Send Invoice</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="delivered">
                {orders.filter((o) => o.status === "Delivered").length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">No delivered orders</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left text-sm text-muted-foreground">
                          <th className="pb-3 pr-4"><Checkbox /></th>
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
                        {orders
                          .filter((o) => o.status === "Delivered")
                          .map((order) => (
                            <tr key={order.id} className="border-b border-border">
                              <td className="py-4 pr-4"><Checkbox /></td>
                              <td className="py-4 pr-4"><Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">{order.id}</Link></td>
                              <td className="py-4 pr-4"><div><p className="font-medium">{order.customer}</p><p className="text-sm text-muted-foreground">{order.email}</p></div></td>
                              <td className="py-4 pr-4">{order.items}</td>
                              <td className="py-4 pr-4 font-medium">{formatPrice(order.total)}</td>
                              <td className="py-4 pr-4"><Badge variant="secondary" className={getStatusColor(order.status)}>{order.status}</Badge></td>
                              <td className="py-4 pr-4"><Badge variant="secondary" className={getPaymentColor(order.payment)}>{order.payment}</Badge></td>
                              <td className="py-4 pr-4 text-sm text-muted-foreground">{order.date}</td>
                              <td className="py-4"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleViewClick(order)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem><DropdownMenuItem onClick={() => openStatusUpdateDialog(order)}><span className="mr-2">📊</span>Update Status</DropdownMenuItem><DropdownMenuItem onClick={() => handlePrintInvoice(order)}><Printer className="mr-2 h-4 w-4" />Print Invoice</DropdownMenuItem><DropdownMenuItem onClick={() => handleSendInvoiceEmail(order)}><Mail className="mr-2 h-4 w-4" />Send Invoice</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {!loading && !error && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Showing {orders.length} of {orders.length} orders</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
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
            {formErrors.submit && (
              <p className="text-sm text-red-500 w-full text-center py-2">{formErrors.submit}</p>
            )}
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

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order {statusUpdateData.orderId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formErrors.status && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600">{formErrors.status}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status-select" className="text-sm font-medium">
                New Status
              </Label>
              <Select
                value={statusUpdateData.newStatus}
                onValueChange={(value) => {
                  setStatusUpdateData({ ...statusUpdateData, newStatus: value })
                  if (formErrors.status) {
                    setFormErrors({ ...formErrors, status: "" })
                  }
                }}
              >
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusUpdateOpen(false)}
              disabled={statusUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={statusUpdating}
            >
              {statusUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default withProtectedRoute(AdminOrdersPage, {
  requiredRoles: ["admin"],
  fallbackTo: "/login",
  showLoader: true,
})
