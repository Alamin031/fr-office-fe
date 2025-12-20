import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "../types"
import AuthService from "../lib/api/services/auth.service"
import { TokenManager } from "../lib/api/token-manager"

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  isHydrating: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  hydrate: () => Promise<void>
  setInitialized: (value: boolean) => void
}



export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,
      isHydrating: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        TokenManager.clearTokens()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: false
        })
      },
      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },
      hydrate: async () => {
        const state = get()
        if (!state.token || state.isHydrating) return

        set({ isHydrating: true })
        try {
          const authService = new AuthService()
          const userData = await authService.getCurrentUser()
          // Map role to only "admin" or "user"
          const mappedUser = {
            ...userData,
            role: userData.role === "admin" || userData.role === "user" ? userData.role : "user",
            addresses: userData.addresses ?? [],
          }
          set({ user: mappedUser, isAuthenticated: true, isInitialized: true })
        } catch (error: any) {
          // Only logout on 401/403 (unauthorized) or token validation errors
          // Don't logout on network errors or other transient failures
          const status = error?.response?.status
          if (status === 401 || status === 403) {
            set({ user: null, isAuthenticated: false, isInitialized: true })
          } else {
            // For other errors, mark as initialized but authenticated (token exists)
            // The middleware will handle actual token validation
            set({ isInitialized: true })
          }
        } finally {
          set({ isHydrating: false })
        }
      },
      setInitialized: (value) => {
        set({ isInitialized: value })
      },
    }),
    {
      name: "auth-storage",
      skipHydration: true,
    },
  ),
)
