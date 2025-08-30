"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { notificationService } from "@/lib/notification-service"
import { AI_USER_ID } from "@/lib/constants"
import { Settings, LogOut } from "lucide-react"

interface Message {
  id: string
  content: string
  username: string
  sender_id: string
  is_ai_response?: boolean
  created_at: string
}

export default function SimplePage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [mode, setMode] = useState<'chat' | 'ai'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<Message[]>([])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }
    
    if (user) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              notificationService.showNotification({
                title: 'Notifications Enabled',
                body: "You'll now receive notifications from real.simple",
                onClick: () => window.focus()
              })
            }
          })
        }
      }
      
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [user, loading, router, mode])

  const fetchMessages = async () => {
    try {
      const chatType = mode === 'ai' ? 'dm' : 'global'
      const chatId = mode === 'ai' ? AI_USER_ID : undefined
      const params = new URLSearchParams({ chatType })
      if (chatId) params.append('chatId', chatId)
      
      const response = await fetch(`/api/messages?${params}`)
      if (response.ok) {
        const data = await response.json()
        const newMessages = data.messages.slice(-20)
        
        if (user && user.notifications_enabled && messagesRef.current.length > 0) {
          const currentMessageIds = new Set(messagesRef.current.map(m => m.id))
          const newMessagesForNotification = newMessages.filter(
            (msg: Message) => !currentMessageIds.has(msg.id) && msg.sender_id !== user.id
          )
          
          newMessagesForNotification.forEach((msg: Message) => {
            const chatName = mode === 'ai' ? 'AI Chat' : 'Global Chat'
            notificationService.showNotification({
              title: `New message in ${chatName}`,
              body: `${msg.username}: ${msg.content}`,
              onClick: () => {
                window.focus()
                if (messagesEndRef.current) {
                  messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
                }
              }
            })
          })
        }
        
        setMessages(newMessages)
        
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return
    
    setSending(true)
    try {
      const chatType = mode === 'ai' ? 'dm' : 'global'
      const chatId = mode === 'ai' ? AI_USER_ID : undefined
      
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: newMessage.trim(), 
          chatType,
          chatId
        }),
      })
      
      if (response.ok) {
        setNewMessage("")
        fetchMessages()
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      router.push("/auth")
    } catch (error) {
      router.push("/auth")
    }
  }

  const switchMode = (mode: string) => {
    localStorage.setItem('ui-mode', mode)
    router.push(`/dashboard${mode === 'full' ? '' : `/${mode}`}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 dark:bg-zinc-50">
        <div className="text-zinc-100 dark:text-zinc-900 text-sm font-medium">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-950 dark:bg-zinc-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/90 dark:bg-white/90 backdrop-blur-xl border-b border-zinc-800 dark:border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <h1 className="text-lg font-semibold text-white dark:text-black">
                  real<span className="text-zinc-400 dark:text-zinc-600">.simple</span>
                </h1>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-sm">
                <span className="text-zinc-300 dark:text-zinc-700 font-medium truncate">@{user.username}</span>
                <span className="px-2 py-1 bg-zinc-800 dark:bg-zinc-200 rounded-md text-xs font-medium text-zinc-300 dark:text-zinc-700 border border-zinc-700 dark:border-zinc-300">
                  {mode === 'chat' ? 'Global' : 'AI'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMode(mode === 'chat' ? 'ai' : 'chat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mode === 'ai' 
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100' 
                    : 'bg-zinc-800 dark:bg-zinc-200 text-zinc-300 dark:text-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-300'
                }`}
                title={mode === 'chat' ? 'Switch to AI' : 'Switch to Chat'}
              >
                {mode === 'chat' ? 'AI' : 'Chat'}
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={() => switchMode('lite')}
                  className="px-3 py-1.5 bg-zinc-800 dark:bg-zinc-200 text-zinc-300 dark:text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
                >
                  Lite
                </button>
                <button 
                  onClick={() => switchMode('full')}
                  className="px-3 py-1.5 bg-zinc-800 dark:bg-zinc-200 text-zinc-300 dark:text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
                >
                  Full
                </button>
              </div>
              <button 
                onClick={() => router.push('/settings/simple')}
                className="p-2 bg-zinc-800 dark:bg-zinc-200 text-zinc-300 dark:text-zinc-700 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button 
                onClick={handleSignOut}
                className="p-2 bg-zinc-800 dark:bg-zinc-200 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-zinc-900/50 dark:bg-zinc-100/50 backdrop-blur-xl border border-zinc-800 dark:border-zinc-200 shadow-2xl rounded-xl overflow-hidden">
          <div className="h-[calc(100vh-160px)] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-600">
                <div className="text-4xl mb-3">{mode === 'ai' ? '🤖' : '💬'}</div>
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1 bg-zinc-800/50 dark:bg-zinc-200/50 px-3 py-1 rounded-lg">
                  {mode === 'ai' ? 'Ask the AI something' : 'Start a conversation'}
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex flex-col gap-1 p-3 rounded-lg transition-colors ${
                      message.sender_id === user?.id
                        ? 'bg-zinc-800 dark:bg-zinc-200 ml-8 border border-zinc-700 dark:border-zinc-300'
                        : message.is_ai_response
                        ? 'bg-zinc-800/70 dark:bg-zinc-200/70 mr-8 border border-zinc-700/70 dark:border-zinc-300/70'
                        : 'bg-zinc-800/30 dark:bg-zinc-200/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-300 dark:text-zinc-700">
                        {message.is_ai_response ? 'AI' : message.username}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-100 dark:text-zinc-900 leading-relaxed break-words">
                      {message.content}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Input */}
          <div className="border-t border-zinc-800 dark:border-zinc-200 p-4">
            <form onSubmit={handleSend}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={mode === 'ai' ? "Message AI..." : "Type message..."}
                  className="flex-1 px-4 py-2 bg-zinc-800 dark:bg-zinc-200 border border-zinc-700 dark:border-zinc-300 rounded-lg text-sm text-zinc-100 dark:text-zinc-900 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 dark:focus:ring-zinc-400 focus:border-transparent transition-all"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    sending || !newMessage.trim()
                      ? 'bg-zinc-800/50 dark:bg-zinc-200/50 text-zinc-500 cursor-not-allowed'
                      : mode === 'ai'
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {sending ? 'Sending' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}