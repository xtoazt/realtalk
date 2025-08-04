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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)

          // Apply user's hue if available
          if (userData.user?.hue) {
            document.documentElement.className = document.documentElement.className
              .replace(/hue-\w+/g, "")
              .concat(` hue-${userData.user.hue}`)
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const updateUser = (updatedUser: User | null) => {
    setUser(updatedUser)

    if (updatedUser?.hue) {
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
