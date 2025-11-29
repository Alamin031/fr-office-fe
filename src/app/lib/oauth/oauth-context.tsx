"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { useAuthStore } from "@/app/store/auth-store"
export type OAuthProviderType = "google" | "facebook"

export interface OAuthConfig {
  google: {
    clientId: string
    redirectUri: string
    scope: string[]
  }
  facebook: {
    appId: string
    redirectUri: string
    scope: string[]
  }
}

interface OAuthContextType {
  isOAuthLoading: boolean
  oauthError: string | null
  initiateOAuth: (provider: OAuthProviderType) => void
  handleOAuthCallback: (provider: OAuthProviderType, code: string) => Promise<boolean>
  clearOAuthError: () => void
}

const OAuthContext = createContext<OAuthContextType | undefined>(undefined)

const DEFAULT_OAUTH_CONFIG: OAuthConfig = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "123456789-abcdefg.apps.googleusercontent.com",
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback/google`,
    scope: ["openid", "profile", "email"],
  },
  facebook: {
    appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "1234567890123456",
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback/facebook`,
    scope: ["public_profile", "email"],
  },
}

export function OAuthProvider({ children }: { children: React.ReactNode }) {
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)
  const [oauthError, setOAuthError] = useState<string | null>(null)
  const authStore = useAuthStore()

  const clearOAuthError = useCallback(() => {
    setOAuthError(null)
  }, [])

  const generateCodeVerifier = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
    let result = ""
    for (let i = 0; i < 128; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const hash = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hash))
    return btoa(String.fromCharCode(...hashArray)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  }

  const initiateOAuth = useCallback(async (provider: OAuthProviderType) => {
    try {
      setIsOAuthLoading(true)
      setOAuthError(null)

      if (provider === "google") {
        const config = DEFAULT_OAUTH_CONFIG.google
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)

        // Store code verifier for later use in callback
        if (typeof window !== "undefined") {
          sessionStorage.setItem("oauth_code_verifier", codeVerifier)
        }

        const params = new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          response_type: "code",
          scope: config.scope.join(" "),
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
          access_type: "offline",
          prompt: "consent",
          state: crypto.getRandomValues(new Uint8Array(32)).toString(),
        })

        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
      } else if (provider === "facebook") {
        const config = DEFAULT_OAUTH_CONFIG.facebook
        const state = crypto.getRandomValues(new Uint8Array(32)).toString()

        if (typeof window !== "undefined") {
          sessionStorage.setItem("oauth_state", state)
        }

        const params = new URLSearchParams({
          client_id: config.appId,
          redirect_uri: config.redirectUri,
          response_type: "code",
          scope: config.scope.join(","),
          state: state,
          auth_type: "rerequest",
        })

        window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to initiate OAuth"
      setOAuthError(message)
      setIsOAuthLoading(false)
    }
  }, [])

  const handleOAuthCallback = useCallback(
    async (provider: OAuthProviderType, code: string): Promise<boolean> => {
      try {
        setIsOAuthLoading(true)
        setOAuthError(null)

        // Call your backend API to exchange code for token
        const response = await fetch("/api/auth/oauth-callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            provider,
            code,
            codeVerifier: typeof window !== "undefined" ? sessionStorage.getItem("oauth_code_verifier") : null,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "OAuth callback failed")
        }

        const data = await response.json()

        // Update auth store with user and token
        if (data.user && data.token) {
          authStore.login(data.user, data.token)

          // Clear stored values
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("oauth_code_verifier")
            sessionStorage.removeItem("oauth_state")
          }

          return true
        }

        throw new Error("Invalid response from OAuth callback")
      } catch (error) {
        const message = error instanceof Error ? error.message : "OAuth callback processing failed"
        setOAuthError(message)
        return false
      } finally {
        setIsOAuthLoading(false)
      }
    },
    [authStore],
  )

  return (
    <OAuthContext.Provider value={{ isOAuthLoading, oauthError, initiateOAuth, handleOAuthCallback, clearOAuthError }}>
      {children}
    </OAuthContext.Provider>
  )
}

export function useOAuth() {
  const context = useContext(OAuthContext)
  if (context === undefined) {
    throw new Error("useOAuth must be used within an OAuthProvider")
  }
  return context
}

export function withOAuth<P extends object>(Component: React.ComponentType<P>) {
  return function WithOAuthComponent(props: P) {
    return (
      <OAuthProvider>
        <Component {...props} />
      </OAuthProvider>
    )
  }
}
