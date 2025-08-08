"use client"

import { useUser } from "@/hooks/use-user"
import { VoiceChat } from "@/components/voice/VoiceChat"

export function VoiceTab() {
  const { user } = useUser()
  if (!user) return null
  // Use a stable room for now (e.g., global); can be extended to per-group/channel
  const roomId = "global-voice"
  return <VoiceChat roomId={roomId} userId={user.id} />
}



