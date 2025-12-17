import { useAuthStore } from "@/app/store/auth-store";
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios"
import axiosRetry from "axios-retry"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "  https://friends-be-production.up.railway.app/api").trim()

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Configure automatic retry with exponential backoff
// Retries up to 3 times on network errors or 5xx errors (not 4xx)
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: (retryCount) => {
    // Exponential backoff: 1s, 2s, 4s
    return retryCount * 1000 * Math.pow(2, retryCount - 1)
  },
  retryCondition: (error) => {
    // Retry on network errors and 5xx server errors
    // Don't retry on 4xx client errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) &&
           (!error.response || (error.response.status >= 500))
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore.getState();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401/403 - unauthorized or forbidden
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const authStore = useAuthStore.getState()

        // Clear all auth state first
        authStore.logout()

        // Wait a bit for state to clear
        await new Promise(resolve => setTimeout(resolve, 100))

        if (typeof window !== "undefined") {
          // Hard reload to clear all caches (cookies, middleware, etc)
          window.location.href = "/login?session-expired=true"
        }
      } catch (logoutError) {
        console.error("Logout error during 401 handling:", logoutError)
        const authStore = useAuthStore.getState()
        authStore.logout()
        if (typeof window !== "undefined") {
          window.location.href = "/login?session-expired=true"
        }
        return Promise.reject(logoutError)
      }
    }

    // Handle network errors and timeout
    if (error.message === "Network Error" || !error.response) {
      console.error("Network or API error:", error)
      // Don't redirect on network errors - let the caller handle it
      // Only clear auth if we have a token to prevent stale state
      try {
        const authStore = useAuthStore.getState()
        if (authStore.token && error.response?.status === 401) {
          authStore.logout()
        }
      } catch (e) {
        console.error("Error during network error handling:", e)
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
