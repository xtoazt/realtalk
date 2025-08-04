"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("[useUser] Fetching user data...")
        const response = await fetch("/api/auth/me")
        console.log("[useUser] Response status:", response.status)

        if (response.ok) {
          const userData = await response.json()
          console.log("[useUser] User data received:", userData.user?.username)
          setUser(userData.user)

          // Apply user's hue if available
          if (userData.user?.hue) {
            document.documentElement.className = document.documentElement.className
              .replace(/hue-\w+/g, "")
              .concat(` hue-${userData.user.hue}`)
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

    fetchUser()
  }, [router])

  const updateUser = (updatedUser: User | null) => {
    console.log("[useUser] updateUser called with:", updatedUser)
    setUser(updatedUser)

    if (updatedUser?.hue) {
      console.log("[useUser] Applying hue:", updatedUser.hue)
      document.documentElement.className = document.documentElement.className
        .replace(/hue-\w+/g, "")
        .concat(` hue-${updatedUser.hue}`)
    }
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
