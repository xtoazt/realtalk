"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X, MessageCircle } from "lucide-react"
import { cn, getUsernameColorStyle, getUsernameGoldClass } from "@/lib/utils"

interface SearchResult {
  id: string
  content: string
  username: string
  name_color?: string
  has_gold_animation?: boolean
  created_at: string
  chat_type: string
  chat_id?: string
  message_type?: string
}

interface MessageSearchProps {
  onClose: () => void
  onMessageClick?: (chatType: string, chatId?: string) => void
}

export function MessageSearch({ onClose, onMessageClick }: MessageSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchMessages()
      } else {
        setResults([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query])

  const searchMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/messages/search?q=${encodeURIComponent(query.trim())}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.messages || [])
      }
    } catch (error) {
      console.error("Failed to search messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getChatDisplayName = (result: SearchResult) => {
    if (result.chat_type === "global") return "Global Chat"
    if (result.chat_type === "dm") return "Direct Message"
    return "Group Chat"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Messages
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
              className="flex-1"
              autoFocus
            />
            {loading && (
              <div className="flex items-center px-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {query.trim().length < 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Type at least 2 characters to search</p>
              </div>
            ) : results.length === 0 && !loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages found for "{query}"</p>
              </div>
            ) : (
              results.map((result) => (
                <div
                  key={result.id}
                  className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => {
                    onMessageClick?.(result.chat_type, result.chat_id)
                    onClose()
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn("text-sm font-medium", getUsernameGoldClass(result.has_gold_animation))}
                      style={getUsernameColorStyle(result.name_color)}
                    >
                      @{result.username}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{getChatDisplayName(result)}</span>
                      <span>•</span>
                      <span>{formatTime(result.created_at)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {result.message_type === "image" ? "📷 Shared an image" : result.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
