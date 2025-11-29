"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useOAuth } from "@/app/lib/oauth"

export default function OAuthCallbackPage({ params }: { params: { provider: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleOAuthCallback, oauthError, isOAuthLoading } = useOAuth()
  const [isProcessing, setIsProcessing] = useState(true)

  const provider = params.provider as "google" | "facebook"
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for OAuth errors
        if (error) {
          const message = errorDescription || error || "OAuth login failed"
          toast.error(message)
          router.push("/login")
          return
        }

        // Check if we have the authorization code
        if (!code) {
          toast.error("Missing authorization code")
          router.push("/login")
          return
        }

        // Validate provider
        if (provider !== "google" && provider !== "facebook") {
          toast.error("Invalid OAuth provider")
          router.push("/login")
          return
        }

        // Handle the OAuth callback
        const success = await handleOAuthCallback(provider, code)

        if (success) {
          toast.success("Login successful!")
          const from = searchParams.get("from") || "/"
          router.push(from)
        } else {
          toast.error(oauthError || "Failed to complete OAuth login")
          router.push("/login")
        }
      } catch (error) {
        console.error("OAuth callback error:", error)
        toast.error("An unexpected error occurred")
        router.push("/login")
      } finally {
        setIsProcessing(false)
      }
    }

    if (typeof window !== "undefined") {
      processCallback()
    }
  }, [code, error, errorDescription, provider, router, searchParams, handleOAuthCallback, oauthError])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">
          {isProcessing || isOAuthLoading ? "Processing your login..." : "Redirecting..."}
        </p>
      </div>
    </div>
  )
}
