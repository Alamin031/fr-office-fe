import { CacheManager } from './cache';

/**
 * Utility to invalidate product-related cache keys
 * Call this after creating, updating, or deleting products
 */
export class ProductCacheUtils {
  /**
   * Clear all product list caches
   * Handles all combinations of: tabs (all/basic/network/region) + categories + pagination
   */
  static invalidateProductLists(): void {
    if (typeof window === 'undefined') return;

    try {
      const cacheKeyPrefix = '__cache__';
      // Clear all cache entries that relate to product lists
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        // Check if it's a cache key
        if (key.startsWith(cacheKeyPrefix)) {
          // Decode the cache key
          const cacheKey = key.substring(cacheKeyPrefix.length);

          // Match patterns:
          // 1. admin/products page uses: "{tab}-{category}-{page}" (e.g., "all-all-1", "basic-cat-id-1")
          // 2. Other patterns like "products_list_*" or keys containing "product"
          const isProductListCache =
            // Tab-category-page pattern (all-, basic-, network-, region-)
            /^(all|basic|network|region)-/.test(cacheKey) ||
            // Product list API patterns
            cacheKey.startsWith('products_list_') ||
            cacheKey.includes('getAllLite') ||
            // Generic product patterns
            cacheKey.startsWith('products');

          if (isProductListCache) {
            CacheManager.remove(cacheKey);
          }
        }
      });
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Clear specific product detail cache by ID
   */
  static invalidateProductDetail(productId: string): void {
    CacheManager.remove(`product_${productId}`);
    CacheManager.remove(`product-${productId}`);
  }

  /**
   * Clear all product-related caches (lists + details)
   * Use this for bulk operations or when unsure which caches to clear
   */
  static invalidateAllProductCaches(): void {
    this.invalidateProductLists();
    // Also clear any product detail caches
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (
          key.startsWith('__cache__') &&
          (key.includes('product_') || key.includes('product-'))
        ) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}
