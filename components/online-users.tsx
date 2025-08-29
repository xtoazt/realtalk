"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wifi } from "lucide-react"

interface OnlineUser {
  id: string
  username: string
  name_color?: string
  has_gold_animation?: boolean
  last_active: string
}

interface OnlineUsersProps {
  currentUserId: string
}

export function OnlineUsers({ currentUserId }: OnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOnlineUsers = useCallback(async () => {
    try {
      // The API route now handles filtering by friends based on currentUserId
      const response = await fetch("/api/users/online")
      if (response.ok) {
        const data = await response.json()
        setOnlineUsers(data.onlineUsers) // Data already filtered by friends on server
      }
    } catch (error) {
      console.error("Failed to fetch online users:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateActivity = useCallback(async () => {
    try {
      await fetch("/api/user/activity", { method: "POST" })
    } catch (error) {
      console.error("Failed to update activity:", error)
    }
  }, [])

  useEffect(() => {
    fetchOnlineUsers()
    updateActivity()

    // Update activity every 2 minutes
    const activityInterval = setInterval(updateActivity, 2 * 60 * 1000)

    // Fetch online users every 30 seconds
    const fetchInterval = setInterval(fetchOnlineUsers, 30 * 1000)

    return () => {
      clearInterval(activityInterval)
      clearInterval(fetchInterval)
    }
  }, [fetchOnlineUsers, updateActivity])

  const getUsernameClass = (nameColor?: string, hasGold?: boolean): string => {
    if (hasGold) {
      return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse font-medium"
    }
    return ""
  }

  const getUsernameStyle = (nameColor?: string): React.CSSProperties => {
    return nameColor ? { color: nameColor } : {}
  }

  if (loading) {
    return (
      <>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            Online Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4 text-xs text-muted-foreground">Loading...</div>
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Wifi className="h-4 w-4 text-green-500" />
          Online ({onlineUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {onlineUsers.length === 0 ? (
          <div className="text-center py-4">
            <Users className="h-6 w-6 mx-auto mb-2 opacity-30 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No friends online</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Add friends to see them here</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/30 transition-colors"
              >
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span
                  className={user.has_gold_animation ? getUsernameClass(undefined, true) : "text-xs"}
                  style={!user.has_gold_animation ? getUsernameStyle(user.name_color) : {}}
                >
                  @{user.username}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </>
  )
}
