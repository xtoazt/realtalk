"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/hooks/use-user"
import { VoiceChat } from "@/components/voice/VoiceChat"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Phone, X } from "lucide-react"

export function VoiceWidget() {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("voiceWidgetOpen")
    if (saved) setOpen(saved === "1")
    const en = localStorage.getItem("voiceWidgetEnabled")
    setEnabled(en === "1")
    const onStorage = (e: StorageEvent) => {
      if (e.key === "voiceWidgetEnabled") setEnabled(e.newValue === "1")
    }
    const onToggle = () => setEnabled(localStorage.getItem("voiceWidgetEnabled") === "1")
    window.addEventListener("storage", onStorage)
    window.addEventListener("voice-widget-toggle", onToggle as any)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("voice-widget-toggle", onToggle as any)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("voiceWidgetOpen", open ? "1" : "0")
  }, [open])

  if (!user || !enabled) return null

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      {!open ? (
        <Button
          className="rounded-full h-12 w-12 shadow-lg"
          title="Open Voice Widget"
          onClick={() => setOpen(true)}
        >
          <Phone className="h-5 w-5" />
        </Button>
      ) : (
        <div className="w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
            <div className="text-sm font-medium">Voice (global)</div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-2">
            {/* Mount the full VoiceChat; it has its own controls. */}
            <VoiceChat roomId="global-voice" userId={user.id} />
          </div>
        </div>
      )}
    </div>
  )
}


