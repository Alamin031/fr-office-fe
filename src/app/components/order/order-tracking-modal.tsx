/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client"

import { OrderTracking } from "../../store/order-tracking-store"
import { CheckCircle2, MapPin, Clock } from "lucide-react"
import { formatDate } from "../../lib/utils/format"
import { cn } from "../../lib/utils"

interface OrderTrackingModalProps {
  tracking: OrderTracking
  productName?: string
  productImage?: string
}


// Fixed status steps for progress bar
const STATUS_STEPS = [
  { key: 'order placed', label: 'Order Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'preparing to ship', label: 'Preparing to Ship' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

// Map timeline/statusHistory to a lookup for completion and date
function getStepCompletion(tracking: any) {
  let timeline = [];
  if (Array.isArray(tracking.timeline) && tracking.timeline.length > 0) {
    timeline = tracking.timeline;
  } else if (Array.isArray(tracking.statusHistory) && tracking.statusHistory.length > 0) {
    timeline = tracking.statusHistory.map((s: any) => ({
      label: s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : "",
      date: s.timestamp,
      completed: true,
    }));
  }
  // Build a lookup: statusKey -> {completed, date}
  const lookup: Record<string, {completed: boolean, date?: string}> = {};
  for (const step of timeline) {
    const key = (step.label || '').toLowerCase();
    if (key) {
      lookup[key] = { completed: !!step.completed, date: step.date };
    }
  }
  return lookup;
}


// Color for each status step
function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'order placed':
      return 'bg-orange-500/10 text-orange-600 border-orange-200';
    case 'processing':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
    case 'preparing to ship':
      return 'bg-purple-500/10 text-purple-600 border-purple-200';
    case 'shipped':
      return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'delivered':
      return 'bg-green-500/10 text-green-600 border-green-200';
    case 'cancelled':
      return 'bg-red-500/10 text-red-600 border-red-200';
    case 'returned':
      return 'bg-gray-500/10 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-200 text-gray-600 border-gray-200';
  }
}


export function OrderTrackingModal({ tracking, productName, productImage }: OrderTrackingModalProps) {
  const stepCompletion = getStepCompletion(tracking);
  // Find the last completed index for progress bar
  const lastCompletedIndex = STATUS_STEPS.map(s => stepCompletion[s.key]?.completed).lastIndexOf(true);

  // For status message, get the last completed step info
  const lastStep = lastCompletedIndex >= 0 ? STATUS_STEPS[lastCompletedIndex] : null;
  const lastStepDate = lastStep ? stepCompletion[lastStep.key]?.date : null;

  return (
    <div className="w-full space-y-5">
      {/* Product Header */}
      <div className="flex gap-3 sm:gap-4 pb-4 border-b">
        {productImage && (
          <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-md bg-gray-100 border border-gray-200">
            <img
              src={productImage}
              alt={productName || "Product"}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col justify-between py-0.5">
          <div>
            <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1">{productName || "Order Details"}</p>
            <p className="text-xs sm:text-sm text-gray-500">
              Order #{tracking.trackingNumber}
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <span className="text-xs sm:text-sm text-gray-600 font-medium">
              Arrives {formatDate(tracking.estimatedDelivery)}
            </span>
          </div>
        </div>
      </div>

      {/* Track Shipment Link */}
      <div className="-mt-1">
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 hover:underline transition-colors">
          Track shipment
          <span className="text-lg">›</span>
        </button>
      </div>

      {/* Custom Progress Bar with Steps */}
      <div className="mt-5 sm:mt-6 mb-6 sm:mb-8 py-2">
        <div className="relative px-1">
          {/* Progress line background */}
          <div className="absolute left-[12%] right-[12%] sm:left-[10%] sm:right-[10%] top-4 sm:top-5 h-[2px] bg-gray-200 z-0" />
          {/* Progress line filled */}
          <div 
            className="absolute left-[12%] sm:left-[10%] top-4 sm:top-5 h-[2px] bg-green-500 z-10 transition-all duration-500" 
            style={{
              width: STATUS_STEPS.length > 1 
                ? `${((lastCompletedIndex / (STATUS_STEPS.length - 1)) * 76)}%` 
                : '0%'
            }}
          />
          
          {/* Steps */}
          <div className="relative flex items-start justify-between">
            {STATUS_STEPS.map((step, index) => {
              const completed = !!stepCompletion[step.key]?.completed;
              const isCurrent = index === lastCompletedIndex && completed;
              const date = stepCompletion[step.key]?.date;
              
              return (
                <div key={step.key} className="flex flex-col items-center z-20 flex-1">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-[3px] mb-1.5 sm:mb-2.5 font-semibold transition-all shadow-sm",
                    completed 
                      ? "border-green-500 bg-green-500 text-white shadow-green-200" 
                      : "border-gray-300 bg-white text-gray-400"
                  )}>
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 fill-current" strokeWidth={0} />
                    ) : (
                      <span className="text-xs sm:text-sm">{index + 1}</span>
                    )}
                  </div>
                  
                  <span className={cn(
                    "text-[9px] sm:text-xs text-center leading-tight px-0.5 max-w-[55px] sm:max-w-[80px]", 
                    completed ? "text-gray-900 font-medium" : "text-gray-500"
                  )}>
                    {step.label}
                  </span>
                  
                  {isCurrent && date && (
                    <span className="text-[9px] sm:text-xs text-green-600 font-semibold mt-0.5 sm:mt-1.5">
                      {formatDate(date)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Message (current step) */}
      {lastStep && (
        <div className="pt-5 sm:pt-6 border-t">
          <p className="font-bold text-lg sm:text-xl text-gray-900 mb-1.5">{lastStep.label}</p>
          {lastStepDate && (
            <p className="text-xs sm:text-sm text-gray-500">{formatDate(lastStepDate)}</p>
          )}
        </div>
      )}

      {/* Carrier Information */}
      <div className="rounded-lg bg-gray-50/80 border border-gray-200 p-3.5 sm:p-4 mt-5">
        <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Carrier: {tracking.carrier}</p>
        <p className="text-xs sm:text-sm text-gray-600 break-all font-mono">
          Tracking #: {tracking.trackingNumber}
        </p>
      </div>
    </div>
  );
}
