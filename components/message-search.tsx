"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Calendar, Users, Loader2 } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface SearchResult {
  id: string
  content: string
  sender_id: string
  username: string
  name_color?: string
  has_gold_animation: boolean
  chat_type: string
  chat_id?: string
  created_at: string
  context_before?: string
  context_after?: string
}

export function MessageSearch() {
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch()
      } else {
        setSearchResults([])
        setHasSearched(false)
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  const performSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/messages/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.messages || [])
      } else {
        console.error("Failed to search messages")
        setSearchResults([])
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffInDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    }
  }

  const getChatTypeIcon = (chatType: string) => {
    switch (chatType) {
      case "global":
        return <MessageCircle className="h-4 w-4" />
      case "group":
        return <Users className="h-4 w-4" />
      case "dm":
        return <MessageCircle className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  const getChatTypeBadge = (chatType: string) => {
    switch (chatType) {
      case "global":
        return <Badge variant="default">Global</Badge>
      case "group":
        return <Badge variant="secondary">Group</Badge>
      case "dm":
        return <Badge variant="outline">DM</Badge>
      default:
        return <Badge variant="outline">{chatType}</Badge>
    }
  }

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
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
            <Search className="h-5 w-5" />
            Message Search
          </CardTitle>
          <CardDescription>Search through all your messages and conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="pl-10"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results {searchResults.length > 0 && `(${searchResults.length})`}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getChatTypeIcon(result.chat_type)}
                        <span
                          className={getUsernameClassName(false, result.has_gold_animation, !!result.name_color)}
                          style={
                            shouldApplyCustomColor(result.has_gold_animation, false)
                              ? getUsernameColorStyle(result.name_color)
                              : {}
                          }
                        >
                          @{result.username}
                        </span>
                        {getChatTypeBadge(result.chat_type)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {formatDate(result.created_at)}
                      </div>
                    </div>

                    <div className="text-sm">
                      {result.context_before && <span className="text-gray-500">...{result.context_before}</span>}
                      <span className="font-medium">{highlightSearchTerm(result.content, searchQuery)}</span>
                      {result.context_after && <span className="text-gray-500">{result.context_after}...</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No messages found</p>
                <p className="text-sm text-gray-400">Try different search terms</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
