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
  bio?: string
  created_at: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const applyTheme = (theme: string, hue: string) => {
    console.log("[UserProvider] Applying theme:", theme, "hue:", hue)

    // Remove existing classes
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.remove(
      "hue-red",
      "hue-orange",
      "hue-yellow",
      "hue-green",
      "hue-blue",
      "hue-purple",
      "hue-pink",
      "hue-gray",
    )

    // Apply new classes
    document.documentElement.classList.add(theme)
    document.documentElement.classList.add(`hue-${hue}`)
  }

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

        // Apply theme when user is loaded
        if (data.user) {
          applyTheme(data.user.theme || "dark", data.user.hue || "gray")
        } else {
          applyTheme("dark", "gray")
        }
      } else {
        console.log("[UserProvider] No user authenticated")
        setUser(null)
        // Apply default theme
        applyTheme("dark", "gray")
      }
    } catch (err) {
      console.error("[UserProvider] Error fetching user:", err)
      setError("Failed to load user data")
      setUser(null)
      applyTheme("dark", "gray")
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...userData }

      // Apply theme when user is updated
      if (userData.theme || userData.hue) {
        applyTheme(updated.theme || "dark", updated.hue || "gray")
      }

      return updated
    })
  }

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
      applyTheme("dark", "gray")
      window.location.href = "/auth"
    } catch (error) {
      console.error("[UserProvider] Sign out error:", error)
      setUser(null)
      window.location.href = "/auth"
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser, updateUser, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
