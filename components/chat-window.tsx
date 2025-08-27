"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChatMessage } from "./chat-message"
import { SmartMessage } from "./smart-message"
import { ChatInput } from "./chat-input"
import { SmartChatInput } from "./smart-chat-input"
import { SmartAIAssistant } from "./smart-ai-assistant"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { ChevronDown, Brain, Sparkles } from 'lucide-react'
import { notificationService } from "@/lib/notification-service"

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
  parent_message_id?: string
  parent_message_content?: string
  parent_message_username?: string
  message_type?: string
  reactions?: { emoji: string; count: number; reacted_by_me: boolean }[]
}

interface ChatWindowProps {
  chatType: "global" | "group" | "dm" | "channel"
  chatId?: string
  chatName: string
  currentUserId: string
  onUserClick?: (userId: string) => void
}

export function ChatWindow({ chatType, chatId, chatName, currentUserId, onUserClick }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [showSmartFeatures, setShowSmartFeatures] = useState(true)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<Message[]>([])
  const { user } = useUser()

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    setShowScrollButton(false)
    setHasNewMessages(false)
  }

  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    setShowScrollButton(!isNearBottom)
    if (isNearBottom) {
      setHasNewMessages(false)
    }
  }

  const fetchMessages = useCallback(async () => {
    try {
      const params = new URLSearchParams({ chatType })
      if (chatId) params.append("chatId", chatId)

      const response = await fetch(`/api/messages?${params}`)

      if (!response.ok) {
        console.error("Failed to fetch messages:", response.status, await response.text())
        return
      }

      const data = await response.json()

      if (data.messages) {
        const currentMessageIds = new Set(messagesRef.current.map((m) => m.id))
        const newMessagesForNotification = data.messages.filter(
          (newMessage: Message) => !currentMessageIds.has(newMessage.id),
        )

        setMessages(data.messages)

        if (newMessagesForNotification.length > 0 && showScrollButton) {
          setHasNewMessages(true)
        }

        // Show notifications for new messages using the notification service
        if (user && user.notifications_enabled && newMessagesForNotification.length > 0) {
          newMessagesForNotification.forEach((newMessage: Message) => {
            if (newMessage.sender_id !== currentUserId) {
              notificationService.showMessageNotification(
                {
                  content: newMessage.content,
                  username: newMessage.username,
                  chatType: newMessage.chat_type,
                  chatName: chatName,
                  chatId: newMessage.chat_id,
                  messageType: newMessage.message_type,
                  id: newMessage.id
                },
                (chatType, chatId, chatName) => {
                  // Navigate to the specific chat if needed
                  if (chatType !== chatType || (chatId && chatId !== chatId)) {
                    window.dispatchEvent(new CustomEvent('navigateToChat', {
                      detail: {
                        type: chatType,
                        id: chatId,
                        name: chatName
                      }
                    }))
                  }
                }
              )
            }
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoading(false)
    }
  }, [chatType, chatId, user, currentUserId, chatName, showScrollButton])

  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [loading])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [chatType, chatId, fetchMessages])

  const handleSendMessage = async (content: string, parentMessageId?: string, messageType = "text") => {
    setSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, chatType, chatId, parentMessageId, messageType }),
      })

      if (response.ok) {
        const wasNearBottom = messagesContainerRef.current
          ? messagesContainerRef.current.scrollHeight -
              messagesContainerRef.current.scrollTop -
              messagesContainerRef.current.clientHeight <
            100
          : true

        await fetchMessages()

        if (wasNearBottom) {
          setTimeout(() => {
            scrollToBottom()
          }, 100)
        }
      } else {
        console.error("Failed to send message:", response.status, await response.text())
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      })
      if (response.ok) {
        fetchMessages()
      } else {
        console.error("Failed to add reaction:", response.status, await response.text())
      }
    } catch (error) {
      console.error("Failed to add reaction:", error)
    }
  }

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      })
      if (response.ok) {
        fetchMessages()
      } else {
        console.error("Failed to remove reaction:", response.status, await response.text())
      }
    } catch (error) {
      console.error("Failed to remove reaction:", error)
    }
  }

  const handleReply = (messageToReply: Message) => {
    setReplyToMessage(messageToReply)
  }

  const handleClearReply = () => {
    setReplyToMessage(null)
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/delete`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchMessages()
      } else {
        const errorData = await response.json()
        console.error("Failed to delete message:", errorData.error)
        alert(`Failed to delete message: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
      alert("An error occurred while deleting the message")
    }
  }

  const handleImageUpload = async (file: File) => {
    if (sending) return

    setSending(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        await handleSendMessage(`[Image: ${data.url}]`, undefined, "image")
      } else {
        console.error("Failed to upload image:", response.status)
      }
    } catch (error) {
      console.error("Error uploading image:", error)
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
    <div className="flex-1 flex flex-col h-full bg-card rounded-lg shadow-md overflow-hidden border relative">
      <div className="border-b p-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-card-foreground flex items-center gap-2">
              {chatName}
              {showSmartFeatures && (
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs text-primary">AI Enhanced</span>
                </div>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              {chatType === "global"
                ? "Global chat • Everyone can see your messages"
                : chatType === "group"
                  ? "Group chat"
                  : chatType === "channel"
                    ? "Channel"
                    : "Direct message"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSmartFeatures(!showSmartFeatures)}
              className="flex items-center gap-1"
              title={showSmartFeatures ? "Disable smart features" : "Enable smart features"}
            >
              <Brain className="h-4 w-4" />
              <span className="text-xs">Smart</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="flex items-center gap-1"
              title="AI Assistant"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-xs">AI</span>
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 bg-background"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {showAIAssistant && (
              <SmartAIAssistant
                chatType={chatType}
                chatName={chatName}
                currentUser={user?.username || ''}
                messageHistory={messages.map(msg => ({
                  content: msg.content,
                  username: msg.username,
                  timestamp: msg.created_at,
                  isAI: msg.is_ai_response
                }))}
                userPreferences={user}
                onSendMessage={handleSendMessage}
              />
            )}
            
            {messages.map((message) => (
              showSmartFeatures ? (
                <SmartMessage
                  key={message.id}
                  message={message}
                  currentUserId={currentUserId}
                  onUserClick={onUserClick}
                  onReply={handleReply}
                  onReaction={handleAddReaction}
                  showAI={showSmartFeatures}
                />
              ) : (
                <ChatMessage
                  key={message.id}
                  message={message}
                  currentUserId={currentUserId}
                  currentUserHasGold={user?.has_gold_animation || false}
                  onAddReaction={handleAddReaction}
                  onRemoveReaction={handleRemoveReaction}
                  onReply={handleReply}
                  onDelete={handleDeleteMessage}
                  onUserClick={onUserClick}
                />
              )
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <div className="absolute bottom-20 right-4 z-10">
          <Button
            onClick={scrollToBottom}
            className={`rounded-full w-12 h-12 shadow-lg transition-all duration-200 hover:scale-110 ${
              hasNewMessages ? "bg-blue-500 hover:bg-blue-600 animate-pulse" : "bg-gray-600 hover:bg-gray-700"
            }`}
            size="sm"
          >
            <ChevronDown className="h-5 w-5" />
            {hasNewMessages && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </Button>
        </div>
      )}

      <div className="bg-card border-t p-4">
        {replyToMessage && (
          <div className="mb-3 p-2 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">Replying to {replyToMessage.username}:</span>
                <span className="text-muted-foreground ml-2">
                  {replyToMessage.content.length > 50
                    ? replyToMessage.content.substring(0, 50) + "..."
                    : replyToMessage.content}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearReply}>
                ×
              </Button>
            </div>
          </div>
        )}
        
        {showSmartFeatures ? (
          <SmartChatInput
            onSendMessage={handleSendMessage}
            onImageUpload={handleImageUpload}
            chatType={chatType}
            chatName={chatName}
            currentUser={user?.username || ''}
            messageHistory={messages.slice(-5).map(msg => ({
              role: msg.is_ai_response ? 'assistant' : 'user',
              content: msg.content
            }))}
            userPreferences={user}
            disabled={sending}
          />
        ) : (
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={sending}
            placeholder={
              chatType === "global"
                ? "Message everyone..."
                : chatType === "group"
                  ? "Message the group..."
                  : chatType === "channel"
                    ? "Message the channel..."
                    : "Send a message..."
            }
          />
        )}
      </div>
    </div>
  )
}
