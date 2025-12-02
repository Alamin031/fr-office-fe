"use client";

import Link from "next/link";
import Image from "next/image";

import type { Category } from "@/app/types";

interface CategorySliderProps {
  categories: Category[];
}

export function CategorySlider({ categories }: CategorySliderProps) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const displayedCategories = safeCategories.slice(0, 10);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="w-full grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {displayedCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="group flex flex-col items-center gap-2 justify-center"
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted transition-all duration-300 group-hover:bg-accent group-hover:shadow-md sm:h-20 sm:w-20 md:h-24 md:w-24">
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
                className="object-cover p-2 sm:p-3 transition-transform duration-300 group-hover:scale-110"
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
