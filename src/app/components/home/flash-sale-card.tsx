"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "../ui/button"
import { Zap } from "lucide-react"
import { Badge } from "../ui/badge"
import type { Flashsell } from "@/app/lib/api/services/flashsell"

interface FlashSaleCardProps {
  flashsale: Flashsell
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isEnded: boolean
  isUpcoming: boolean
}

function useCountdown(startTime: string, endTime: string): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
    isUpcoming: false,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const start = new Date(startTime)
      const end = new Date(endTime)

      if (now < start) {
        const difference = start.getTime() - now.getTime()
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isEnded: false,
          isUpcoming: true,
        })
      } else if (now > end) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true,
          isUpcoming: false,
        })
      } else {
        const difference = end.getTime() - now.getTime()
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isEnded: false,
          isUpcoming: false,
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [startTime, endTime])

  return timeLeft
}

export function FlashSaleCard({ flashsale }: FlashSaleCardProps) {
  const timeLeft = useCountdown(flashsale.startTime, flashsale.endTime)

  const getStatusBadge = () => {
    if (timeLeft.isUpcoming) {
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border-0">
          Upcoming
        </Badge>
      )
    }
    if (timeLeft.isEnded) {
      return (
        <Badge className="bg-gray-500/10 text-gray-600 border-0">
          Ended
        </Badge>
      )
    }
    return (
      <Badge className="bg-green-500/10 text-green-600 border-0">
        Active
      </Badge>
    )
  }

  const getCountdownLabel = () => {
    if (timeLeft.isUpcoming) {
      return "Starts in:"
    }
    if (timeLeft.isEnded) {
      return "Ended"
    }
    return "Ends in:"
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:shadow-lg">
      {/* Banner Image */}
      {flashsale.bannerImg && (
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image
            src={flashsale.bannerImg}
            alt={flashsale.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold line-clamp-2">
              {flashsale.title}
            </h3>
          </div>
          {getStatusBadge()}
        </div>

        {/* Discount */}
        <div className="flex items-center gap-2 bg-blue-500/10 w-fit px-3 py-1.5 rounded-lg">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-600">
            {flashsale.discountpercentage}% OFF
          </span>
        </div>

        {/* Countdown Timer */}
        {!timeLeft.isEnded && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              {getCountdownLabel()}
            </p>
            <div className="flex gap-1.5">
              {[
                { value: timeLeft.days, label: "D" },
                { value: timeLeft.hours, label: "H" },
                { value: timeLeft.minutes, label: "M" },
                { value: timeLeft.seconds, label: "S" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center">
                  <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {String(item.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stock and Products Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
          <span>{flashsale.stock} units</span>
          <span>{flashsale.productIds.length} products</span>
        </div>

        {/* View Product Button */}
        <Link href={`/flashsell?id=${flashsale.id}`} className="block">
          <Button className="w-full" size="sm" disabled={timeLeft.isEnded}>
            View Products
          </Button>
        </Link>
      </div>
    </div>
  )
}
