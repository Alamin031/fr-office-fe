"use client"

import { useState, useEffect } from "react"
import { ProductGallery } from "./product-gallery"
import { ProductInfoRegion } from "./product-info-region"
import type { Product } from "@/app/types"

interface ProductDetailClientProps {
  product: Product & {
    rawProduct?: {
      regions?: any[]
      networks?: any[]
      [key: string]: any
    }
    productType?: string
  }
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedColorImage, setSelectedColorImage] = useState<string | null>(null)
  const rawProduct = product.rawProduct

  // Determine if this is a network product
  const isNetworkProduct = rawProduct?.productType === "network"
  const networks = isNetworkProduct ? (rawProduct?.networks || []) : []
  const regions = isNetworkProduct
    ? networks.map((n: any) => ({
        id: n.id,
        name: n.networkType,
        colors: n.colors || [],
        defaultStorages: n.defaultStorages || [],
      }))
    : (rawProduct?.regions || [])

  // Get first region and first color image
  useEffect(() => {
    if (regions && regions.length > 0) {
      const firstRegion = regions[0]
      if (firstRegion.colors && firstRegion.colors.length > 0) {
        const firstColor = firstRegion.colors[0]
        const colorImage = firstColor?.colorImage || firstColor?.image
        if (colorImage) {
          setSelectedColorImage(colorImage)
        }
      }
    }
  }, [regions])

  return (
    <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 mb-12">
      <div className="flex justify-center">
        <ProductGallery
          images={product.images ?? []}
          name={product.name ?? ""}
          isEmi={!!rawProduct?.isEmi}
          isCare={!!rawProduct?.isCare}
          selectedColorImage={selectedColorImage}
        />
      </div>
      <div className="flex items-start">
        <ProductInfoRegion product={product} onColorChange={setSelectedColorImage} />
      </div>
    </div>
  )
}
