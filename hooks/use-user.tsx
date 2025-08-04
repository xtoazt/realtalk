"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  email?: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  notifications_enabled: boolean
  theme: string
  hue: string
  signup_code?: string
  profile_picture?: string
  bio?: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Apply theme and hue to document
  const applyThemeAndHue = (userData: User | null) => {
    if (typeof window === "undefined") return

    if (userData) {
      console.log("[UserProvider] Applying theme:", userData.theme, "hue:", userData.hue)

      // Apply theme
      if (userData.theme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }

      // Apply hue
      const hueClasses = [
        "hue-blue",
        "hue-purple",
        "hue-pink",
        "hue-red",
        "hue-orange",
        "hue-yellow",
        "hue-green",
        "hue-teal",
      ]
      hueClasses.forEach((cls) => document.documentElement.classList.remove(cls))

      if (userData.hue) {
        document.documentElement.classList.add(`hue-${userData.hue}`)
      }
    } else {
      // Reset to defaults when no user
      document.documentElement.classList.remove("dark")
      const hueClasses = [
        "hue-blue",
        "hue-purple",
        "hue-pink",
        "hue-red",
        "hue-orange",
        "hue-yellow",
        "hue-green",
        "hue-teal",
      ]
      hueClasses.forEach((cls) => document.documentElement.classList.remove(cls))
      document.documentElement.classList.add("hue-blue")
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("[UserProvider] Fetching user data...")
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          console.log("[UserProvider] User data received:", userData.user)
          setUser(userData.user)
          applyThemeAndHue(userData.user)
        } else {
          console.log("[UserProvider] No user found")
          setUser(null)
          applyThemeAndHue(null)
        }
      } catch (error) {
        console.error("[UserProvider] Fetch error:", error)
        setUser(null)
        applyThemeAndHue(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const updateUser = (updatedUser: User | null) => {
    console.log("[UserProvider] updateUser called with:", updatedUser)
    setUser(updatedUser)
    applyThemeAndHue(updatedUser)
  }

  return <UserContext.Provider value={{ user, loading, setUser: updateUser }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
