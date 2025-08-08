"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Phone, PhoneOff } from "lucide-react"

interface DirectCallButtonProps {
  calleeUserId: string
  currentUserId: string
  signalingUrl?: string
}

export function DirectCallButton({ calleeUserId, currentUserId, signalingUrl = process.env.NEXT_PUBLIC_VOICE_URL || "" }: DirectCallButtonProps) {
  const [calling, setCalling] = useState(false)
  const [inCall, setInCall] = useState(false)
  const [ringing, setRinging] = useState(false)
  const socketRef = useRef<any>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    remoteAudioRef.current = new Audio()
    remoteAudioRef.current.autoplay = true
  }, [])

  const cleanup = useCallback(() => {
    pcRef.current?.close()
    pcRef.current = null
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    socketRef.current?.disconnect?.()
    setCalling(false)
    setInCall(false)
    setRinging(false)
  }, [])

  const ensureSocket = () => {
    if (!socketRef.current) {
      socketRef.current = io(signalingUrl, { transports: ["websocket"] })
      socketRef.current.on("disconnect", cleanup)
    }
    return socketRef.current
  }

  const createPc = async () => {
    if (pcRef.current) return pcRef.current
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] })
    pc.onicecandidate = (ev) => {
      if (ev.candidate) ensureSocket().emit("signal-ice-candidate", { to: calleeUserId, candidate: ev.candidate, direct: true })
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

  const startCall = async () => {
    if (!signalingUrl) return alert("Voice server not configured")
    setCalling(true)
    const socket = ensureSocket()

    // Identify ourselves for direct calls
    socket.emit("join-room", { roomId: `dm:${[currentUserId, calleeUserId].sort().join(":")}`, userId: currentUserId })

    // Ask callee to accept/decline first
    socket.emit("call-invite", { to: calleeUserId })

    const onDecline = ({ fromUserId }: { fromUserId: string }) => {
      if (fromUserId !== calleeUserId) return
      cleanup()
      alert("Call declined")
    }
    const onAccept = async ({ fromUserId }: { fromUserId: string }) => {
      if (fromUserId !== calleeUserId) return
      // Proceed to create and send offer
      const pc = await createPc()
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      setRinging(true)
      socket.emit("signal-offer", { to: calleeUserId, description: pc.localDescription, direct: true })
      socket.off("call-accept", onAccept)
      socket.off("call-decline", onDecline)
    }
    socket.on("call-decline", onDecline)
    socket.on("call-accept", onAccept)

    socket.on("signal-offer", async ({ from, description, direct }) => {
      if (!direct) return
      const pc = await createPc()
      await pc.setRemoteDescription(description)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit("signal-answer", { to: from, description: pc.localDescription, direct: true })
      setInCall(true)
      setRinging(false)
      setCalling(false)
    })

    socket.on("signal-answer", async ({ from, description, direct }) => {
      if (!direct) return
      const pc = await createPc()
      await pc.setRemoteDescription(description)
      setInCall(true)
      setCalling(false)
    })

    socket.on("signal-ice-candidate", async ({ from, candidate, direct }) => {
      if (!direct) return
      try {
        const pc = await createPc()
        await pc.addIceCandidate(candidate)
      } catch {}
    })

    // Create and send offer
    const pc = await createPc()
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    setRinging(true)
    socket.emit("signal-offer", { to: calleeUserId, description: pc.localDescription, direct: true })
  }

  const endCall = () => cleanup()

  if (inCall || calling || ringing) {
    return (
      <Button onClick={endCall} variant="destructive" size="icon">
        <PhoneOff className="h-4 w-4 mr-1" /> End Call
      </Button>
    )
  }

  return (
    <Button onClick={startCall} size="icon" title="Call">
      <Phone className="h-4 w-4" />
    </Button>
  )
}


