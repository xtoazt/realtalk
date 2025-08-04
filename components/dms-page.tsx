"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Search, Plus } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface DirectMessage {
  id: string
  other_user_id: string
  other_username: string
  other_name_color?: string
  other_has_gold_animation?: boolean
  other_custom_title?: string
  last_message?: string
  last_message_at?: string
  unread_count: number
}

interface DMsPageProps {
  currentUserId: string
  onSelectDM: (dmId: string, otherUserId: string, otherUsername: string) => void
  onCreateDM: () => void
}

export function DMsPage({ currentUserId, onSelectDM, onCreateDM }: DMsPageProps) {
  const [dms, setDms] = useState<DirectMessage[]>([])
  const [filteredDMs, setFilteredDMs] = useState<DirectMessage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchDMs = useCallback(async () => {
    try {
      const response = await fetch("/api/dms")
      if (response.ok) {
        const data = await response.json()
        setDms(data.dms)
        setFilteredDMs(data.dms)
      }
    } catch (error) {
      console.error("Failed to fetch DMs:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDMs()
  }, [fetchDMs])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = dms.filter((dm) => dm.other_username.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredDMs(filtered)
    } else {
      setFilteredDMs(dms)
    }
  }, [searchTerm, dms])

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Direct Messages
        </h2>
        <Button onClick={onCreateDM} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New DM
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search conversations..."
          className="pl-10"
        />
      </div>

      {filteredDMs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm ? "No conversations found" : "No direct messages yet"}
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm
                ? "Try searching for a different username"
                : "Start a conversation with someone to see it here"}
            </p>
            {!searchTerm && (
              <Button onClick={onCreateDM}>
                <Plus className="h-4 w-4 mr-2" />
                Start a conversation
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredDMs.map((dm) => (
            <Card
              key={dm.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => onSelectDM(dm.id, dm.other_user_id, dm.other_username)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {dm.other_username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={getUsernameClassName(false, dm.other_has_gold_animation, !!dm.other_name_color)}
                          style={
                            shouldApplyCustomColor(dm.other_has_gold_animation, false)
                              ? getUsernameColorStyle(dm.other_name_color)
                              : {}
                          }
                        >
                          {dm.other_username}
                        </span>
                        {dm.other_custom_title && (
                          <span className="text-xs text-gray-500 italic">{dm.other_custom_title}</span>
                        )}
                      </div>
                      {dm.last_message && <p className="text-sm text-gray-500 truncate mt-1">{dm.last_message}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {dm.last_message_at && (
                      <span className="text-xs text-gray-400">{formatTime(dm.last_message_at)}</span>
                    )}
                    {dm.unread_count > 0 && (
                      <div className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {dm.unread_count > 99 ? "99+" : dm.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
