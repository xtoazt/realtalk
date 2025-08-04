"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, MessageCircle, Loader2 } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface OnlineUser {
  id: string
  username: string
  name_color?: string
  has_gold_animation: boolean
  last_active: string
}

interface OnlineUsersProps {
  onStartDM?: (userId: string, username: string) => void
}

export function OnlineUsers({ onStartDM }: OnlineUsersProps) {
  const { user } = useUser()
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOnlineUsers()
      const interval = setInterval(fetchOnlineUsers, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch("/api/users/online", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setOnlineUsers(data.users || [])
      } else {
        console.error("Failed to fetch online users")
      }
    } catch (error) {
      console.error("Online users fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const startDM = (userId: string, username: string) => {
    onStartDM?.(userId, username)
  }

  const getActivityStatus = (lastActive: string) => {
    const now = new Date()
    const lastActiveDate = new Date(lastActive)
    const diffInMinutes = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60)

    if (diffInMinutes < 5) {
      return { status: "online", color: "bg-green-500" }
    } else if (diffInMinutes < 10) {
      return { status: "away", color: "bg-yellow-500" }
    } else {
      return { status: "offline", color: "bg-gray-400" }
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Online Friends ({onlineUsers.length})
        </CardTitle>
        <CardDescription>Friends who have been active recently</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : onlineUsers.length > 0 ? (
          <div className="space-y-2">
            {onlineUsers.map((onlineUser) => {
              const activity = getActivityStatus(onlineUser.last_active)
              return (
                <div
                  key={onlineUser.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${activity.color}`} />
                    </div>
                    <div>
                      <div
                        className={getUsernameClassName(false, onlineUser.has_gold_animation, !!onlineUser.name_color)}
                        style={
                          shouldApplyCustomColor(onlineUser.has_gold_animation, false)
                            ? getUsernameColorStyle(onlineUser.name_color)
                            : {}
                        }
                      >
                        @{onlineUser.username}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => startDM(onlineUser.id, onlineUser.username)}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No friends online right now</p>
            <p className="text-sm">Friends who have been active in the last 10 minutes will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
