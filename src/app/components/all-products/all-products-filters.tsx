"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import type { Category, Brand } from "@/app/types";

interface AllProductsFiltersProps {
  categories: Category[];
  brands: Brand[];
  selectedCategories: string[];
  selectedBrands: string[];
}

export function AllProductsFilters({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
}: AllProductsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategories, setActiveCategories] =
    useState<string[]>(selectedCategories);
  const [activeBrands, setActiveBrands] = useState<string[]>(selectedBrands);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (categorySlug: string) => {
    setActiveCategories((prev) =>
      prev.includes(categorySlug)
        ? prev.filter((c) => c !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  const toggleBrand = (brandSlug: string) => {
    setActiveBrands((prev) =>
      prev.includes(brandSlug)
        ? prev.filter((b) => b !== brandSlug)
        : [...prev, brandSlug]
    );
  };

  const clearAllFilters = () => {
    setActiveCategories([]);
    setActiveBrands([]);
    router.push("/all-products");
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (activeCategories.length > 0) {
      activeCategories.forEach((cat) => params.append("categories", cat));
    }

    if (activeBrands.length > 0) {
      activeBrands.forEach((brand) => params.append("brands", brand));
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `/all-products?${queryString}`
      : "/all-products";

    router.push(newUrl, { scroll: false });
  }, [activeCategories, activeBrands, router]);

  const hasActiveFilters = activeCategories.length > 0 || activeBrands.length > 0;

  const DesktopFilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Filters</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeCategories.map((categorySlug) => {
              const cat = categories.find((c) => c.slug === categorySlug);
              return (
                <Button
                  key={categorySlug}
                  variant="secondary"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => toggleCategory(categorySlug)}
                >
                  {cat?.name}
                  <X className="h-3 w-3" />
                </Button>
              );
            })}
            {activeBrands.map((brandSlug) => {
              const brand = brands.find((b) => b.slug === brandSlug);
              return (
                <Button
                  key={brandSlug}
                  variant="secondary"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => toggleBrand(brandSlug)}
                >
                  {brand?.name}
                  <X className="h-3 w-3" />
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <button
          onClick={() => toggleSection("categories")}
          className="flex w-full items-center justify-between py-2 font-semibold"
        >
          Categories
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              expandedSections.categories && "rotate-180"
            )}
          />
        </button>
        {expandedSections.categories && (
          <div className="mt-2 space-y-2">
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    checked={activeCategories.includes(category.slug)}
                    onCheckedChange={() => toggleCategory(category.slug)}
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No categories available
              </p>
            )}
          </div>
        )}
      </div>

      {/* Brands */}
      <div>
        <button
          onClick={() => toggleSection("brands")}
          className="flex w-full items-center justify-between py-2 font-semibold"
        >
          Brands
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              expandedSections.brands && "rotate-180"
            )}
          />
        </button>
        {expandedSections.brands && (
          <div className="mt-2 space-y-2">
            {brands && brands.length > 0 ? (
              brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    checked={activeBrands.includes(brand.slug)}
                    onCheckedChange={() => toggleBrand(brand.slug)}
                  />
                  <span className="text-sm">{brand.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No brands available
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block" suppressHydrationWarning>
        <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">Filters</h2>
          <DesktopFilterContent />
        </div>
      </div>

      {/* Mobile Filters - Horizontal Scrollable Rows */}
      <div className="space-y-3 lg:hidden" suppressHydrationWarning>
        {/* Categories Row */}
        {categories && categories.length > 0 && (
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.slug)}
                  className={cn(
                    "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors flex-shrink-0",
                    activeCategories.includes(category.slug)
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Brands Row */}
        {brands && brands.length > 0 && (
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => toggleBrand(brand.slug)}
                  className={cn(
                    "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors flex-shrink-0",
                    activeBrands.includes(brand.slug)
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clear All Button */}
        {hasActiveFilters && (
          <div className="flex justify-center pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
