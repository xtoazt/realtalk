"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Smile, X } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (content: string, parentMessageId?: string) => void
  placeholder?: string
  disabled?: boolean
  replyToMessage?: { id: string; content: string; username: string } // New prop for replies
  onClearReply?: () => void // New prop to clear reply state
}

export function ChatInput({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
  replyToMessage,
  onClearReply,
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (replyToMessage && inputRef.current) {
      inputRef.current.focus()
    }
  }, [replyToMessage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), replyToMessage?.id)
      setMessage("")
      onClearReply?.() // Clear reply state after sending
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-4 border-t bg-white">
      {replyToMessage && (
        <div className="flex items-center justify-between p-2 mb-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          <div className="flex-1 truncate">
            Replying to <span className="font-semibold">@{replyToMessage.username}</span>: "{replyToMessage.content}"
          </div>
          <Button variant="ghost" size="sm" onClick={onClearReply} className="h-6 w-6 p-0 ml-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" className="shrink-0">
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-10 border-gray-200 focus:border-gray-400 transition-colors"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          size="sm"
          className="shrink-0 bg-black hover:bg-gray-800 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
