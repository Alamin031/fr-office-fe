/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useMemo } from "react"
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
  const rawProduct = product.rawProduct

  // Determine if this is a network product
  const isNetworkProduct = rawProduct?.productType === "network"
  const isBasicProduct = rawProduct?.productType === "basic"

  const regions = useMemo(() => {
    const networks = isNetworkProduct ? (rawProduct?.networks || []) : []
    let computedRegions = isNetworkProduct
      ? networks.map((n: any) => ({
          id: n.id,
          name: n.networkType,
          colors: n.colors || [],
          defaultStorages: n.defaultStorages || [],
        }))
      : (rawProduct?.regions || [])

    // For basic products, convert directColors to a default region structure
    if (isBasicProduct && (!computedRegions || computedRegions.length === 0) && rawProduct?.directColors) {
      computedRegions = [{
        id: "default",
        name: "Default",
        colors: rawProduct.directColors.map((color: any) => ({
          id: color.id,
          name: color.colorName,
          colorName: color.colorName,
          colorImage: color.colorImage,
          image: color.colorImage,
          regularPrice: color.regularPrice,
          discountPrice: color.discountPrice,
          stockQuantity: color.stockQuantity,
        })),
        defaultStorages: [{
          id: "default-storage",
          size: "Standard",
          storageSize: "Standard",
          price: {
            regularPrice: rawProduct.directColors[0]?.regularPrice || 0,
            discountPrice: rawProduct.directColors[0]?.discountPrice || 0,
            stockQuantity: rawProduct.directColors[0]?.stockQuantity || 0,
          }
        }]
      }]
    }
    return computedRegions
  }, [isNetworkProduct, isBasicProduct, rawProduct])

  // Get first region and first color image for initial state
  const initialColorImage = useMemo(() => {
    if (regions && regions.length > 0) {
      const firstRegion = regions[0]
      if (firstRegion.colors && firstRegion.colors.length > 0) {
        const firstColor = firstRegion.colors[0]
        return firstColor?.colorImage || firstColor?.image || null
      }
    }
    return null
  }, [regions])

  const [selectedColorImage, setSelectedColorImage] = useState<string | null>(initialColorImage)

  return (
    <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 mb-12">
      <div className="flex justify-center">
        <ProductGallery
          images={Array.isArray(product.images)
            ? (typeof product.images[0] === "string"
                ? product.images as string[]
                : (product.images as any[]).map(img => img.imageUrl))
            : []}
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
