"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "@/app/lib/utils"

interface ProductGalleryProps {
  images: string[]
  name: string
  isEmi?: boolean
  isCare?: boolean
}

export function ProductGallery({ images, name, isEmi, isCare }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })

  const displayImages = images.length > 0 ? images : ["/placeholder.svg?height=600&width=600"]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % displayImages.length)
  }

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-muted"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={displayImages[selectedIndex] || "/placeholder.svg"}
          alt={`${name} - Image ${selectedIndex + 1}`}
          fill
          priority
          className={cn("object-cover transition-transform duration-200", isZoomed && "scale-150")}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
              : undefined
          }
        />

        {/* EMI/CARE BADGES */}
        {(isEmi || isCare) && (
          <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
            {isEmi && (
              <span className="inline-flex items-center gap-1 rounded bg-blue-600/90 px-2 py-1 text-xs font-semibold text-white shadow">
                EMI
              </span>
            )}
            {isCare && (
              <span className="inline-flex items-center gap-1 rounded bg-green-600/90 px-2 py-1 text-xs font-semibold text-white shadow">
                Care
              </span>
            )}
          </div>
        )}

        {/* Zoom indicator */}
        <div
          className={cn(
            "absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-opacity",
            isZoomed ? "opacity-0" : "opacity-100",
          )}
        >
          <ZoomIn className="h-3.5 w-3.5" />
          Hover to zoom
        </div>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full shadow-md"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full shadow-md"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                selectedIndex === index ? "border-foreground" : "border-transparent hover:border-muted-foreground/30",
              )}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${name} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
