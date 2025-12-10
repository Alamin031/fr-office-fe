import { NextRequest, NextResponse } from "next/server"

interface OAuthCallbackBody {
  provider: "google" | "facebook"
  code: string
  codeVerifier?: string | null
}

interface OAuthTokenResponse {
  access_token: string
  id_token?: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

interface OAuthUserProfile {
  id: string
  email: string
  name: string
  picture?: string
  avatar?: string
}

/**
 * Exchange OAuth authorization code for access token
 */
async function exchangeCodeForToken(
  provider: "google" | "facebook",
  code: string,
  codeVerifier?: string | null,
): Promise<OAuthTokenResponse> {
  const clientId = process.env[`NEXT_PUBLIC_${provider.toUpperCase()}_CLIENT_ID`] || ""
  const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`] || ""
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback/${provider}`

  if (!clientId || !clientSecret) {
    throw new Error(`Missing OAuth credentials for ${provider}`)
  }

  let tokenEndpoint = ""
  const params: Record<string, string> = {
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  }

  if (provider === "google") {
    tokenEndpoint = "https://oauth2.googleapis.com/token"
    params.grant_type = "authorization_code"

    if (codeVerifier) {
      params.code_verifier = codeVerifier
    }
  } else if (provider === "facebook") {
    tokenEndpoint = "https://graph.facebook.com/v18.0/oauth/access_token"
    params.access_type = "offline"
  }

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || error.error || `Failed to exchange code for token`)
  }

  return response.json()
}

/**
 * Get user profile from OAuth provider
 */
async function getUserProfile(provider: "google" | "facebook", accessToken: string): Promise<OAuthUserProfile> {
  let profileEndpoint = ""

  if (provider === "google") {
    profileEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo"
  } else if (provider === "facebook") {
    profileEndpoint = "https://graph.facebook.com/v18.0/me?fields=id,email,name,picture"
  }

  const response = await fetch(profileEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile from ${provider}`)
  }

  const data = await response.json()

  // Normalize the response based on provider
  if (provider === "google") {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
    }
  } else if (provider === "facebook") {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatar: data.picture?.data?.url,
    }
  }

  throw new Error(`Unknown OAuth provider: ${provider}`)
}

/**
 * Create or update user in your database
 * This is a placeholder - implement according to your backend API
 */
async function syncUserWithBackend(
  provider: "google" | "facebook",
  profile: OAuthUserProfile,
  accessToken: string,
): Promise<{
  user: OAuthUserProfile
  token: string
}> {
  // Call your backend API to create/update user
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

  const response = await fetch(`${apiBaseUrl}/api/auth/oauth-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider,
      profile,
      accessToken,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `Failed to sync user with backend`)
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    // Verify request content type
    const contentType = request.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ message: "Invalid content type" }, { status: 400 })
    }

    const body: OAuthCallbackBody = await request.json()
    const { provider, code, codeVerifier } = body

    // Validate provider
    if (!provider || !["google", "facebook"].includes(provider)) {
      return NextResponse.json(
        { message: "Invalid or missing OAuth provider" },
        { status: 400 },
      )
    }

    // Validate code
    if (!code) {
      return NextResponse.json(
        { message: "Missing authorization code" },
        { status: 400 },
      )
    }

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(provider, code, codeVerifier)

    // Get user profile
    const userProfile = await getUserProfile(provider, tokenData.access_token)

    // Sync user with backend and get session token
    const { user, token } = await syncUserWithBackend(provider, userProfile, tokenData.access_token)

    // Return success response
    return NextResponse.json(
      {
        success: true,
        user,
        token,
        message: `Successfully logged in with ${provider}`,
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": `access_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
        },
      },
    )
  } catch (error) {

    const message = error instanceof Error ? error.message : "Internal server error"

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    )
  }
}
