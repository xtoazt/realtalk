"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export interface User {
  id: string
  username: string
  email?: string | null
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  notifications_enabled?: boolean
  theme?: string
  signup_code?: string
}

interface UserContextValue {
  user: User | null
  loading: boolean
  setUser: Dispatch<SetStateAction<User | null>>
}

/* ------------------------------------------------------------------ */
/* Context + Provider                                                  */
/* ------------------------------------------------------------------ */
const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch current user once on mount
  useEffect(() => {
    let cancel = false

    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        if (!cancel && res.ok) {
          const data = await res.json()
          setUser(data.user ?? null)

          // apply theme immediately
          if (data.user?.theme) {
            document.documentElement.classList.toggle("dark", data.user.theme === "dark")
          }
        } else if (!cancel) {
          // Not logged-in – redirect to /auth
          router.push("/auth")
        }
      } catch (err) {
        console.error("[use-user] fetch error", err)
        if (!cancel) router.push("/auth")
      } finally {
        if (!cancel) setLoading(false)
      }
    }

    fetchUser()
    return () => {
      cancel = true
    }
  }, [router])

  const ctxValue = useMemo<UserContextValue>(
    () => ({
      user,
      loading,
      setUser,
    }),
    [user, loading],
  )

  return <UserContext.Provider value={ctxValue}>{children}</UserContext.Provider>
}

/* ------------------------------------------------------------------ */
/* Hook for consumers                                                  */
/* ------------------------------------------------------------------ */
export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error("useUser must be used within a <UserProvider>")
  }
  return ctx
}
