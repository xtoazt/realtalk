"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Calendar } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface SearchResult {
  id: string
  content: string
  sender_id: string
  username: string
  name_color?: string
  has_gold_animation?: boolean
  custom_title?: string
  created_at: string
  chat_id?: string
  chat_name?: string
  chat_type: "group" | "dm"
  other_username?: string
}

interface MessageSearchProps {
  currentUserId: string
  onSelectMessage?: (chatId: string, messageId: string) => void
}

export function MessageSearch({ currentUserId, onSelectMessage }: MessageSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const searchMessages = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/messages/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.messages)
        setHasSearched(true)
      }
    } catch (error) {
      console.error("Failed to search messages:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchMessages(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, searchMessages])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    }
  }

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text

    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  const getChatDisplayName = (result: SearchResult) => {
    if (result.chat_type === "dm") {
      return result.other_username || "Direct Message"
    }
    return result.chat_name || "Group Chat"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6" />
          Search Messages
        </h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search messages..."
          className="pl-10"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Searching messages...</p>
          </div>
        </div>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No messages found</h3>
            <p className="text-gray-500 text-center">Try searching with different keywords or check your spelling</p>
          </CardContent>
        </Card>
      )}

      {!loading && !hasSearched && !searchTerm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Search Messages</h3>
            <p className="text-gray-500 text-center">Enter keywords to search through your chat history</p>
          </CardContent>
        </Card>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Found {results.length} message{results.length !== 1 ? "s" : ""}
            </span>
          </div>

          {results.map((result) => (
            <Card
              key={result.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => onSelectMessage?.(result.chat_id || "", result.id)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={getUsernameClassName(false, result.has_gold_animation, !!result.name_color)}
                        style={
                          shouldApplyCustomColor(result.has_gold_animation, false)
                            ? getUsernameColorStyle(result.name_color)
                            : {}
                        }
                      >
                        {result.username}
                      </span>
                      {result.custom_title && (
                        <span className="text-xs text-gray-500 italic">{result.custom_title}</span>
                      )}
                      <span className="text-xs text-gray-400">in</span>
                      <Badge variant="outline" className="text-xs">
                        {getChatDisplayName(result)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>{formatTime(result.created_at)}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {highlightSearchTerm(result.content, searchTerm)}
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
