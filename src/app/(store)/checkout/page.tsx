"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Truck, Shield, Tag, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Separator } from "../../components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { formatPrice } from "../../lib/utils/format"
import { useCartStore } from "../../store/cart-store"
import { useAuthStore } from "../../store/auth-store"
import { toast } from "sonner"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()

  // Form state
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [deliveryMethod, setDeliveryMethod] = useState("standard")
  const [showCoupon, setShowCoupon] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [isLoadingOrder, setIsLoadingOrder] = useState(false)

  // Delivery form state
  const [fullName, setFullName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [division, setDivision] = useState("")
  const [district, setDistrict] = useState("")
  const [upzila, setUpzila] = useState("")
  const [postCode, setPostCode] = useState("")
  const [address, setAddress] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?from=/checkout`)
      return
    }
  }, [isAuthenticated, router])

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && isAuthenticated) {
      router.push("/")
      toast.error("Your cart is empty")
    }
  }, [items.length, isAuthenticated, router])

  const subtotal = getTotal()
  const shipping = subtotal > 5000 ? 0 : 120
  const tax = Math.round(subtotal * 0.05) // 5% tax
  const discount = couponDiscount
  const total = subtotal + shipping + tax - discount

  const handleApplyCoupon = () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code")
      return
    }
    // TODO: Validate coupon with API
    // For now, apply a 5% discount if code is "SAVE5"
    if (couponCode === "SAVE5") {
      const discountAmount = Math.round(subtotal * 0.05)
      setCouponDiscount(discountAmount)
      toast.success(`Coupon applied! You saved ${formatPrice(discountAmount)}`)
    } else {
      toast.error("Invalid coupon code")
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions")
      return
    }

    if (!fullName || !phone || !email || !division || !district || !upzila || !postCode || !address) {
      toast.error("Please fill in all delivery information")
      return
    }

    setIsLoadingOrder(true)

    try {
      // TODO: Send order data to API
      // For now, simulate order creation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("Order placed successfully!")

      // Clear cart
      clearCart()

      // Redirect to order confirmation
      router.push("/account/orders")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order")
    } finally {
      setIsLoadingOrder(false)
    }
  }

  if (items.length === 0) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Link>

      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout & Confirm Order</h1>

      <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="division">Division *</Label>
                  <Select value={division} onValueChange={setDivision}>
                    <SelectTrigger id="division">
                      <SelectValue placeholder="Select your division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dhaka">Dhaka</SelectItem>
                      <SelectItem value="chittagong">Chittagong</SelectItem>
                      <SelectItem value="khulna">Khulna</SelectItem>
                      <SelectItem value="rajshahi">Rajshahi</SelectItem>
                      <SelectItem value="barisal">Barisal</SelectItem>
                      <SelectItem value="sylhet">Sylhet</SelectItem>
                      <SelectItem value="rangpur">Rangpur</SelectItem>
                      <SelectItem value="mymensingh">Mymensingh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="district">District *</Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger id="district">
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dhaka">Dhaka</SelectItem>
                      <SelectItem value="gazipur">Gazipur</SelectItem>
                      <SelectItem value="narayanganj">Narayanganj</SelectItem>
                      <SelectItem value="manikganj">Manikganj</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="upzila">Upzila *</Label>
                  <Select value={upzila} onValueChange={setUpzila}>
                    <SelectTrigger id="upzila">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dhanmondi">Dhanmondi</SelectItem>
                      <SelectItem value="gulshan">Gulshan</SelectItem>
                      <SelectItem value="banani">Banani</SelectItem>
                      <SelectItem value="mirpur">Mirpur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="postCode">Post Code *</Label>
                  <Input
                    id="postCode"
                    placeholder="Enter Post Code"
                    value={postCode}
                    onChange={(e) => setPostCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="For ex. House: 23, Road: 24, Block: B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className={`rounded-lg border p-4 ${paymentMethod === "cod" ? "border-primary" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <span className="font-medium">Cash on Delivery</span>
                      <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                    </Label>
                  </div>
                </div>

                <div className={`rounded-lg border p-4 ${paymentMethod === "online" ? "border-primary" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex-1 cursor-pointer">
                      <span className="font-medium">Online Payment</span>
                      <p className="text-sm text-muted-foreground">Pay securely with your card or mobile wallet</p>
                    </Label>
                  </div>
                </div>

                <div className={`rounded-lg border p-4 ${paymentMethod === "courier" ? "border-primary" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="courier" id="courier" />
                    <Label htmlFor="courier" className="flex-1 cursor-pointer">
                      <span className="font-medium">Courier Service</span>
                      <p className="text-sm text-muted-foreground">Pay via courier payment option</p>
                    </Label>
                  </div>
                </div>

                <div className={`rounded-lg border p-4 ${paymentMethod === "pickup" ? "border-primary" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                      <span className="font-medium">Self Pickup</span>
                      <p className="text-sm text-muted-foreground">Pickup from our store</p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Delivery Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                <div className={`rounded-lg border p-4 ${deliveryMethod === "standard" ? "border-primary" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <span className="font-medium">Standard Delivery</span>
                      <p className="text-sm text-muted-foreground">Delivery in 5-7 business days</p>
                    </Label>
                  </div>
                </div>

                <div className={`rounded-lg border p-4 ${deliveryMethod === "express" ? "border-primary" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1 cursor-pointer">
                      <span className="font-medium">Express Delivery</span>
                      <p className="text-sm text-muted-foreground">Delivery in 2-3 business days (+$50)</p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border"
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I have read & agree to the website{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms and Conditions
                  </Link>
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 pb-4 border-b border-border last:border-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={
                        Array.isArray(item.product.images) &&
                        item.product.images.length > 0 &&
                        item.product.images[0]
                          ? typeof item.product.images[0] === "string"
                            ? item.product.images[0]
                            : item.product.images[0].imageUrl
                          : "/placeholder.svg"
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    <p className="font-semibold mt-2">
                      {formatPrice((item.product.comparePrice || item.product.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <button
              type="button"
              className="flex w-full items-center justify-between text-sm mb-4 pb-4 border-b border-border"
              onClick={() => setShowCoupon(!showCoupon)}
            >
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Apply Coupon
              </span>
              {showCoupon ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showCoupon && (
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Apply Coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button variant="outline" size="sm" type="button" onClick={handleApplyCoupon}>
                  Apply
                </Button>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sub Total (1 items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-orange-500">{shipping === 0 ? "will be added" : formatPrice(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total Amount</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button
              type="submit"
              className="w-full mb-4 gap-2"
              disabled={isLoadingOrder}
              size="lg"
            >
              {isLoadingOrder ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm & Place Order"
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
