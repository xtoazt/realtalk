"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  username: string
  email?: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  profile_picture?: string
  theme?: string
  hue?: string
  notifications_enabled?: boolean
  last_active?: string
  created_at: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      console.log("[UserProvider] Fetching user data...")
      setLoading(true)
      setError(null)

      const response = await fetch("/api/auth/me", {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      console.log("[UserProvider] Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[UserProvider] User data received:", data.user?.username)
        setUser(data.user)
      } else {
        console.log("[UserProvider] No user authenticated")
        setUser(null)
      }
    } catch (err) {
      console.error("[UserProvider] Error fetching user:", err)
      setError("Failed to load user data")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null))
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser, updateUser }}>{children}</UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
