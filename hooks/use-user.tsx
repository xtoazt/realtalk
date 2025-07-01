"use client"

import { createContext, useContext, useState, useEffect, useMemo } from "react"
import type { ReactNode, Dispatch, SetStateAction } from "react"

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
export interface AppUser {
  id: string
  username: string
  theme?: "light" | "dark"
  notifications_enabled?: boolean
}

interface UserContextValue {
  user: AppUser | null
  loading: boolean
  setUser: Dispatch<SetStateAction<AppUser | null>>
  refresh: () => Promise<void>
}

/* ------------------------------------------------------------------ */
/* Context & Provider                                                 */
/* ------------------------------------------------------------------ */
const UserContext = createContext<UserContextValue | undefined>(undefined)

/**
 * Fetches the current user from your API.
 * Adjust the endpoint if it differs in your project.
 */
async function fetchCurrentUser(): Promise<AppUser | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" })
    if (!res.ok) return null
    const data = (await res.json()) as { user: AppUser | null }
    return data.user
  } catch {
    return null
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  /** Allows components to refresh user data after sign-in/out actions. */
  const refresh = async () => {
    setLoading(true)
    const current = await fetchCurrentUser()
    setUser(current)
    setLoading(false)
  }

  /* Initial load */
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<UserContextValue>(() => ({ user, loading, setUser, refresh }), [user, loading])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */
export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error("useUser must be used inside <UserProvider>")
  }
  return ctx
}
