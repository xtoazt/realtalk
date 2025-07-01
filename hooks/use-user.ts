"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export interface AppUser {
  id: string
  username: string
  theme?: "light" | "dark"
  notifications_enabled?: boolean
  // add extra columns here if needed
}

interface UserContextValue {
  user: AppUser | null
  loading: boolean
  setUser: Dispatch<SetStateAction<AppUser | null>>
  refresh: () => Promise<void>
}

/* ------------------------------------------------------------------ */
/* Context + Provider                                                  */
/* ------------------------------------------------------------------ */
const UserContext = createContext<UserContextValue | undefined>(undefined)

/**
 * UserProvider – wrap your app with this to expose `useUser()` data.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper to fetch current user from your existing endpoint
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      if (!res.ok) {
        setUser(null)
        return
      }
      const data = (await res.json()) as { user: AppUser | null }
      setUser(data.user)
    } catch {
      setUser(null)
    }
  }

  /** Exposed so components can manually refresh after login/logout */
  const refresh = async () => {
    setLoading(true)
    await fetchCurrentUser()
    setLoading(false)
  }

  // Initial load
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => ({ user, loading, setUser, refresh }), [user, loading])
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */
/**
 * Access the current user and loading flag anywhere in your app.
 */
export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error("useUser must be used inside <UserProvider>")
  }
  return ctx
}
