"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "../ui/button"
import { categoriesService } from "@/app/lib/api/services/categories"
import type { Category } from "@/app/types"

interface CategoriesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CategoriesModal({ isOpen, onClose }: CategoriesModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    async function fetchCategories() {
      try {
        setIsLoading(true)
        const data = await categoriesService.getAll()
        const normalized = data.map((c) => ({
          ...c,
          slug: c.slug ?? "",
        })) as Category[]
        setCategories(normalized)
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">All Categories</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                onClick={onClose}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-accent active:bg-accent/70"
              >
                <span className="text-center text-sm font-medium">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No categories available
          </p>
        )}
      </div>
    </div>
  )
}
