"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react"
import Image from "next/image"

interface Message {
  id: string
  content: string
  sender_id: string
  username: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  is_ai_response?: boolean
  created_at: string
  mentions?: string[]
  message_type?: string
  reactions?: { emoji: string; count: number; reacted_by_me: boolean }[]
  parent_message_id?: string
  parent_message_content?: string
  parent_message_username?: string
}

interface ChatMessageProps {
  message: Message
  currentUserId: string
  onAddReaction?: (messageId: string, emoji: string) => void
  onRemoveReaction?: (messageId: string, emoji: string) => void
  onReply?: (message: Message) => void
}

export function ChatMessage({ message, currentUserId, onAddReaction, onRemoveReaction, onReply }: ChatMessageProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [imageError, setImageError] = useState(false)
  const isOwnMessage = message.sender_id === currentUserId
  const isAI = message.is_ai_response

  const getUsernameStyle = () => {
    if (isAI) return "text-blue-500 font-medium"
    if (message.has_gold_animation) {
      return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse font-medium"
    }
    if (message.name_color) {
      return `font-medium`
    }
    return "font-medium"
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleReactionClick = (emoji: string) => {
    const existingReaction = message.reactions?.find((r) => r.emoji === emoji && r.reacted_by_me)
    if (existingReaction) {
      onRemoveReaction?.(message.id, emoji)
    } else {
      onAddReaction?.(message.id, emoji)
    }
    setShowReactions(false)
  }

  const availableEmojis = [
    "😀",
    "😂",
    "😊",
    "😍",
    "🤩",
    "🥳",
    "👍",
    "👎",
    "❤️",
    "💔",
    "🔥",
    "💯",
    "🤔",
    "🤯",
    "😢",
    "😡",
  ]

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4 group`}>
      <div className={`max-w-[70%] ${isOwnMessage ? "order-2" : "order-1"}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
          <span
            className={getUsernameStyle()}
            style={message.name_color && !message.has_gold_animation ? { color: message.name_color } : {}}
          >
            {isAI ? "AI Assistant" : message.username}
          </span>
          {message.custom_title && <span className="text-xs italic text-gray-500">{message.custom_title}</span>}
          <span className="text-xs text-gray-400">{formatTime(message.created_at)}</span>
        </div>

        {message.parent_message_id && message.parent_message_content && message.parent_message_username && (
          <div className="mb-1 p-2 bg-gray-100 border-l-4 border-blue-400 rounded-r-md text-xs text-gray-600 italic">
            Replying to @{message.parent_message_username}: "{message.parent_message_content}"
          </div>
        )}

        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage ? "bg-black text-white" : isAI ? "bg-blue-50 border border-blue-200" : "bg-gray-100"
          }`}
        >
          {message.message_type === "image" ? (
            <div className="relative max-w-sm">
              {!imageError ? (
                <Image
                  src={message.content || "/placeholder.svg"}
                  alt="Shared image"
                  width={400}
                  height={300}
                  className="rounded-lg object-cover max-h-80 w-auto"
                  onError={() => setImageError(true)}
                  priority={false}
                  quality={85}
                />
              ) : (
                <div className="w-64 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Failed to load image</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {message.reactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                variant="outline"
                size="sm"
                className={`h-6 px-2 rounded-full text-xs ${
                  reaction.reacted_by_me ? "bg-blue-100 border-blue-400" : "bg-gray-50"
                }`}
                onClick={() => handleReactionClick(reaction.emoji)}
              >
                {reaction.emoji} {reaction.count}
              </Button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setShowReactions(!showReactions)}>
            <Heart className="h-3 w-3" />
          </Button>
          {onReply && (
            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => onReply(message)}>
              <MessageCircle className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <MoreHorizontal className="h-3 w-3" />
          </Button>

          {showReactions && (
            <div className="absolute bottom-full left-0 mb-2 flex gap-1 p-2 bg-white border rounded-lg shadow-lg z-10">
              {availableEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-lg"
                  onClick={() => handleReactionClick(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
