"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { useRef } from "react";

import type { Category } from "@/app/types";

interface CategorySliderProps {
  categories: Category[];
  viewAllLink?: string;
}

export function CategorySlider({ categories, viewAllLink }: CategorySliderProps) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const sortedCategories = [...safeCategories].sort((a, b) => {
    const priorityA = a.priority ? Number(a.priority) : Infinity;
    const priorityB = b.priority ? Number(b.priority) : Infinity;
    return priorityA - priorityB;
  });
  const displayedCategories = sortedCategories;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header with Title and View All Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold">
          <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-purple-500 bg-clip-text text-transparent">Shop by</span>{" "}
          Category
        </h2>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="shrink-0 inline-flex items-center rounded-full border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View All
          </a>
        )}
      </div>

      {/* Category Slider - Hidden Scrollbar */}
      <style>{`
        @media (max-width: 1023px) {
          .hide-scrollbar-mobile::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar-mobile {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
      `}</style>
      <div
        ref={scrollContainerRef}
        className="hide-scrollbar-mobile flex gap-px overflow-x-auto scroll-smooth w-full scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
        style={{
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {displayedCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center gap-2 justify-center flex-shrink-0 w-24 sm:w-32 md:w-36"
            >
              <div
                style={{
                  height: "5rem",
                  width: "5rem",
                  background: "none",
                  position: "relative",
                  border: "2px solid #e5e7eb",
                  borderRadius: "0.75rem",
                }}
                className="sm:w-[7rem] sm:h-[7rem]"
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
                  className="object-cover p-3 transition-transform duration-300 group-hover:scale-110 rounded-xl"
                  style={{ background: "none" }}
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground text-center line-clamp-2 w-full px-1 h-10 flex items-center justify-center">
                {category.name}
              </span>
            </Link>
          ))}
      </div>
    </div>
  );
}
