import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { generateOrganizationSchema } from "./lib/seo"
import "./globals.css"
import { JsonLd } from "./components/seo/json-ld"
import { StoreProvider } from "./components/providers/store-provider"
import { AuthInit } from "./components/providers/auth-init"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://techstore.com"),
  title: {
    default: "TechStore - Premium Electronics & Gadgets | Best Prices in India",
    template: "%s | TechStore",
  },
  description:
    "Shop the latest smartphones, laptops, tablets, and accessories at TechStore. 100% genuine products with official warranty, easy EMI options, and fast delivery across India.",
  keywords: [
    "electronics",
    "gadgets",
    "smartphones",
    "laptops",
    "tablets",
    "accessories",
    "iPhone",
    "Samsung",
    "MacBook",
    "online shopping India",
  ],
  authors: [{ name: "TechStore" }],
  creator: "TechStore",
  publisher: "TechStore",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://techstore.com",
    siteName: "TechStore",
    title: "TechStore - Premium Electronics & Gadgets",
    description:
      "Shop the latest smartphones, laptops, tablets, and accessories with official warranty and fast delivery.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TechStore - Premium Electronics & Gadgets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechStore - Premium Electronics & Gadgets",
    description:
      "Shop the latest smartphones, laptops, tablets, and accessories with official warranty and fast delivery.",
    images: ["/og-image.jpg"],
    creator: "@techstore",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
  alternates: {
    canonical: "https://techstore.com",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd data={generateOrganizationSchema()} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <StoreProvider>
          <AuthInit />
          {children}
        </StoreProvider>
        <Analytics />
      </body>
    </html>
  )
}
