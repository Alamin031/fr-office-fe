import { create } from "zustand"
import { persist } from "zustand/middleware"
import { CartItem, Product } from "../types"
import { getProductPriceWithType } from "../lib/utils/product"

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, variants?: Record<string, string>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, variants = {}) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id)

          // Extract explicit fields from variants if present
          const color = variants.color || undefined;
          const storage = variants.storage || undefined;
          const RAM = variants.RAM || variants.ram || undefined;
          const sim = variants.sim || undefined;
          const dynamicInputs = variants.dynamicInputs || undefined;

          // Calculate the price for this product with selected variants and price type
          const price = getProductPriceWithType(product, variants);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                product,
                quantity,
                selectedVariants: variants,
                color,
                storage,
                RAM,
                sim,
                dynamicInputs,
                price,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
