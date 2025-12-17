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
    // Clear all cache entries that start with these patterns
    const patterns = [
      'products_list_',
      'all-', // matches the cache key pattern used in admin/products/page.tsx
      'basic-',
      'network-',
      'region-',
    ];

    // Get all cache keys from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      // Check if it's a product cache key (has __cache__ prefix)
      if (key.startsWith('__cache__')) {
        const cacheKey = key.replace('__cache__', '');
        // Remove if it matches any product list pattern
        if (patterns.some(pattern => cacheKey.startsWith(pattern))) {
          CacheManager.remove(cacheKey);
        }
      }
    });
  }

  /**
   * Clear specific product detail cache by ID
   */
  static invalidateProductDetail(productId: string): void {
    CacheManager.remove(`product_${productId}`);
  }

  /**
   * Clear all product caches (lists + details)
   * Use this for bulk operations or when unsure which caches to clear
   */
  static invalidateAllProductCaches(): void {
    // Clear all cache entries related to products
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (
        key.startsWith('__cache__') &&
        (key.includes('product') ||
          key.includes('all-') ||
          key.includes('basic-') ||
          key.includes('network-') ||
          key.includes('region-'))
      ) {
        localStorage.removeItem(key);
      }
    });
  }
}
