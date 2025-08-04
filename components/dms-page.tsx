"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Search, Users, Loader2 } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface DMUser {
  friend_id: string
  friend_username: string
  friend_name_color?: string
  friend_has_gold: boolean
  last_message_at: string
}

interface SearchUser {
  id: string
  username: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
}

interface DMsPageProps {
  onSelectDM?: (userId: string, username: string) => void
}

export function DMsPage({ onSelectDM }: DMsPageProps) {
  const { user } = useUser()
  const [dms, setDMs] = useState<DMUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDMs()
    }
  }, [user])

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const fetchDMs = async () => {
    try {
      const response = await fetch("/api/dms", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setDMs(data.dms || [])
      } else {
        console.error("Failed to fetch DMs")
      }
    } catch (error) {
      console.error("DMs fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users || [])
      } else {
        console.error("Failed to search users")
        setSearchResults([])
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const startDM = (userId: string, username: string) => {
    onSelectDM?.(userId, username)
    setSearchQuery("")
    setSearchResults([])
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Direct Messages
          </CardTitle>
          <CardDescription>Start a conversation with your friends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users to start a DM..."
              className="pl-10"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="mb-4 max-h-48 overflow-y-auto border rounded-md">
              {searchResults.map((searchUser) => (
                <Button
                  key={searchUser.id}
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => startDM(searchUser.id, searchUser.username)}
                >
                  <Users className="h-4 w-4 mr-3 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div
                      className={getUsernameClassName(false, searchUser.has_gold_animation, !!searchUser.name_color)}
                      style={
                        shouldApplyCustomColor(searchUser.has_gold_animation, false)
                          ? getUsernameColorStyle(searchUser.name_color)
                          : {}
                      }
                    >
                      @{searchUser.username}
                    </div>
                    {searchUser.custom_title && (
                      <div className="text-xs text-gray-500 italic">{searchUser.custom_title}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : dms.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dms.map((dm) => (
                <Button
                  key={dm.friend_id}
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => startDM(dm.friend_id, dm.friend_username)}
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 flex-shrink-0" />
                    <span
                      className={getUsernameClassName(false, dm.friend_has_gold, !!dm.friend_name_color)}
                      style={
                        shouldApplyCustomColor(dm.friend_has_gold, false)
                          ? getUsernameColorStyle(dm.friend_name_color)
                          : {}
                      }
                    >
                      @{dm.friend_username}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(dm.last_message_at)}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No direct messages yet</p>
            <p className="text-sm text-gray-400">Search for users above to start a conversation</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
