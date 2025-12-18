/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Package, ChevronRight, Search, Filter, Map } from "lucide-react"
import { Card, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { formatPrice } from "../../../lib/utils/format"
// import { useOrderTrackingStore } from "../../../store/order-tracking-store"
import { ordersService } from "../../../lib/api/services"
import type { Order } from "../../../lib/api/types"
import { OrderTrackingModal } from "../../../components/order/order-tracking-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { withProtectedRoute } from "../../../lib/auth/protected-route"



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
  id: string;
  orderNumber?: string;
  date: string;
  status: string;
  total: number;
  items: Array<{
    productId?: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    slug?: string;
  }>;
}

function OrderCard({ order }: { order: OrderWithStatus }) {
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleTrackOrder = () => {
    // Build tracking data from the order object we already have
    const trackingData = {
      orderId: order.id,
      currentStatus: order.status.toLowerCase(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      trackingNumber: order.orderNumber || order.id,
      carrier: "Standard Delivery",
      statusHistory: [
        {
          status: order.status.toLowerCase(),
          timestamp: order.date,
          message: `Order is currently ${order.status.toLowerCase()}`,
          location: "",
        },
      ],
    };
    setTrackingData(trackingData);
    setTrackingModalOpen(true);
  };

  // Show first product's name and image at the top
  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
  return (
    <>
      <Card key={order.id}>
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                {firstItem && (
                  <Image
                    src={firstItem.image || "/placeholder.svg"}
                    alt={firstItem.name}
                    width={40}
                    height={40}
                    className="rounded border object-cover"
                  />
                )}
                <p className="font-semibold">
                  {firstItem ? firstItem.name : order.id}
                </p>
                <Badge className={getStatusColor(order.status)} variant="outline">
                  {order.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Ordered on {order.date}
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

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <Link href={`/account/orders/${order.id}`}>
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                View Details
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 bg-transparent"
              onClick={handleTrackOrder}
              disabled={trackingLoading}
            >
              <Map className="h-4 w-4" />
              {trackingLoading ? "Loading..." : "Track Order"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Modal */}
      <Dialog open={trackingModalOpen} onOpenChange={setTrackingModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Tracking</DialogTitle>
          </DialogHeader>
          {trackingLoading && <div className="py-8 text-center text-muted-foreground">Loading tracking info...</div>}
          {!trackingLoading && trackingData && (
            <OrderTrackingModal
              tracking={trackingData}
              productName={firstItem?.name}
              productImage={firstItem?.image}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await ordersService.getAll();
        if (Array.isArray(res)) {
          setOrders(res);
        } else if (res && Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setOrders([]);
        }
        setError(null);
      } catch {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) =>
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Map API orderItems to items for UI
  const mapOrder = (order: any) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "",
    status: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "",
    total: order.total,
    items: (order.orderItems || []).map((item: any) => ({
      productId: item.productId,
      name: item.productName || item.name || "",
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      slug: item.slug || "",
    })),
  });

  const groupedOrders = {
    all: filteredOrders.map(mapOrder),
    processing: filteredOrders.filter((o) => o.status === "processing").map(mapOrder),
    shipped: filteredOrders.filter((o) => o.status === "shipped").map(mapOrder),
    delivered: filteredOrders.filter((o) => o.status === "delivered").map(mapOrder),
  };

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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="mb-4 h-12 w-12 text-red-400" />
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
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
              groupedOrders.all.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
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
      )}
    </div>
  );
}

export default withProtectedRoute(OrdersPage, {
  requiredRoles: ["user"],
})
