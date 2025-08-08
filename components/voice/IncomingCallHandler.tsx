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
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!signalingUrl) return
    const socket = io(signalingUrl, { transports: ["websocket"] })
    socketRef.current = socket
    socket.emit("join-room", { roomId: `presence:${currentUserId}`, userId: currentUserId })
    socket.on("incoming-call", ({ fromUserId }) => {
      setIncomingFrom(fromUserId)
    })
    // Prepare media element for remote audio
    const audio = new Audio()
    audio.autoplay = true
    remoteAudioRef.current = audio

    // Handle direct signaling as callee
    socket.on("signal-offer", async ({ from, description, direct }) => {
      if (!direct || from !== incomingFrom) return
      const pc = await getOrCreatePc()
      await pc.setRemoteDescription(description)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit("signal-answer", { to: from, description: pc.localDescription, direct: true })
    })

    socket.on("signal-ice-candidate", async ({ from, candidate, direct }) => {
      if (!direct) return
      try {
        const pc = await getOrCreatePc()
        await pc.addIceCandidate(candidate)
      } catch {}
    })

    return () => socket.disconnect()
  }, [currentUserId, signalingUrl])

  const getOrCreatePc = async () => {
    if (pcRef.current) return pcRef.current
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] })
    pc.onicecandidate = (ev) => {
      if (ev.candidate && incomingFrom && socketRef.current) {
        socketRef.current.emit("signal-ice-candidate", { to: incomingFrom, candidate: ev.candidate, direct: true })
      }
    }
    pc.ontrack = (ev) => {
      const [stream] = ev.streams
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = stream
    }
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!))
    pcRef.current = pc
    return pc
  }

  const cleanup = () => {
    pcRef.current?.close()
    pcRef.current = null
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
    setIncomingFrom(null)
  }

  const accept = async () => {
    if (!incomingFrom || !socketRef.current) return
    await getOrCreatePc()
    socketRef.current.emit("call-accept", { to: incomingFrom })
  }

  const decline = () => {
    if (!incomingFrom || !socketRef.current) return
    socketRef.current.emit("call-decline", { to: incomingFrom })
    cleanup()
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


