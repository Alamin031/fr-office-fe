/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, LogOut, Search, User, ChevronDown, AlertCircle, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useAuthStore } from "@/app/store/auth-store"
import { useProductNotifyStore } from "@/app/store/product-notify-store"
import { notificationService } from "@/app/lib/api/services/notify"
import type { Notification } from "@/app/lib/api/services/notify"

export function AdminHeader() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { notifications: productNotifications } = useProductNotifyStore()
  const [headerNotifications, setHeaderNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getHeader({ isAdmin: true })
      setHeaderNotifications(data || [])
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const unreadCount = headerNotifications.filter((n) => n.read === false).length
  const productNotifyCount = productNotifications.filter((n) => n.status === "pending").length

  const handleNotificationClick = async (notification: Notification) => {
    try {
      setLoading(true)
      await notificationService.markAsRead(notification.id)

      setHeaderNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      )

      if (notification.link) {
        router.push(notification.link)
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const handleLogout = async () => {
    const authService = new AuthService()
    try {
      await authService.logout()
    } catch (error) {
      console.error("Logout error:", error)
      // Even if API fails, we'll redirect via the AuthService
    }
    // AuthService.logout() now handles the redirect, so this won't be reached
    // But kept for safety
    logout()
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="relative flex-1 md:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Link href="/admin/notify-products">
          <Button variant="ghost" size="icon" className="relative">
            <AlertCircle className="h-5 w-5" />
            {productNotifyCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-semibold text-destructive-foreground">
                {productNotifyCount}
              </span>
            )}
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            <DropdownMenuSeparator />

            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : headerNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {headerNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex flex-col items-start gap-1 px-3 py-2 cursor-pointer ${
                      !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight line-clamp-2">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(notification.createdAt)}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}

            {headerNotifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className="justify-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 py-2"
                >
                  <Link href="/admin/notifications">View All</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-2">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user?.name || "Admin"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-center text-xs font-bold leading-8 text-white">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-none">{user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "admin@store.com"}</p>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 px-2 py-1.5">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user?.name || "Admin"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-center text-xs font-bold leading-8 text-white">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
              )}
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "admin@store.com"}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="cursor-pointer flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
