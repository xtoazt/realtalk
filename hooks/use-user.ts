"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  email: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  notifications_enabled: boolean
  theme: string
  signup_code?: string
}

interface UserContextValue {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
}
const UserContext = createContext<UserContextValue | undefined>(undefined)

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("[useUser] Fetching user data...")
        const response = await fetch("/api/auth/me")
        console.log("[useUser] Response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("[useUser] User data received:", data.user?.username)
          setUser(data.user) // This calls updateUser

          // Apply theme to document element directly on initial load if user data is valid
          if (data.user && typeof data.user.theme === "string") {
            console.log("[useUser] Applying theme from initial fetch:", data.user.theme)
            document.documentElement.setAttribute("data-theme", data.user.theme)
            document.documentElement.className = `theme-${data.user.theme}`
          }
        } else {
          console.log("[useUser] Auth failed, redirecting to /auth")
          router.push("/auth")
        }
      } catch (error) {
        console.error("[useUser] Fetch error:", error)
        router.push("/auth")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const updateUser = (updatedUser: User | null) => {
    console.log("[useUser] updateUser called with:", updatedUser)
    setUser(updatedUser) // Always update the state first

    if (updatedUser && typeof updatedUser.theme === "string") {
      // More robust check for theme
      console.log("[useUser] Applying theme from updatedUser:", updatedUser.theme)
      document.documentElement.setAttribute("data-theme", updatedUser.theme)
      document.documentElement.className = `theme-${updatedUser.theme}`
      // Removed the force repaint hack
    } else {
      console.warn("[useUser] updatedUser is null/undefined or updatedUser.theme is not a string, cannot apply theme.")
    }
  }

  return { user, loading, setUser: updateUser }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const value = useUser()
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUserContext() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error("useUserContext must be used within a <UserProvider>")
  }
  return ctx
}
