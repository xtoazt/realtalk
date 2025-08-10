"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useTheme } from "next-themes"

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
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Apply hue to document
  const applyHue = (userData: User | null) => {
    if (typeof window === "undefined" || !mounted) return

    if (userData?.hue) {
      console.log("[UserProvider] Applying hue:", userData.hue)
      
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
      document.documentElement.classList.add(`hue-${userData.hue}`)
    } else {
      // fallback
      const hueClasses = [
        "hue-blue","hue-purple","hue-pink","hue-red","hue-orange","hue-yellow","hue-green","hue-teal"
      ]
      hueClasses.forEach((cls) => document.documentElement.classList.remove(cls))
      document.documentElement.classList.add("hue-blue")
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("[UserProvider] Fetching user data...")
        const response = await fetch("/api/auth/me", { cache: 'no-store' })
        if (response.ok) {
          const userData = await response.json()
          console.log("[UserProvider] User data received:", userData.user)
          setUser(userData.user)
          
          // Apply hue after mounting; do not force theme here to avoid flicker/override
          if (mounted && userData.user) {
            applyHue(userData.user)
          }
        } else {
          console.log("[UserProvider] No user found")
          setUser(null)
        }
      } catch (error) {
        console.error("[UserProvider] Fetch error:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      fetchUser()
      // Avoid showing blank content flashes by deferring render to next tick on first mount
      setTimeout(() => {}, 0)
    }
  }, [mounted, setTheme])

  // Apply hue when user changes
  useEffect(() => {
    if (mounted) {
      applyHue(user)
    }
  }, [user, mounted])

  const updateUser = (updatedUser: User | null) => {
    console.log("[UserProvider] updateUser called with:", updatedUser)
    setUser(updatedUser)
    
    if (mounted && updatedUser) {
      // Set theme directly without relying on server response shape elsewhere
      setTheme(updatedUser.theme || 'light')
      applyHue(updatedUser)
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
