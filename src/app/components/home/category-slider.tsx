"use client";

import Link from "next/link";
import Image from "next/image";

import type { Category } from "@/app/types";

interface CategorySliderProps {
  categories: Category[];
}

export function CategorySlider({ categories }: CategorySliderProps) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const sortedCategories = [...safeCategories].sort((a, b) => {
    const priorityA = a.priority ? Number(a.priority) : Infinity;
    const priorityB = b.priority ? Number(b.priority) : Infinity;
    return priorityA - priorityB;
  });
  const displayedCategories = sortedCategories.slice(0, 10);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {displayedCategories.map((category, index) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className={`group flex flex-col items-center gap-2 justify-center ${index >= 6 ? 'hidden sm:flex' : ''}`}
          >
            <div
              style={{
                height: "5rem",
                width: "5rem",
                background: "none",
                position: "relative",
                border: "2px solid #e5e7eb", // Tailwind's border-muted color
                borderRadius: "0.75rem" // rounded-xl
              }}
              className="sm:w-[9rem] sm:h-[9rem]"
            >
              <Image
                src={
                  typeof category.banner === "string" &&
                  category.banner.trim() !== ""
                    ? category.banner
                    : typeof category.image === "string" &&
                      category.image.trim() !== ""
                    ? category.image
                    : "/placeholder.svg"
                }
                alt={category.name}
                fill
                className="object-cover p-3 sm:p-4 transition-transform duration-300 group-hover:scale-110 rounded-xl"
                style={{ background: "none" }}
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground text-center line-clamp-2 w-full px-1">
              {category.name}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/all-products"
        className="mt-6 px-8 py-3 rounded-lg bg-foreground text-background font-medium text-sm sm:text-base transition-colors hover:bg-foreground/90"
      >
        View All Categories
      </Link>
    </div>
  );
}
