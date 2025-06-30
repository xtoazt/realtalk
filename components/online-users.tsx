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

  const getUsernameStyle = (nameColor?: string, hasGold?: boolean) => {
    if (hasGold) {
      return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse font-medium"
    }
    return nameColor ? { color: nameColor } : {}
  }

  if (loading) {
    return (
      <Card className="animate-fadeIn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Online Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fadeIn">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-green-500" />
          Online Friends ({onlineUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {onlineUsers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No online friends</p>
            <p className="text-sm mt-1">Add some friends to see them here!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span
                  className={user.has_gold_animation ? getUsernameStyle(undefined, true) : "text-sm"}
                  style={!user.has_gold_animation ? getUsernameStyle(user.name_color) : {}}
                >
                  @{user.username}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
