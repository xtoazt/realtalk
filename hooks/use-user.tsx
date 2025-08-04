"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  email?: string
  signup_code?: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  notifications_enabled?: boolean
  theme?: string
  hue?: string
  profile_picture?: string
  bio?: string
  created_at?: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const setUser = (newUser: User | null) => {
    console.log("[useUser] Setting user:", newUser?.username || "null")
    setUserState(newUser)

    if (newUser) {
      // Apply theme and hue to document
      applyTheme(newUser.theme || "light", newUser.hue || "blue")
    } else {
      // Reset to defaults when user is null
      applyTheme("light", "blue")
    }
  }

  const applyTheme = (theme: string, hue: string) => {
    console.log("[useUser] Applying theme:", theme, "hue:", hue)

    // Remove existing theme classes
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

    // Apply new theme and hue
    document.documentElement.classList.add(theme)
    document.documentElement.classList.add(`hue-${hue}`)

    // Set CSS custom properties for hue
    const hueValues = {
      red: "0",
      orange: "25",
      yellow: "45",
      green: "120",
      blue: "220",
      purple: "270",
      pink: "320",
      gray: "0",
    }

    document.documentElement.style.setProperty("--hue", hueValues[hue as keyof typeof hueValues] || "220")
  }

  const refreshUser = async () => {
    try {
      console.log("[useUser] Refreshing user data...")
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[useUser] Refreshed user:", data.user?.username)
        setUser(data.user)
        return data.user
      } else {
        console.log("[useUser] No authenticated user during refresh")
        setUser(null)
        return null
      }
    } catch (error) {
      console.error("[useUser] Error refreshing user:", error)
      setUser(null)
      return null
    }
  }

  const signOut = async () => {
    try {
      console.log("[useUser] Signing out...")

      // Call sign out API
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        console.warn("[useUser] Sign out API failed, but continuing...")
      }

      // Clear user state
      setUser(null)

      // Force redirect to clear any cached state
      window.location.href = "/auth"
    } catch (error) {
      console.error("[useUser] Sign out error:", error)
      // Force redirect even if API fails
      setUser(null)
      window.location.href = "/auth"
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("[useUser] Initial user fetch...")
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          console.log("[useUser] Initial user fetched:", data.user?.username)
          setUser(data.user)
        } else {
          console.log("[useUser] No authenticated user")
          setUser(null)
        }
      } catch (error) {
        console.error("[useUser] Error fetching user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, loading, signOut, refreshUser }}>{children}</UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
