"use client"

import { useState } from "react"
import { formatTime } from "@/lib/utils"
import { getUsernameClassName, getUsernameColorStyle } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Trash2, Reply } from "lucide-react"

interface User {
  id: string
  username: string
  name_color?: string
  has_gold_animation?: boolean
  profile_picture?: string
}

interface Message {
  id: string
  content: string
  created_at: string
  user: User
  parent_message_id?: string
  parent_message?: {
    id: string
    content: string
    user: User
  }
}

interface ChatMessageProps {
  message: Message
  currentUserId?: string
  onDelete?: (messageId: string) => void
  onReply?: (message: Message) => void
}

export function ChatMessage({ message, currentUserId, onDelete, onReply }: ChatMessageProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return

    setIsDeleting(true)
    try {
      await onDelete(message.id)
    } catch (error) {
      console.error("Failed to delete message:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReply = () => {
    if (onReply) {
      onReply(message)
    }
  }

  const canDelete = currentUserId === message.user.id

  return (
    <div className="group flex flex-col space-y-1 p-3 hover:bg-muted/50 rounded-lg transition-colors">
      {/* Parent message (if replying) */}
      {message.parent_message && (
        <div className="ml-4 pl-3 border-l-2 border-muted-foreground/30 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span
              className={getUsernameClassName(message.parent_message.user)}
              style={getUsernameColorStyle(message.parent_message.user)}
            >
              {message.parent_message.user.username}
            </span>
          </div>
          <p className="truncate max-w-md">{message.parent_message.content}</p>
        </div>
      )}

      {/* Main message */}
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {message.user.profile_picture ? (
            <img
              src={message.user.profile_picture || "/placeholder.svg"}
              alt={message.user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">{message.user.username.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className={getUsernameClassName(message.user)} style={getUsernameColorStyle(message.user)}>
              {message.user.username}
            </span>
            <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
          </div>
          <p className="text-foreground mt-1 break-words">{message.content}</p>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleReply} className="h-8 w-8 p-0">
              <Reply className="h-4 w-4" />
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
