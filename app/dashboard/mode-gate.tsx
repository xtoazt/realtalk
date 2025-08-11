"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function ModeGate() {
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(()=>{
    try {
      const seen = localStorage.getItem('seen-mode-gate')
      if (!seen) setShow(true)
    } catch {}
  },[])

  // Force a refresh post-auth before showing chooser to ensure a clean state
  useEffect(()=>{
    try {
      const flag = sessionStorage.getItem('refreshed-after-auth')
      const onAuth = location.pathname === '/dashboard' || location.pathname === '/dashboard/lite'
      if (onAuth && !flag) {
        sessionStorage.setItem('refreshed-after-auth','1')
        location.reload()
      }
    } catch {}
  },[])

  const choose = (mode: 'lite'|'full') => {
    try { localStorage.setItem('seen-mode-gate','1') } catch {}
    if (mode==='lite') router.push('/dashboard/lite')
    else router.push('/dashboard')
  }

  if (!show) return null
  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-[90%] max-w-md border">
        <h3 className="text-lg font-semibold mb-2">Choose your experience</h3>
        <p className="text-sm text-muted-foreground mb-4">Pick a UI mode. You can change this later in Settings.</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={()=> choose('lite')} className="rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
            <div className="font-medium mb-1">Lite</div>
            <div className="text-xs text-muted-foreground">Minimal and fast. Global chat, Friends, DMs, Settings, Group Chats.</div>
          </button>
          <button onClick={()=> choose('full')} className="rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
            <div className="font-medium mb-1">Full</div>
            <div className="text-xs text-muted-foreground">Full experience with entertainment, voice, polls, and more.</div>
          </button>
        </div>
      </div>
    </div>
  )
}


