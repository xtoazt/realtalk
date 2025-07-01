"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { type User, getCurrentUser } from "@/lib/auth"

/* -------------------------------------------------------------------------- */
/* Context                                                                    */
/* -------------------------------------------------------------------------- */
interface UserContextValue {
  user: User | null
  loading: boolean
  setUser: Dispatch<SetStateAction<User | null>>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */
export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const current = await getCurrentUser()

      if (cancelled) return
      setUser(current)
      setLoading(false)

      if (!current) {
        router.push("/auth")
        return
      }

      /* Apply saved theme instantly */
      if (current.theme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [router])

  const value = useMemo<UserContextValue>(() => ({ user, loading, setUser }), [user, loading])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */
export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within a <UserProvider>")
  return ctx
}
