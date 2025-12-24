/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { formatPrice } from "@/app/lib/utils/format"
import { useCartStore } from "@/app/store/cart-store"
import { useAuthStore } from "@/app/store/auth-store"

export function CartContent() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Defer state update to avoid synchronous setState in effect
    const id = setTimeout(() => setIsHydrated(true), 0)
    return () => clearTimeout(id)
  }, [])

  if (!isHydrated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link href="/">
          <Button className="mt-6 gap-2">
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  const subtotal = getTotal()
  const shipping = subtotal > 5000 ? 0 : 120
  const total = subtotal + shipping

  const handleProceedToCheckout = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login with cart as the return URL
      router.push('/login?from=/cart')
      return
    }

    // If authenticated, redirect to checkout
    router.push('/checkout')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
              {/* Image */}
              <Link
                href={`/product/${item.product.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
              >
                {(() => {
                  let imgSrc = null;
                  const rawProduct = (item.product as any).rawProduct;

                  // Try to get image from product.images array first
                  if (Array.isArray(item.product.images) && item.product.images.length > 0) {
                    const firstImg = item.product.images[0];
                    if (typeof firstImg === 'string') {
                      imgSrc = firstImg;
                    } else if (firstImg && typeof firstImg === 'object') {
                      imgSrc = firstImg.imageUrl || (firstImg as any).url;
                    }
                  }

                  // Fallback: try to get from rawProduct.directColors for basic products
                  if (!imgSrc && rawProduct?.directColors && Array.isArray(rawProduct.directColors)) {
                    const firstColor = rawProduct.directColors[0];
                    if (firstColor?.colorImage) {
                      imgSrc = firstColor.colorImage;
                    }
                  }

                  // Fallback: try to get from rawProduct.networks for network products
                  if (!imgSrc && rawProduct?.networks && Array.isArray(rawProduct.networks)) {
                    const firstNetwork = rawProduct.networks[0];
                    if (firstNetwork?.colors && Array.isArray(firstNetwork.colors)) {
                      const firstColor = firstNetwork.colors[0];
                      if (firstColor?.colorImage) {
                        imgSrc = firstColor.colorImage;
                      }
                    }
                  }

                  if (!imgSrc) {
                    return (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-xs text-gray-400">No Image</span>
                      </div>
                    );
                  }
                  return (
                    <Image
                      src={imgSrc}
                      alt={item.product.name || 'Product Image'}
                      fill
                      className="object-cover"
                    />
                  );
                })()}
              </Link>

              {/* Details */}
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/product/${item.product.slug}`} className="font-medium hover:underline">
                      {item.product.name || 'Unnamed Product'}
                    </Link>
                    {item.product.brand && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.product.brand.name}</p>
                    )}
                    {/* Fallback for brand array or brands property */}
                    {!item.product.brand && Array.isArray(item.product.brands) && item.product.brands.length > 0 && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.product.brands[0].name}</p>
                    )}
                    {Object.entries(item.selectedVariants).length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {Object.entries(item.selectedVariants)
                          .filter(([key]) => key.endsWith('Name') || key === 'priceType')
                          .map(([key, value]) => (
                            <span key={key} className="capitalize">
                              {key === 'regionName' ? 'Region' : key === 'colorName' ? 'Color' : key === 'storageName' ? 'Storage' : key}: {value}{" "}
                            </span>
                          ))}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      className="p-2 hover:bg-muted disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2.5rem] text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="font-semibold">{formatPrice((item.price || 0) * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div>
        <div className="sticky top-24 rounded-2xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-6 shadow-lg dark:border-border">
          <h2 className="text-xl font-bold">Order Summary</h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Subtotal</span>
              <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Shipping</span>
              <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-foreground'}`}>
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg px-3 py-2">
                ✓ Free shipping on orders over {formatPrice(5000)}
              </p>
            )}
          </div>

          <div className="my-5 h-px bg-gradient-to-r from-border via-border to-transparent" />

          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-muted-foreground">Total</span>
            <span className="text-3xl font-black text-foreground">{formatPrice(total)}</span>
          </div>

          <Button 
            className="mt-6 w-full h-12 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200" 
            size="lg" 
            onClick={handleProceedToCheckout}
          >
            Proceed to Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              ← Continue Shopping
            </Link>
          </div>

          {/* Payment Methods */}
          <div className="mt-6 border-t border-border/50 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">We Accept</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-xs font-semibold text-center hover:bg-muted/60 transition-colors cursor-default">
                Bkash
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-xs font-semibold text-center hover:bg-muted/60 transition-colors cursor-default">
                Nagad
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-xs font-semibold text-center hover:bg-muted/60 transition-colors cursor-default">
                VISA Card
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-xs font-semibold text-center hover:bg-muted/60 transition-colors cursor-default">
                Master Card
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
