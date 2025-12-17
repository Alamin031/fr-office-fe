/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";
import Link from "next/link";
import { categoriesService } from "@/app/lib/api/services/categories";
import { brandsService } from "@/app/lib/api/services/brands";
import { productsService } from "@/app/lib/api/services/products";
import { CategoryProducts } from "@/app/components/category/category-products";
import { ProductsListClient } from "@/app/components/all-products/products-list-client";
import { AllProductsFilters } from "@/app/components/all-products/all-products-filters";
import type { Category, Product, Brand } from "@/app/types/index";

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

  // Extract filter parameters from URL
  const selectedCategories = params.categories
    ? Array.isArray(params.categories)
      ? params.categories
      : [params.categories]
    : [];
  const selectedBrands = params.brands
    ? Array.isArray(params.brands)
      ? params.brands
      : [params.brands]
    : [];

  // Parallelize API calls with graceful error handling
  let categoriesRaw: any = [];
  let brandsRaw: any = [];
  let productsRaw: any = null;

  try {
    const results = await Promise.allSettled([
      categoriesService.getAll(),
      brandsService.findAll(),
      // Fetch products with relations to ensure brand and category data is included
      productsService.getAll({includeRelations: 'true'}, 1, 500),
    ]);

    // Extract successful results or use empty arrays as fallback
    if (results[0].status === 'fulfilled') {
      categoriesRaw = results[0].value;
    }
    if (results[1].status === 'fulfilled') {
      brandsRaw = results[1].value;
    }
    if (results[2].status === 'fulfilled') {
      productsRaw = results[2].value;
    }

    // Log failures for monitoring
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const names = ['categories', 'brands', 'products'];
        console.error(`Failed to load ${names[index]}:`, result.reason);
      }
    });
  } catch (error) {
    console.error('Error loading all-products page data:', error);
    // Continue with empty arrays - page will still render with available data
  }

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

  const brands: Brand[] = Array.isArray(brandsRaw) ? brandsRaw : [];

  let products: Product[] = [];
  if (productsRaw && typeof productsRaw === "object") {
    if (Array.isArray((productsRaw as { data?: unknown[] }).data)) {
      products = (productsRaw as { data?: unknown[] }).data as Product[];
    } else if (Array.isArray((productsRaw as { items?: unknown[] }).items)) {
      products = (productsRaw as { items?: unknown[] }).items as Product[];
    } else if (Array.isArray(productsRaw)) {
      products = productsRaw as Product[];
    }
  } else if (Array.isArray(productsRaw)) {
    products = productsRaw as Product[];
  }

  // Create a brand ID lookup for enriching products
  const brandIdLookup = brands.reduce((acc, brand) => {
    acc[brand.id] = brand;
    return acc;
  }, {} as Record<string, Brand>);

  // Enrich products with brand information if missing
  products = products.map((product: any) => {
    const enrichedProduct = { ...product };
    if (enrichedProduct.brand && enrichedProduct.brand.id && !enrichedProduct.brandId) {
      enrichedProduct.brandId = enrichedProduct.brand.id;
    }
    if (enrichedProduct.brandId && !enrichedProduct.brand) {
      enrichedProduct.brand = brandIdLookup[enrichedProduct.brandId];
    }
    return enrichedProduct;
  });


  // Build lookup tables for faster searching
  const categoryLookupBySlug = categories.reduce((acc, c) => {
    acc[c.slug] = c;
    return acc;
  }, {} as Record<string, Category>);

  const brandLookupBySlug = brands.reduce((acc, b) => {
    acc[b.slug] = b;
    return acc;
  }, {} as Record<string, Brand>);

  // Filter products based on selected categories and brands
  let filteredProducts = products.filter((product) => {
    // If no filters selected, include all products
    if (selectedCategories.length === 0 && selectedBrands.length === 0) {
      return true;
    }

    // Check category match
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((categorySlug) => {
        const category = categoryLookupBySlug[categorySlug];
        if (!category) return false;

        const productCategoryId = (product as any).categoryId;
        const productCategoryIds = (product as any).categoryIds as string[] | undefined;

        return (
          productCategoryId === category.id ||
          (productCategoryIds?.includes(category.id) ?? false)
        );
      });

    // Check brand match
    const matchesBrand =
      selectedBrands.length === 0 ||
      selectedBrands.some((brandSlug) => {
        const brand = brandLookupBySlug[brandSlug];
        if (!brand) {
          console.warn(`Brand with slug "${brandSlug}" not found in brands list`);
          return false;
        }

        const productBrandId = (product as any).brandId;
        const productBrandIds = (product as any).brandIds as string[] | undefined;

        return (
          productBrandId === brand.id ||
          (productBrandIds?.includes(brand.id) ?? false)
        );
      });

    return matchesCategory && matchesBrand;
  });


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
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0" suppressHydrationWarning>
          <AllProductsFilters
            categories={categories}
            brands={brands}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
          />
        </aside>

        {/* Products Grid */}
        <main className="flex-1 min-w-0">
          {/* Mobile Filters - shown above products */}
          <div className="lg:hidden mb-6" suppressHydrationWarning>
            <AllProductsFilters
              categories={categories}
              brands={brands}
              selectedCategories={selectedCategories}
              selectedBrands={selectedBrands}
            />
          </div>

          <ProductsListClient
            initialProducts={filteredProducts.slice(0, 20)}
            totalProducts={filteredProducts.length}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            allProducts={filteredProducts}
            categories={categories}
            brands={brands}
          />
        </main>
      </div>
    </div>
  );
}
