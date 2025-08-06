"use client"

import { useState } from "react"
import { formatTime } from "@/lib/utils"
import { getUsernameClassName, getUsernameColorStyle } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Reply, Heart, MoreHorizontal } from 'lucide-react'
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
  created_at: string
  user: User
  parent_message_id?: string
  parent_message?: {
    id: string
    content: string
    user: User
  }
  reactions?: Array<{
    emoji: string
    count: number
    users: string[]
  }>
}

interface ChatMessageProps {
  message: Message
  currentUserId?: string
  onDelete?: (messageId: string) => void
  onReply?: (message: Message) => void
  onReact?: (messageId: string, emoji: string) => void
}

export function ChatMessage({ message, currentUserId, onDelete, onReply, onReact }: ChatMessageProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return

    if (confirm("Are you sure you want to delete this message?")) {
      setIsDeleting(true)
      try {
        await onDelete(message.id)
      } catch (error) {
        console.error("Failed to delete message:", error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleReply = () => {
    if (onReply) {
      onReply(message)
    }
  }

  const handleReact = (emoji: string) => {
    if (onReact) {
      onReact(message.id, emoji)
    }
  }

  const canDelete = currentUserId === message.user.id

  return (
    <div 
      className="group flex flex-col space-y-1 p-4 hover:bg-muted/50 rounded-lg transition-all duration-200 animate-fadeIn"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Parent message (if replying) */}
      {message.parent_message && (
        <div className="ml-12 pl-4 border-l-2 border-muted-foreground/30 text-sm text-muted-foreground bg-muted/30 rounded-r-lg p-2">
          <div className="flex items-center space-x-2 mb-1">
            <Reply className="h-3 w-3" />
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
              className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border">
              <span className="text-sm font-medium text-primary">
                {message.user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={getUsernameClassName(message.user)} style={getUsernameColorStyle(message.user)}>
              {message.user.username}
            </span>
            
            {message.user.custom_title && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {message.user.custom_title}
              </Badge>
            )}
            
            {message.user.has_gold_animation && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-0.5">
                Gold
              </Badge>
            )}
            
            <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
          </div>
          
          <div className="text-foreground leading-relaxed break-words">{message.content}</div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleReact(reaction.emoji)}
                  className="h-6 px-2 text-xs hover:bg-accent transition-colors"
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`flex-shrink-0 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleReact("❤️")}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              <Heart className="h-4 w-4 text-red-500" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReply} 
              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
            >
              <Reply className="h-4 w-4 text-blue-500" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-accent"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleReact("👍")}>
                  👍 Like
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReact("😂")}>
                  😂 Laugh
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReact("😮")}>
                  😮 Wow
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuItem className="border-t">
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
