"use client"

import { useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import { Button } from "@/components/ui/button"

interface IncomingCallHandlerProps {
  currentUserId: string
  signalingUrl?: string
}

export function IncomingCallHandler({ currentUserId, signalingUrl = process.env.NEXT_PUBLIC_VOICE_URL || "" }: IncomingCallHandlerProps) {
  const [incomingFrom, setIncomingFrom] = useState<string | null>(null)
  const socketRef = useRef<any>(null)

  useEffect(() => {
    if (!signalingUrl) return
    const socket = io(signalingUrl, { transports: ["websocket"] })
    socketRef.current = socket
    socket.emit("join-room", { roomId: `presence:${currentUserId}`, userId: currentUserId })
    socket.on("incoming-call", ({ fromUserId }) => {
      setIncomingFrom(fromUserId)
    })
    return () => socket.disconnect()
  }, [currentUserId, signalingUrl])

  const accept = () => {
    if (!incomingFrom || !socketRef.current) return
    socketRef.current.emit("call-accept", { to: incomingFrom })
    setIncomingFrom(null)
  }

  const decline = () => {
    if (!incomingFrom || !socketRef.current) return
    socketRef.current.emit("call-decline", { to: incomingFrom })
    setIncomingFrom(null)
  }

  if (!incomingFrom) return null
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border shadow-lg rounded-lg p-4 flex items-center gap-3">
      <div className="text-sm">Incoming call from @{incomingFrom}</div>
      <Button size="sm" onClick={accept} className="bg-green-600 hover:bg-green-700">Accept</Button>
      <Button size="sm" variant="destructive" onClick={decline}>Decline</Button>
    </div>
  )
}


