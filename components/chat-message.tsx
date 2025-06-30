"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react"

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
}

interface ChatMessageProps {
  message: Message
  currentUserId: string
}

export function ChatMessage({ message, currentUserId }: ChatMessageProps) {
  const [showReactions, setShowReactions] = useState(false)
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

        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage ? "bg-black text-white" : isAI ? "bg-blue-50 border border-blue-200" : "bg-gray-100"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setShowReactions(!showReactions)}>
            <Heart className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <MessageCircle className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
