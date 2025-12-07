/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import { categoriesService } from "@/app/lib/api/services/categories";
import { brandsService } from "@/app/lib/api/services/brands";
import { productsService } from "@/app/lib/api/services/products";
import { AllProductsFilters } from "@/app/components/all-products/all-products-filters";
import { CategoryProducts } from "@/app/components/category/category-products";
import type { Category, Brand, Product } from "@/app/types/index";

interface AllProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type RawCategory = {
  id: string;
  name?: string;
  slug?: string;
  image?: string | null;
  parentId?: string | null;
  children?: RawCategory[];
  productCount?: number;
  banner?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Explore our complete collection of products. Find the perfect tech devices with warranty and competitive prices.",
};

export default async function Page({ searchParams }: AllProductsPageProps) {
  // Await searchParams
  const params = await searchParams;

  // Fetch all categories
  const categoriesRaw = await categoriesService.getAll();
  const categories: Category[] = (categoriesRaw as unknown as RawCategory[]).map(
    (c: RawCategory) => ({
      id: c.id,
      name: c.name ?? "",
      slug: c.slug ?? "",
      image: c.image ?? undefined,
      parentId: c.parentId ?? undefined,
      children: Array.isArray(c.children)
        ? (c.children as RawCategory[]).map((child) => ({
            id: child.id,
            name: child.name ?? "",
            slug: child.slug ?? "",
            image: child.image ?? undefined,
            parentId: child.parentId ?? undefined,
            children: undefined,
            productCount: child.productCount ?? 0,
            banner: child.banner ?? undefined,
            createdAt: child.createdAt ?? "",
            updatedAt: child.updatedAt ?? "",
          }))
        : undefined,
      productCount: c.productCount ?? 0,
      banner: c.banner ?? undefined,
      createdAt: c.createdAt ?? "",
      updatedAt: c.updatedAt ?? "",
    })
  );

  // Fetch all brands
  let brands: Brand[] = [];
  try {
    brands = await brandsService.findAll();
  } catch {
    brands = [];
  }

  // Extract search params
  const selectedCategories = Array.isArray(params.categories)
    ? params.categories
    : params.categories
    ? [params.categories]
    : [];

  const selectedBrands = Array.isArray(params.brands)
    ? params.brands
    : params.brands
    ? [params.brands]
    : [];

  // Fetch products with filters
  let products: Product[] = [];
  try {
    const filters: any = {};

    if (selectedCategories.length > 0) {
      filters.categoryId = selectedCategories[0];
    }

    if (selectedBrands.length > 0) {
      filters.brandId = selectedBrands[0];
    }

    const res = await productsService.getAll(filters, 1, 200);

    if (res && typeof res === "object") {
      if (Array.isArray((res as { data?: unknown[] }).data)) {
        products = (res as { data?: unknown[] }).data as Product[];
      } else if (Array.isArray((res as { items?: unknown[] }).items)) {
        products = (res as { items?: unknown[] }).items as Product[];
      } else if (Array.isArray(res)) {
        products = res as Product[];
      } else {
        products = [];
      }
    } else if (Array.isArray(res)) {
      products = res as Product[];
    } else {
      products = [];
    }
  } catch (error) {
    console.error("Failed to fetch products:", error);
    products = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">All Products</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          All Products
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore our complete collection of products. Find the perfect tech
          devices with warranty and competitive prices.
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters - Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <AllProductsFilters
            categories={categories}
            brands={brands}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
          />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <CategoryProducts products={products} />
        </main>
      </div>
    </div>
  );
}
