"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Smile } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (content: string) => void
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({ onSendMessage, placeholder = "Type a message...", disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t bg-white">
      <Button type="button" variant="ghost" size="sm" className="shrink-0">
        <Paperclip className="h-4 w-4" />
      </Button>

      <div className="flex-1 relative">
        <Input
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
    </form>
  )
}
