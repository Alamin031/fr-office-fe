/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useSWRCache } from "@/app/hooks/use-swr-cache"
import { ProductSection } from "@/app/components/home/product-section"
import { productsService } from "@/app/lib/api/services/products"
import type { Product } from "@/app/types"

import type { EmiPlan } from "@/app/lib/api/services/emi";

interface ProductSectionLazyProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  productIds?: string[];
  categoryId?: string;
  brandId?: string;
  limit?: number;
  products?: Product[] | undefined;
  emiPlans?: EmiPlan[];
}

export function ProductSectionLazy({
  title,
  subtitle,
  viewAllLink,
  productIds,
  categoryId,
  brandId,
  limit = 10,
  products: productsProp,
  emiPlans,
}: ProductSectionLazyProps) {
  const cacheKey = `products_section_${title
    .toLowerCase()
    .replace(/\s+/g, "_")}_${productIds?.join(",") || categoryId || brandId || "all"}`;
  const { data: response, isLoading: swrLoading, error, mutate } = useSWRCache<{ data?: Product[] | Product[] }>(
    cacheKey,
    async () => {
      let products: Product[] = [];
      if (productIds && productIds.length > 0) {
        try {
          const res = await productsService.getAll(
            { ids: productIds } as any,
            1,
            productIds.length
          );
          products = Array.isArray((res as any).items)
            ? (res as any).items
            : Array.isArray((res as any).data)
            ? (res as any).data
            : Array.isArray(res)
            ? (res as Product[])
            : [];
        } catch {
          // Fallback: fetch all and filter
          const allRes = await productsService.getAll({}, 1, 1000);
          const allProducts = Array.isArray((allRes as any).items)
            ? (allRes as any).items
            : Array.isArray((allRes as any).data)
            ? (allRes as any).data
            : Array.isArray(allRes)
            ? (allRes as Product[])
            : [];
          products = allProducts.filter((p: Product) =>
            productIds.includes(p.id)
          );
        }
      } else if (categoryId || brandId) {
        const res = await productsService.getAll(
          {
            categoryId: categoryId,
            brandId: brandId,
          },
          1,
          limit
        );
        products = Array.isArray((res as any).items)
          ? (res as any).items
          : Array.isArray((res as any).data)
          ? (res as any).data
          : Array.isArray(res)
          ? (res as Product[])
          : [];
      } else {
        const res = await productsService.getAll({}, 1, limit);
        products = Array.isArray((res as any).items)
          ? (res as any).items
          : Array.isArray((res as any).data)
          ? (res as any).data
          : Array.isArray(res)
          ? (res as Product[])
          : [];
      }
      return { data: products };
    },
    {
      ttl: 600000, // 10 minutes for home page sections
      revalidateOnMount: false, // Only load when visible
      revalidateOnFocus: false,
    }
  );
  const products = productsProp ?? response?.data ?? [];
  const isLoading = productsProp ? false : swrLoading;
  const hasError = !productsProp && error;

  if (hasError) {
    return (
      <section className="mx-auto w-full py-8">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-red-900">{title}</h3>
          <p className="text-sm text-red-700">Unable to load products. Please try again.</p>
          <button
            onClick={() => mutate()}
            className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <ProductSection
      title={title}
      subtitle={subtitle}
      products={products}
      viewAllLink={viewAllLink}
      isLoading={isLoading}
      emiPlans={emiPlans}
    />
  );
}
