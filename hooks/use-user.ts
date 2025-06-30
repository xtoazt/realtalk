"use client"

import { useState, useEffect } from "react"
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
          setUser(data.user)

          // Apply theme to document element - FIXED
          if (data.user?.theme) {
            console.log("[useUser] Applying theme:", data.user.theme)
            // Force theme application
            document.documentElement.setAttribute("data-theme", data.user.theme)
            // Also set class for backup
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
    if (!updatedUser) {
      console.warn("[useUser] updateUser called with null user, not updating theme.")
      setUser(null)
      return
    }
    setUser(updatedUser)
    if (updatedUser.theme) {
      console.log("[useUser] Updating theme to:", updatedUser.theme)
      // Force theme application
      document.documentElement.setAttribute("data-theme", updatedUser.theme)
      document.documentElement.className = `theme-${updatedUser.theme}`
      // Force a repaint
      document.body.style.display = "none"
      document.body.offsetHeight // Trigger reflow
      document.body.style.display = ""
    }
  }

  return { user, loading, setUser: updateUser }
}
