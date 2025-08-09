"use client"

import { useUser } from "@/hooks/use-user"
import { VoiceChat } from "@/components/voice/VoiceChat"

export function VoiceTab() {
  const { user } = useUser()
  if (!user) return null
  // Use a stable room for now (e.g., global); can be extended to per-group/channel
  const roomId = "global-voice"
  return (
    <div className="space-y-3">
      <VoiceChat roomId={roomId} userId={user.id} />
      <div className="flex items-center gap-2 text-sm">
        <input
          id="voice-enable-widget"
          type="checkbox"
          defaultChecked={typeof window !== 'undefined' && localStorage.getItem('voiceWidgetEnabled') === '1'}
          onChange={(e) => localStorage.setItem('voiceWidgetEnabled', e.target.checked ? '1' : '0')}
        />
        <label htmlFor="voice-enable-widget">Enable floating voice widget across pages</label>
      </div>
    </div>
  )
}



