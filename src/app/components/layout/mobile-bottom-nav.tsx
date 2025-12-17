"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, Grid, Gift, Settings, MessageCircle, Smartphone } from "lucide-react"
import { cn } from "@/app/lib/utils"
import { CategoriesModal } from "./categories-modal"

interface NavItem {
  href?: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  action?: "modal"
}

const navItems: NavItem[] = [
  {
    href: "/category/powerbanks",
    icon: Smartphone,
    label: "PowerBanks",
  },
  {
    href: "/category/power-delivery",
    icon: Zap,
    label: "PD",
  },
  {
    icon: Grid,
    label: "Categories",
    action: "modal",
  },
  {
    href: "/rewards",
    icon: Gift,
    label: "Rewards",
  },
  {
    href: "/personalization",
    icon: Settings,
    label: "Personalisation",
  },
  {
    href: "/chat",
    icon: MessageCircle,
    label: "Chat",
  },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background lg:hidden">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href && (pathname === item.href || (item.href === "/" && pathname === "/"))

            if (item.action === "modal") {
              return (
                <button
                  key={item.label}
                  onClick={() => setIsCategoriesModalOpen(true)}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition-colors",
                    "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span>{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <CategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />
    </>
  )
}
