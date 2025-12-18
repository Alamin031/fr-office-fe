"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Grid, Gift, Settings, MessageCircle, Smartphone, X, ChevronDown, Package } from "lucide-react"
import { cn } from "@/app/lib/utils"
import { Sheet, SheetContent, SheetClose } from "../ui/sheet"
import { Button } from "../ui/button"
import { categoriesService } from "@/app/lib/api/services"
import type { Category } from "@/app/types"


interface NavItem {
  href?: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  action?: "modal"
}

const navItems: NavItem[] = [
  {
    href: "/",
    icon: Smartphone,
    label: "Home",
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
    href: "/account/settings",
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
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const data = await categoriesService.getAll()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-2xl lg:hidden">
        <div className="flex items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href && (pathname === item.href || (item.href === "/" && pathname === "/"))

            if (item.action === "modal") {
              return (
                <button
                  key={item.label}
                  onClick={() => setIsCategoriesOpen(true)}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 px-2 py-3 font-medium transition-all duration-200 rounded-lg",
                    "text-gray-600 hover:text-black hover:bg-gray-50",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] leading-tight">{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 px-2 py-3 font-medium transition-all duration-200 rounded-lg",
                  isActive
                    ? "text-black bg-gray-100"
                    : "text-gray-600 hover:text-black hover:bg-gray-50",
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  item.label === "Rewards" && "text-red-500"
                )} />
                <span className={cn(
                  "text-[10px] leading-tight",
                  item.label === "Rewards" && "text-red-500"
                )}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Categories Sidebar */}
      <Sheet open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
        <SheetContent side="right" className="w-full max-w-sm p-0">
          <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }} id="mobile-categories-title">
            Categories
          </span>
          <div className="flex h-full flex-col bg-gradient-to-b from-white to-gray-50" aria-labelledby="mobile-categories-title">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 bg-white sticky top-0 z-10 shadow-sm">
              <span className="text-lg font-bold text-gray-900">Categories</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </Button>
              </SheetClose>
            </div>

            {/* Content */}
            <nav className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin">
                    <Package className="h-8 w-8 text-gray-300" />
                  </div>
                </div>
              ) : categories.length > 0 ? (
                <div className="p-4 space-y-2">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold transition-all duration-200 rounded-lg group",
                          pathname === `/category/${category.slug}`
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <SheetClose asChild>
                          <Link
                            href={`/category/${category.slug}`}
                            className="flex-1 text-left"
                          >
                            {category.name}
                          </Link>
                        </SheetClose>
                        {category.children && category.children.length > 0 && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform flex-shrink-0 ml-2",
                              pathname === `/category/${category.slug}` && "text-blue-600",
                              expandedCategory === category.id && "rotate-180"
                            )}
                          />
                        )}
                      </button>

                      {/* Subcategories */}
                      {category.children && expandedCategory === category.id && (
                        <div className="mt-1 ml-2 pl-3 border-l-2 border-gray-200 space-y-1">
                          {category.children.map((subcategory) => (
                            <SheetClose key={subcategory.id} asChild>
                              <Link
                                href={`/category/${subcategory.slug}`}
                                className={cn(
                                  "block px-4 py-2.5 text-xs font-medium transition-all duration-200 rounded-md",
                                  pathname === `/category/${subcategory.slug}`
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                )}
                              >
                                {subcategory.name}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Package className="h-12 w-12 text-gray-300 mb-3" />
                  <span className="text-sm text-gray-500 font-medium">No categories available</span>
                </div>
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

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
