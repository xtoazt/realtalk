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
export type User = {
  id: string
  username: string
  email?: string | null
}

/* The shape of the context we expose to consumers */
type UserContextValue = {
  user: User | null
  loading: boolean
  setUser: Dispatch<SetStateAction<User | null>>
}

/* ------------------------------------------------------------------ */
/* Context + Provider                                                  */
/* ------------------------------------------------------------------ */
const UserContext = createContext<UserContextValue | undefined>(undefined)

/**
 * UserProvider – wrap your app with this to expose `useUser()` data.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        if (!cancelled && res.ok) {
          const { user: u } = (await res.json()) as { user: User | null }
          setUser(u)
        }
      } catch {
        /* eslint-disable no-console */
        console.warn("use-user: Failed to fetch current user")
        /* eslint-enable no-console */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchUser()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => ({ user, loading, setUser }), [user, loading])
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
  if (!ctx) throw new Error("useUser must be used within <UserProvider />")
  return ctx
}
