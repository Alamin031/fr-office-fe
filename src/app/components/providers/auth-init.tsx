"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/app/store/auth-store"

/**
 * Client component to initialize auth state on app startup
 * Fetches current user from /users/me if token exists
 */
export function AuthInit() {
  const [isHydrated, setIsHydrated] = useState(false)
  const { token, isInitialized, hydrate } = useAuthStore()

  // Phase 1: Hydrate from localStorage
  useEffect(() => {
    const rehydrate = async () => {
      await useAuthStore.persist.rehydrate()
      setIsHydrated(true)
    }
    rehydrate()
  }, [])

  // Phase 2: If hydrated and token exists, fetch user data
  useEffect(() => {
    if (isHydrated && token && !isInitialized) {
      hydrate()
    }
  }, [isHydrated, token, isInitialized, hydrate])

  return null
}
