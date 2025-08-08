"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, RefreshCw } from "lucide-react"
import { DirectCallButton } from "@/components/voice/DirectCallButton"

interface DM {
  friend_id: string
  friend_username: string
  friend_name_color?: string
  friend_has_gold?: boolean
  last_message_at: string
}

interface DMsPageProps {
  currentUserId: string
  onSelectDM: (friendId: string, friendUsername: string) => void
}

export function DMsPage({ currentUserId, onSelectDM }: DMsPageProps) {
  const [dms, setDMs] = useState<DM[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  const fetchDMs = useCallback(async () => {
    try {
      const response = await fetch("/api/dms")
      if (response.ok) {
        const data = await response.json()
        setDMs(data.dms)
        setLastUpdate(Date.now())
      }
    } catch (error) {
      console.error("Failed to fetch DMs:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDMs()
    // More frequent polling for real-time DM updates
    const interval = setInterval(fetchDMs, 2000)
    return () => clearInterval(interval)
  }, [fetchDMs])

  const getUsernameStyle = (nameColor?: string, hasGold?: boolean) => {
    if (hasGold) {
      return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse font-medium"
    }
    return nameColor ? { color: nameColor } : {}
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground animate-pulse">Loading DMs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Real-time status indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Direct Messages</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
        </div>
      </div>

      <Card className="animate-fadeIn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Direct Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dms.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">No direct messages yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start a conversation with a friend!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dms.map((dm) => (
                <div
                  key={dm.friend_id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-all duration-200 hover:scale-102 animate-slideIn"
                >
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectDM(dm.friend_id, dm.friend_username)}>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {dm.friend_username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span
                        className={dm.friend_has_gold ? getUsernameStyle(undefined, true) : ""}
                        style={!dm.friend_has_gold ? getUsernameStyle(dm.friend_name_color) : {}}
                      >
                        @{dm.friend_username}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        Last message: {formatTime(dm.last_message_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DirectCallButton calleeUserId={dm.friend_id} currentUserId={currentUserId} />
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
