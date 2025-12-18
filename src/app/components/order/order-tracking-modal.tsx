"use client"

import { OrderTracking } from "../../store/order-tracking-store"
import { Badge } from "../ui/badge"
import { CheckCircle2, MapPin, Clock, Package } from "lucide-react"
import { formatDate } from "../../lib/utils/format"
import { cn } from "../../lib/utils"

interface OrderTrackingModalProps {
  tracking: OrderTracking
  productName?: string
  productImage?: string
}

const statusLabels: Record<string, string> = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Preparing to Ship",
  out_for_delivery: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
}

const statusOrder = ["pending", "processing", "shipped", "out_for_delivery", "delivered"]

export function OrderTrackingModal({ tracking, productName, productImage }: OrderTrackingModalProps) {
  const currentStatusIndex = statusOrder.indexOf(tracking.currentStatus)

  return (
    <div className="w-full space-y-6">
      {/* Product Header */}
      <div className="flex gap-4">
        {productImage && (
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            <img
              src={productImage}
              alt={productName || "Product"}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="font-semibold text-lg">{productName || "Order Details"}</p>
            <p className="text-sm text-muted-foreground">
              Order #{tracking.trackingNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Arrives {formatDate(tracking.estimatedDelivery)}
            </span>
          </div>
        </div>
      </div>

      {/* Track Shipment Link */}
      <div>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
          Track shipment
          <span>›</span>
        </button>
      </div>

      {/* Horizontal Progress Indicator */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {statusOrder.map((status, index) => (
            <div key={status} className="flex flex-1 items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  index <= currentStatusIndex
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {index <= currentStatusIndex ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < statusOrder.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    index < currentStatusIndex ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Status Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          {statusOrder.map((status) => (
            <span key={status} className="text-center flex-1 px-1">
              {statusLabels[status]}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline Details */}
      <div className="space-y-4 border-t border-border pt-6">
        {tracking.statusHistory.map((status, index) => {
          const isCompleted =
            tracking.statusHistory.findIndex((s) => s.status === tracking.currentStatus) >= index

          return (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center pt-1">
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                    isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                  )}
                </div>
                {index < tracking.statusHistory.length - 1 && (
                  <div
                    className={cn(
                      "my-1 h-8 w-0.5",
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                )}
              </div>

              <div className="flex-1 pb-2">
                <p className="font-medium text-sm">
                  {statusLabels[status.status] || status.status}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {status.message}
                </p>
                {status.location && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {status.location}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(status.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Status Message */}
      {tracking.currentStatus === "out_for_delivery" && (
        <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
          <p className="font-medium text-sm text-orange-900">Delivery Attempted</p>
          <p className="text-xs text-orange-800 mt-1">
            The carrier was not able to complete your delivery and will make another attempt. Please use the "Track shipment" link for more information.
          </p>
        </div>
      )}

      {/* Carrier Information */}
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm font-medium">Carrier: {tracking.carrier}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Tracking #: {tracking.trackingNumber}
        </p>
      </div>
    </div>
  )
}
