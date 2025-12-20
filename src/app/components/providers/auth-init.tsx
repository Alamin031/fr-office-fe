"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/app/store/auth-store"
import { TokenManager } from "@/app/lib/api/token-manager"

/**
 * Client component to initialize auth state on app startup
 * Fetches current user from /users/me if token exists
 * Syncs cookies and localStorage to prevent token mismatch in production
 */
export function AuthInit() {
  const [isHydrated, setIsHydrated] = useState(false)
  const { token, isInitialized, hydrate } = useAuthStore()

  // Phase 1: Hydrate from localStorage and sync with cookies
  useEffect(() => {
    const rehydrate = async () => {
      await useAuthStore.persist.rehydrate()

      // After hydration, verify cookies are in sync with localStorage
      // This fixes production issue where cookies might be stale/missing
      const currentToken = TokenManager.getToken()
      const authStore = useAuthStore.getState()

      // If store has token but cookies don't, re-sync
      if (authStore.token && !currentToken) {
        TokenManager.setTokens(authStore.token, localStorage.getItem("refresh_token") || undefined)
      }

      setIsHydrated(true)
    }
    rehydrate()
  }, [])

  // Phase 2: If hydrated and token exists, fetch user data and revalidate
  useEffect(() => {
    if (isHydrated && token && !isInitialized) {
      hydrate().catch((error) => {
        console.error("Auth hydration failed:", error)
        // Don't clear auth state on hydration error - let middleware handle it
      })
    }
  }, [isHydrated, token, isInitialized, hydrate])

  return null
}
