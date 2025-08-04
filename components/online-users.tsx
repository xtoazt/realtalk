"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, MessageCircle, Wifi } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface OnlineUser {
  id: string
  username: string
  name_color?: string
  has_gold_animation?: boolean
  custom_title?: string
  last_active: string
}

interface OnlineUsersProps {
  currentUserId: string
  onStartDM?: (userId: string, username: string) => void
}

export function OnlineUsers({ currentUserId, onStartDM }: OnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users/online")
      if (response.ok) {
        const data = await response.json()
        setOnlineUsers(data.users.filter((user: OnlineUser) => user.id !== currentUserId))
      }
    } catch (error) {
      console.error("Failed to fetch online users:", error)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    fetchOnlineUsers()
    // Refresh every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000)
    return () => clearInterval(interval)
  }, [fetchOnlineUsers])

  const getActivityStatus = (lastActive: string) => {
    const now = new Date()
    const lastActiveDate = new Date(lastActive)
    const diffInMinutes = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60)

    if (diffInMinutes < 5) return { status: "online", color: "bg-green-500" }
    if (diffInMinutes < 15) return { status: "away", color: "bg-yellow-500" }
    return { status: "offline", color: "bg-gray-500" }
  }

  if (loading) {
    return (
      <Card className="glass-effect animate-fadeIn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Online Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-effect animate-fadeIn">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Online Users
          <Badge variant="secondary">{onlineUsers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {onlineUsers.length === 0 ? (
          <div className="text-center py-4">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No other users online</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {onlineUsers.map((user) => {
              const activity = getActivityStatus(user.last_active)
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 ${activity.color} rounded-full border-2 border-white dark:border-gray-800`}
                        title={activity.status}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={getUsernameClassName(false, user.has_gold_animation, !!user.name_color)}
                          style={
                            shouldApplyCustomColor(user.has_gold_animation, false)
                              ? getUsernameColorStyle(user.name_color)
                              : {}
                          }
                        >
                          {user.username}
                        </span>
                        {user.custom_title && (
                          <span className="text-xs text-gray-500 italic truncate">{user.custom_title}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 capitalize">{activity.status}</p>
                    </div>
                  </div>
                  {onStartDM && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover-lift"
                      onClick={() => onStartDM(user.id, user.username)}
                      title={`Message ${user.username}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
