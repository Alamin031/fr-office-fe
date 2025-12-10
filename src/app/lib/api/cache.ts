/* eslint-disable @typescript-eslint/no-unused-vars */
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export class CacheManager {
  private static readonly PREFIX = "__cache__"

  private static getKey(key: string): string {
    return `${this.PREFIX}${key}`
  }

  static set<T>(key: string, data: T, ttl: number = 300000): void {
    if (typeof window === "undefined") return
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      }
      localStorage.setItem(this.getKey(key), JSON.stringify(entry))
    } catch (error) {}
  }

  static get<T>(key: string): T | null {
    if (typeof window === "undefined") return null
    try {
      const item = localStorage.getItem(this.getKey(key))
      if (!item) return null
      const entry: CacheEntry<T> = JSON.parse(item)
      const now = Date.now()
      const age = now - entry.timestamp
      if (age > entry.ttl) {
        this.remove(key)
        return null
      }
      return entry.data
    } catch (error) {
      return null
    }
  }

  static remove(key: string): void {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(this.getKey(key))
    } catch (error) {}
  }

  static clear(): void {
    if (typeof window === "undefined") return
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {}
  }

  static isValid(key: string): boolean {
    if (typeof window === "undefined") return false
    try {
      const item = localStorage.getItem(this.getKey(key))
      if (!item) return false
      const entry: CacheEntry<unknown> = JSON.parse(item)
      const now = Date.now()
      const age = now - entry.timestamp
      return age <= entry.ttl
    } catch (error) {
      return false
    }
  }

  static getAge(key: string): number | null {
    if (typeof window === "undefined") return null
    try {
      const item = localStorage.getItem(this.getKey(key))
      if (!item) return null
      const entry: CacheEntry<unknown> = JSON.parse(item)
      return Date.now() - entry.timestamp
    } catch (error) {
      return null
    }
  }
}
