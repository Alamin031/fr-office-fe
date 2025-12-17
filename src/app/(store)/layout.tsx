import type React from "react"
import { Navbar } from "../components/layout/navbar"
import { Footer } from "../components/layout/footer"
import { MobileBottomNav } from "../components/layout/mobile-bottom-nav"

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
