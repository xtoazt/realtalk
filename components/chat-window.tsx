"use client"

import { useState, useEffect, useRef } from "react"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { useUser } from "@/hooks/use-user"

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

interface ChatWindowProps {
  chatType: "global" | "group" | "dm"
  chatId?: string
  chatName: string
  currentUserId: string
}

export function ChatWindow({ chatType, chatId, chatName, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useUser()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [chatType, chatId])

  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams({ chatType })
      if (chatId) params.append("chatId", chatId)

      const response = await fetch(`/api/messages?${params}`)
      const data = await response.json()

      if (response.ok) {
        const newMessages = data.messages.filter(
          (newMessage: Message) => !messages.some((existingMessage) => existingMessage.id === newMessage.id),
        )

        setMessages(data.messages)

        // Enhanced notification support for ChromeOS and other platforms
        if (user && user.notifications_enabled && newMessages.length > 0) {
          newMessages.forEach((newMessage: Message) => {
            if (newMessage.sender_id !== currentUserId) {
              const notificationTitle =
                newMessage.chat_type === "dm"
                  ? `New DM from ${newMessage.username}`
                  : newMessage.chat_type === "group"
                    ? `New message in ${chatName}`
                    : `New global message from ${newMessage.username}`

              // Check if notifications are supported and permission is granted
              if ("Notification" in window && Notification.permission === "granted") {
                try {
                  const notification = new Notification(notificationTitle, {
                    body:
                      newMessage.content.length > 100
                        ? newMessage.content.substring(0, 100) + "..."
                        : newMessage.content,
                    icon: "/favicon.ico",
                    tag: `${newMessage.chat_type}-${newMessage.chat_id || "global"}`,
                    badge: "/favicon.ico", // For ChromeOS
                    requireInteraction: false, // Don't require user interaction to dismiss
                    silent: false, // Allow sound
                  })

                  // Auto-close notification after 5 seconds
                  setTimeout(() => {
                    notification.close()
                  }, 5000)

                  // Handle notification click
                  notification.onclick = () => {
                    window.focus()
                    notification.close()
                  }
                } catch (error) {
                  console.warn("Failed to show notification:", error)
                }
              }
            }
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    setSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, chatType, chatId }),
      })

      if (response.ok) {
        setTimeout(fetchMessages, 500)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-card rounded-lg shadow-md overflow-hidden border">
      <div className="border-b p-4 bg-card">
        <h2 className="font-medium text-card-foreground">{chatName}</h2>
        <p className="text-sm text-muted-foreground">
          {chatType === "global"
            ? "Global chat • Everyone can see your messages"
            : chatType === "group"
              ? "Group chat"
              : "Direct message"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-background">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} currentUserId={currentUserId} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-card border-t">
        <ChatInput onSendMessage={handleSendMessage} placeholder={`Message ${chatName}...`} disabled={sending} />
      </div>
    </div>
  )
}
