"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/hooks/use-user"

export function FreezeOverlay() {
  const { user } = useUser()
  const [isFrozen, setIsFrozen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [popup, setPopup] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const poll = async () => {
      if (!user) return
      try {
        const res = await fetch(`/api/users/${user.id}`)
        if (!res.ok) return
        const data = await res.json()
        if (!active) return
        setIsFrozen(Boolean(data.user?.is_frozen))
        setMessage(data.user?.freeze_message || null)
        if (data.user?.freeze_popup_message) {
          setPopup(data.user.freeze_popup_message)
          try {
            await fetch(`/api/freeze/popup`, { method: 'POST', body: JSON.stringify({ targetUserId: user.id, popupMessage: '' }) })
          } catch {}
        }
      } catch {}
    }
    poll()
    return () => { active = false }
  }, [user?.id])

  useEffect(() => {
    const blockKeys = (e: KeyboardEvent) => {
      if (isFrozen) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    const blockClicks = (e: MouseEvent) => {
      if (isFrozen) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('keydown', blockKeys, true)
    document.addEventListener('keypress', blockKeys, true)
    document.addEventListener('click', blockClicks, true)
    return () => {
      document.removeEventListener('keydown', blockKeys, true)
      document.removeEventListener('keypress', blockKeys, true)
      document.removeEventListener('click', blockClicks, true)
    }
  }, [isFrozen])

  if (!isFrozen) return null

  return (
    <div className="fixed inset-0 z-[70] pointer-events-auto">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(180,200,220,0.25)' }} />
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10" />
      <div className="absolute inset-0 frost-overlay" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="px-6 py-4 rounded-xl border bg-white/80 dark:bg-gray-900/80 shadow-2xl max-w-md text-center">
          <div className="text-xl font-semibold mb-2">Account Frozen</div>
          {message && <div className="text-sm text-muted-foreground mb-2">{message}</div>}
          <div className="text-xs text-muted-foreground">You cannot send messages or join voice while frozen.</div>
        </div>
      </div>
      {popup && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg bg-black text-white shadow-lg">
          {popup}
        </div>
      )}
    </div>
  )
}


