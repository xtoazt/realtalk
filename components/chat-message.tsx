"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Reply, Smile } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, formatTime } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface User {
  id: string
  username: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  profile_picture?: string
}

interface Message {
  id: string
  content: string
  user_id: string
  group_chat_id?: string
  dm_id?: string
  created_at: string
  parent_message_id?: string
  reactions?: Array<{
    id: string
    emoji: string
    user_id: string
    username: string
  }>
  user?: User
}

interface ChatMessageProps {
  message: Message
  currentUserId?: string
  onDelete?: (messageId: string) => void
  onReply?: (message: Message) => void
  onReact?: (messageId: string, emoji: string) => void
}

export function ChatMessage({ message, currentUserId, onDelete, onReply, onReact }: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false)
  const isOwnMessage = currentUserId === message.user_id
  const messageTime = new Date(message.created_at)

  const handleReaction = (emoji: string) => {
    if (onReact) {
      onReact(message.id, emoji)
    }
  }

  const handleDelete = () => {
    if (onDelete && isOwnMessage) {
      onDelete(message.id)
    }
  }

  const handleReply = () => {
    if (onReply) {
      onReply(message)
    }
  }

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce(
    (acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = []
      }
      acc[reaction.emoji].push(reaction)
      return acc
    },
    {} as Record<string, typeof message.reactions>,
  )

  return (
    <Card
      className={`p-4 transition-all duration-200 ${
        isOwnMessage ? "bg-blue-600/20 border-blue-500/30 ml-8" : "bg-gray-800/50 border-gray-700/50 mr-8"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={getUsernameClassName(message.user)} style={getUsernameColorStyle(message.user)}>
              {message.user?.username || "Unknown User"}
            </span>
            {message.user?.custom_title && (
              <Badge variant="secondary" className="text-xs">
                {message.user.custom_title}
              </Badge>
            )}
            <span className="text-xs text-gray-400">{formatTime(messageTime)}</span>
          </div>

          <div className="text-gray-100 whitespace-pre-wrap break-words">{message.content}</div>

          {/* Reactions */}
          {groupedReactions && Object.keys(groupedReactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(groupedReactions).map(([emoji, reactions]) => (
                <Button
                  key={emoji}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs bg-gray-700/50 border-gray-600 hover:bg-gray-600/50"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji} {reactions.length}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Message Actions */}
        {showActions && (
          <div className="flex items-center gap-1 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Smile className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem onClick={() => handleReaction("❤️")}>❤️ Heart</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReaction("👍")}>👍 Thumbs Up</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReaction("😂")}>😂 Laugh</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReaction("😮")}>😮 Wow</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReaction("😢")}>😢 Sad</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleReply}>
              <Reply className="h-4 w-4" />
            </Button>

            {isOwnMessage && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

// Named export for compatibility

// Default export
export default ChatMessage
