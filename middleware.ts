import { NextRequest, NextResponse } from "next/server"

const adminRoutes = [
  "/admin",
]

const userProtectedRoutes = [
  "/account",
  "/account/orders",
  "/account/addresses",
  "/account/notifications",
  "/account/settings",
  "/account/wishlist",
  "/account/wallet",
  "/checkout",
  "/orders",
  "/profile",
  "/wishlist",
  "/compare",
]

const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/auth/callback"]

const publicRoutes = [
  "/",
  "/products",
  "/categories",
  "/brands",
  "/terms",
  "/privacy-policy",
  "/shipping-info",
  "/return-policy",
  "/faq",
  "/faqs",
  "/contact",
  "/contact-us",
  "/about",
  "/track-order",
  "/warranty",
  "/returns-refunds",
]

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname.startsWith(route))
}

function isUserProtectedRoute(pathname: string): boolean {
  return userProtectedRoutes.some((route) => pathname.startsWith(route))
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname.startsWith(route))
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
}

function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }
  const token = request.cookies.get("access_token")?.value || request.cookies.get("auth_token")?.value
  return token || null
}

function decodeTokenLocally(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString())
    return payload
  } catch {
    return null
  }
}

async function validateTokenWithBackend(token: string): Promise<Record<string, unknown> | null> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://friends-be-production.up.railway.app/api"
    const response = await fetch(`${apiBaseUrl}/auth/decode/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    if (response.ok) {
      return await response.json()
    }
    return decodeTokenLocally(token)
  } catch {
    return decodeTokenLocally(token)
  }
}

async function isTokenExpired(token: string): Promise<boolean> {
  try {
    const payload = await validateTokenWithBackend(token)
    if (!payload || !payload.exp) return true
    const expirationTime = (payload.exp as number) * 1000
    return Date.now() >= expirationTime
  } catch {
    return true
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = getTokenFromRequest(request)
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.match(/\.(png|jpg|jpeg|gif|ico|svg|webp)$/)) {
    return NextResponse.next()
  }
  const isAdmin = isAdminRoute(pathname)
  const isUserProtected = isUserProtectedRoute(pathname)
  const isAuth = isAuthRoute(pathname)
  const isPublic = isPublicRoute(pathname)
  if (token && await isTokenExpired(token)) {
    const response = NextResponse.redirect(new URL("/login?token-expired=true", request.url))
    // Properly delete cookies with explicit options to ensure they're cleared
    // This must match the domain/path settings from tokenmanager.ts
    response.cookies.delete("access_token")
    response.cookies.delete("auth_token")
    response.cookies.delete("refresh_token")

    // Also set them to expire immediately with various options
    const cookieOptions = {
      httpOnly: false,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax" as const,
      path: "/",
    }

    response.cookies.set("access_token", "", { ...cookieOptions, maxAge: 0 })
    response.cookies.set("auth_token", "", { ...cookieOptions, maxAge: 0 })
    response.cookies.set("refresh_token", "", { ...cookieOptions, maxAge: 0 })

    // Header to clear browser storage
    response.headers.set("Clear-Site-Data", '"cache", "cookies", "storage"')
    return response
  }
  if ((isAdmin || isUserProtected) && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    const response = NextResponse.redirect(loginUrl)
    // Prevent caching of redirects to login page
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    return response
  }
  if (isAuth && token && !pathname.startsWith("/auth/callback")) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  if (isPublic) {
    return NextResponse.next()
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
