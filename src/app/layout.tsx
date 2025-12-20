import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { generateOrganizationSchema } from "./lib/seo"
import "./globals.css"
import { JsonLd } from "./components/seo/json-ld"
import { StoreProvider } from "./components/providers/store-provider"
import { AuthInit } from "./components/providers/auth-init"
import { WhatsappChat } from "./components/layout/whatsapp-chat"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://www.friendstelecom.com.bd/"),
  title: {
    default: "Friends Telecom - Premium Electronics & Gadgets | Best Prices in Bangladesh",
    template: "%s | Friends Telecom",
  },
  description:
    "Shop the latest smartphones, laptops, tablets, and accessories at Friends Telecom. 100% genuine products with official warranty, easy EMI options, and fast delivery across Bangladesh.",
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
    url: "https://www.friendstelecom.com.bd/",
    siteName: "Friends Telecom",
    title: "Friends Telecom - Premium Electronics & Gadgets",
    description:
      "Shop the latest smartphones, laptops, tablets, and accessories with official warranty and fast delivery.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Friends Telecom - Premium Electronics & Gadgets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Friends Telecom - Premium Electronics & Gadgets",
    description:
      "Shop the latest smartphones, laptops, tablets, and accessories with official warranty and fast delivery.",
    images: ["/og-image.jpg"],
    creator: "@friendstelecom",
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
    canonical: "https://www.friendstelecom.com.bd/",
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
          {/* Main app content */}
          {children}
          <WhatsappChat />
        </StoreProvider>
        <Analytics />
      </body>
    </html>
  )
}
