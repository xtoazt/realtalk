"use client"

import { useEffect, useRef, useState } from "react"
import io, { Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, PhoneOff, Users } from "lucide-react"

interface VoiceChatProps {
  roomId: string
  userId: string
  signalingUrl?: string // e.g. http://localhost:4000 or your deployed URL
}

export function VoiceChat({ roomId, userId, signalingUrl = process.env.NEXT_PUBLIC_VOICE_URL || "https://your-voice-server.onrender.com" }: VoiceChatProps) {
  const [connected, setConnected] = useState(false)
  const [muted, setMuted] = useState(false)
  const [peers, setPeers] = useState<{ socketId: string; userId?: string }[]>([])
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())
  const pcMap = useRef<Map<string, RTCPeerConnection>>(new Map())
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    let isMounted = true

    const start = async () => {
      try {
        // Get microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStreamRef.current = stream

        // Connect socket
        const socket = io(signalingUrl, { transports: ["websocket"] })
        socketRef.current = socket

        socket.on("connect", () => setConnected(true))
        socket.on("disconnect", () => setConnected(false))

        // Join room
        socket.emit("join-room", { roomId, userId })

        socket.on("room-peers", (list: { socketId: string; userId?: string }[]) => {
          if (!isMounted) return
          setPeers(list)
          list.forEach(({ socketId }) => createOffer(socketId))
        })

        socket.on("user-joined", ({ socketId, userId: peerUserId }) => {
          if (!isMounted) return
          setPeers((prev) => prev.concat([{ socketId, userId: peerUserId }]))
        })

        socket.on("user-left", ({ socketId }) => {
          if (!isMounted) return
          setPeers((prev) => prev.filter((p) => p.socketId !== socketId))
          const pc = pcMap.current.get(socketId)
          pc?.close()
          pcMap.current.delete(socketId)
          const audio = audioRefs.current.get(socketId)
          if (audio) {
            audio.srcObject = null
            audio.remove()
            audioRefs.current.delete(socketId)
          }
        })

        socket.on("signal-offer", async ({ from, description }) => {
          const pc = await getOrCreatePc(from)
          await pc.setRemoteDescription(description)
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit("signal-answer", { to: from, description: pc.localDescription })
        })

        socket.on("signal-answer", async ({ from, description }) => {
          const pc = await getOrCreatePc(from)
          await pc.setRemoteDescription(description)
        })

        socket.on("signal-ice-candidate", async ({ from, candidate }) => {
          const pc = await getOrCreatePc(from)
          try {
            await pc.addIceCandidate(candidate)
          } catch {}
        })

        const getOrCreatePc = async (peerId: string) => {
          let pc = pcMap.current.get(peerId)
          if (pc) return pc
          pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] })
          pcMap.current.set(peerId, pc)

          // Outgoing tracks
          localStreamRef.current?.getTracks().forEach((track) => pc!.addTrack(track, localStreamRef.current!))

          // Incoming
          pc.ontrack = (ev) => {
            const [stream] = ev.streams
            let audio = audioRefs.current.get(peerId)
            if (!audio) {
              audio = new Audio()
              audio.autoplay = true
              audioRefs.current.set(peerId, audio)
            }
            audio.srcObject = stream
          }

          pc.onicecandidate = (ev) => {
            if (ev.candidate) socket.emit("signal-ice-candidate", { to: peerId, candidate: ev.candidate })
          }

          return pc
        }

        const createOffer = async (peerId: string) => {
          const pc = await getOrCreatePc(peerId)
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          socket.emit("signal-offer", { to: peerId, description: pc.localDescription })
        }
      } catch (e) {
        console.error("voice init error", e)
      }
    }

    start()

    return () => {
      isMounted = false
      const socket = socketRef.current
      try {
        socket?.emit("leave-room")
        socket?.disconnect()
      } catch {}
      pcMap.current.forEach((pc) => pc.close())
      pcMap.current.clear()
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [roomId, userId, signalingUrl])

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m
      localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next))
      return next
    })
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> Voice Room
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Status: {connected ? "Connected" : "Connecting..."} • Peers: {peers.length}
        </div>
        <div className="flex gap-2">
          <Button onClick={toggleMute} variant={muted ? "destructive" : "default"}>
            {muted ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
            {muted ? "Unmute" : "Mute"}
          </Button>
          <Button onClick={() => location.reload()} variant="outline">
            <PhoneOff className="h-4 w-4 mr-1" /> Leave
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


