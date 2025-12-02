"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Package, ChevronRight, Search, Filter, ShoppingCart, Map, MessageSquare } from "lucide-react"
import { Card, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { formatPrice } from "../../../lib/utils/format"
import { useCartStore } from "../../../store/cart-store"
import { useReviewStore } from "../../../store/review-store"
import { useOrderTrackingStore } from "../../../store/order-tracking-store"
import { WriteReviewModal } from "../../../components/order/write-review-modal"
import { OrderTrackingTimeline } from "../../../components/order/order-tracking-timeline"
import { ReviewCard } from "../../../components/order/review-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { withProtectedRoute } from "../../../lib/auth/protected-route"

const ordersData = [
  {
    id: "ORD-2024-001",
    date: "Nov 20, 2024",
    status: "Delivered",
    deliveredDate: "Nov 23, 2024",
    total: 129999,
    items: [
      {
        productId: "1",
        name: "iPhone 15 Pro Max",
        image: "/iphone-15-pro-max-display.png",
        price: 129999,
        quantity: 1,
        slug: "iphone-15-pro-max-256gb-natural-titanium",
      },
    ],
  },
  {
    id: "ORD-2024-002",
    date: "Nov 15, 2024",
    status: "Shipped",
    expectedDate: "Nov 26, 2024",
    total: 49999,
    items: [
      {
        productId: "9",
        name: "Apple Watch Ultra 2",
        image: "/smartwatch.png",
        price: 29999,
        quantity: 1,
        slug: "apple-watch-ultra-2-49mm-titanium-orange-ocean",
      },
      {
        productId: "4",
        name: "AirPods Pro 2",
        image: "/galaxy-buds.jpg",
        price: 19999,
        quantity: 1,
        slug: "airpods-pro-2nd-gen-usb-c",
      },
    ],
  },
  {
    id: "ORD-2024-003",
    date: "Nov 10, 2024",
    status: "Processing",
    total: 79999,
    items: [
      {
        productId: "3",
        name: "MacBook Pro 14-inch M3",
        image: "/macbook-air-m3.jpg",
        price: 79999,
        quantity: 1,
        slug: "macbook-pro-14-m3-pro-512gb-space-black",
      },
    ],
  },
  {
    id: "ORD-2024-004",
    date: "Oct 28, 2024",
    status: "Cancelled",
    total: 15999,
    items: [
      {
        productId: "4",
        name: "AirPods Pro 2",
        image: "/airpods-pro-lifestyle.png",
        price: 15999,
        quantity: 1,
        slug: "airpods-pro-2nd-gen-usb-c",
      },
    ],
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-green-500/10 text-green-600 border-green-200"
    case "Shipped":
      return "bg-blue-500/10 text-blue-600 border-blue-200"
    case "Processing":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-200"
    case "Cancelled":
      return "bg-red-500/10 text-red-600 border-red-200"
    default:
      return ""
  }
}

interface OrderWithStatus {
  id: string
  date: string
  status: string
  deliveredDate?: string
  expectedDate?: string
  total: number
  items: Array<{
    productId: string
    name: string
    image: string
    price: number
    quantity: number
    slug: string
  }>
}

function OrderCard({ order }: { order: OrderWithStatus }) {
  const addToCart = useCartStore((state) => state.addItem)
  const { getOrderReviews } = useReviewStore()
  const { getOrderTracking } = useOrderTrackingStore()
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<(typeof order.items)[0] | null>(null)
  const [trackingModalOpen, setTrackingModalOpen] = useState(false)
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false)

  const orderReviews = getOrderReviews(order.id)
  const orderTracking = getOrderTracking(order.id)

  const handleBuyAgain = (item: (typeof order.items)[0]) => {
    addToCart(
        {
          id: item.productId,
          name: item.name,
          slug: item.slug,
          description: "",
          price: item.price,
          images: [item.image],
          category: {
            id: "1",
            name: "Electronics",
            slug: "electronics",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          brand: { id: "1", name: "Brand", slug: "brand", logo: "" },
          variants: [],
          highlights: [],
          specifications: {},
          stock: 10,
          sku: "",
          warranty: "",
          rating: 4.5,
          reviewCount: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        item.quantity,
      )
  }

  return (
    <>
      <Card key={order.id}>
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <p className="font-semibold">{order.id}</p>
                <Badge className={getStatusColor(order.status)} variant="outline">
                  {order.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Ordered on {order.date}
                {order.deliveredDate && ` • Delivered on ${order.deliveredDate}`}
                {order.expectedDate && ` • Expected by ${order.expectedDate}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatPrice(order.total)}</p>
              <p className="text-sm text-muted-foreground">
                {order.items.length} {order.items.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-background">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/account/orders/${order.id}`}>
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                View Details
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            {order.status === "Delivered" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-transparent"
                  onClick={() => setReviewsModalOpen(true)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Reviews {orderReviews.length > 0 && `(${orderReviews.length})`}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-transparent"
                  onClick={() => {
                    setSelectedItem(order.items[0])
                    setReviewModalOpen(true)
                  }}
                >
                  Write Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-transparent"
                  onClick={() => handleBuyAgain(order.items[0])}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Buy Again
                </Button>
              </>
            )}
            {(order.status === "Shipped" || order.status === "Processing") && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 bg-transparent"
                onClick={() => setTrackingModalOpen(true)}
              >
                <Map className="h-4 w-4" />
                Track Order
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Write Review Modal */}
      {selectedItem && (
        <WriteReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          productId={selectedItem.productId}
          orderId={order.id}
          productName={selectedItem.name}
          userId="user-1"
          userName="John Doe"
        />
      )}

      {/* Reviews Modal */}
      <Dialog open={reviewsModalOpen} onOpenChange={setReviewsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reviews for {order.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {orderReviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reviews yet for this order</p>
            ) : (
              orderReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  canEdit={review.userId === "user-1"}
                />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tracking Modal */}
      {orderTracking && (
        <Dialog open={trackingModalOpen} onOpenChange={setTrackingModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Tracking</DialogTitle>
            </DialogHeader>
            <OrderTrackingTimeline tracking={orderTracking} />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = ordersData.filter((order) =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const groupedOrders = {
    all: filteredOrders,
    processing: filteredOrders.filter((o) => o.status === "Processing"),
    shipped: filteredOrders.filter((o) => o.status === "Shipped"),
    delivered: filteredOrders.filter((o) => o.status === "Delivered"),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {groupedOrders.all.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            groupedOrders.all.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </TabsContent>

        <TabsContent value="processing" className="mt-6">
          {groupedOrders.processing.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No processing orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedOrders.processing.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shipped" className="mt-6">
          {groupedOrders.shipped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No shipped orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedOrders.shipped.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="delivered" className="mt-6">
          {groupedOrders.delivered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No delivered orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedOrders.delivered.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default withProtectedRoute(OrdersPage, {
  requiredRoles: ["user"],
})
