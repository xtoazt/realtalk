"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Smile, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // Import Popover

interface ChatInputProps {
  onSendMessage: (content: string, parentMessageId?: string, messageType?: string) => void // Updated signature
  placeholder?: string
  disabled?: boolean
  replyToMessage?: { id: string; content: string; username: string }
  onClearReply?: () => void
}

const emojiList = ["😀", "😂", "😊", "😍", "🤩", "🥳", "👍", "👎", "❤️", "💔", "🔥", "💯", "🤔", "🤯", "😢", "😡"]

export function ChatInput({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
  replyToMessage,
  onClearReply,
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (replyToMessage && inputRef.current) {
      inputRef.current.focus()
    }
  }, [replyToMessage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), replyToMessage?.id, "text") // Default to text type
      setMessage("")
      onClearReply?.()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const response = await fetch(`/api/upload-image?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      })

      if (response.ok) {
        const blob = await response.json()
        onSendMessage(blob.url, replyToMessage?.id, "image") // Send image URL as content
        onClearReply?.()
      } else {
        const errorData = await response.json()
        console.error("Image upload failed:", errorData.error || response.statusText)
        alert(`Failed to upload image: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Image upload error:", error)
      alert("An unexpected error occurred during image upload.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // Clear file input
      }
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    inputRef.current?.focus() // Keep focus on input after selecting emoji
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
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></span>
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            className="pr-10 border-gray-200 focus:border-gray-400 transition-colors"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                disabled={disabled || isUploading}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 grid grid-cols-6 gap-1">
              {emojiList.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-lg"
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        <Button
          type="submit"
          disabled={!message.trim() || disabled || isUploading}
          size="sm"
          className="shrink-0 bg-black hover:bg-gray-800 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
