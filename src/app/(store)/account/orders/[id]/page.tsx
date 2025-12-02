"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle2, MapPin, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Separator } from "../../../../components/ui/separator"
import { formatPrice } from "../../../../lib/utils/format"
import { withProtectedRoute } from "../../../../lib/auth/protected-route"

const orderDetails = {
  id: "ORD-2024-001",
  date: "Nov 20, 2024",
  status: "Delivered",
  deliveredDate: "Nov 23, 2024",
  paymentMethod: "Credit Card ending in 4242",
  items: [
    {
      name: "iPhone 15 Pro Max",
      image: "/iphone-15-pro-max-display.png",
      price: 129999,
      quantity: 1,
      variant: "256GB - Natural Titanium",
    },
  ],
  subtotal: 129999,
  shipping: 0,
  tax: 23400,
  discount: 5000,
  total: 148399,
  shippingAddress: {
    name: "John Doe",
    phone: "+91 98765 43210",
    address: "123 Main Street, Apartment 4B",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  },
  timeline: [
    { status: "Order Placed", date: "Nov 20, 2024 10:30 AM", completed: true },
    { status: "Order Confirmed", date: "Nov 20, 2024 10:35 AM", completed: true },
    { status: "Shipped", date: "Nov 21, 2024 02:15 PM", completed: true },
    { status: "Out for Delivery", date: "Nov 23, 2024 09:00 AM", completed: true },
    { status: "Delivered", date: "Nov 23, 2024 11:45 AM", completed: true },
  ],
}

function OrderDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/account/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{orderDetails.id}</h1>
          <p className="text-muted-foreground">Placed on {orderDetails.date}</p>
        </div>
        <Badge className="ml-auto bg-green-500/10 text-green-600 border-green-200" variant="outline">
          {orderDetails.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6">
                {orderDetails.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          event.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {event.completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-current" />
                        )}
                      </div>
                      {index < orderDetails.timeline.length - 1 && (
                        <div className={`absolute top-8 h-full w-0.5 ${event.completed ? "bg-primary" : "bg-muted"}`} />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex gap-4 rounded-lg border border-border p-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.variant}</p>
                    <p className="mt-2 text-sm">Qty: {item.quantity}</p>
                    <p className="mt-1 font-semibold">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      Write Review
                    </Button>
                    <Button variant="outline" size="sm">
                      Buy Again
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{orderDetails.shippingAddress.name}</p>
                <p className="text-muted-foreground">{orderDetails.shippingAddress.address}</p>
                <p className="text-muted-foreground">
                  {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} -{" "}
                  {orderDetails.shippingAddress.pincode}
                </p>
                <p className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {orderDetails.shippingAddress.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(orderDetails.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (GST)</span>
                <span>{formatPrice(orderDetails.tax)}</span>
              </div>
              {orderDetails.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-{formatPrice(orderDetails.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(orderDetails.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Paid via {orderDetails.paymentMethod}</p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button variant="outline" className="w-full bg-transparent">
              Download Invoice
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Need Help?
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withProtectedRoute(OrderDetailPage, {
  requiredRoles: ["user"],
})
