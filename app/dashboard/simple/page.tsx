"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { notificationService } from "@/lib/notification-service"
import { AI_USER_ID } from "@/lib/constants"

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

  // Keep messages in sync for notifications
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }
    
    if (user) {
      // Request notification permissions
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
      const chatId = mode === 'ai' ? 'AI_USER_ID' : undefined
      const params = new URLSearchParams({ chatType })
      if (chatId) params.append('chatId', chatId)
      
      const response = await fetch(`/api/messages?${params}`)
      if (response.ok) {
        const data = await response.json()
        const newMessages = data.messages.slice(-20)
        
        // Handle notifications for new messages
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
                // Focus window when notification clicked
                window.focus()
                if (messagesEndRef.current) {
                  messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
                }
              }
            })
          })
        }
        
        setMessages(newMessages)
        
        // Auto scroll to bottom
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
      const chatId = mode === 'ai' ? 'AI_USER_ID' : undefined
      
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
    return <div style={{padding: '20px', fontFamily: 'monospace'}}>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black dark:from-gray-50 dark:via-white dark:to-gray-100 overflow-hidden relative">
      {/* Animated background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-300" />
      </div>
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-900/98 via-gray-900/98 to-black/98 dark:from-gray-100/98 dark:via-gray-50/98 dark:to-white/98 backdrop-blur-2xl border-b border-white/20 dark:border-black/20 shadow-2xl">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                  <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-emerald-300 to-cyan-300 rounded-full animate-ping opacity-40" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white dark:text-gray-900">
                  real<span className="text-white/60 dark:text-gray-600">.simple</span>
                </h1>
              </div>
              <div className="hidden xs:flex items-center gap-3 text-sm">
                <span className="text-white/80 dark:text-gray-700/80 font-medium truncate">@{user.username}</span>
                <span className="px-3 py-1.5 bg-white/15 dark:bg-gray-900/20 backdrop-blur-xl rounded-2xl text-xs font-semibold text-white dark:text-gray-700 border border-white/20 dark:border-white/10 whitespace-nowrap">
                  {mode === 'chat' ? '🌐 Global' : '🤖 AI'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button 
                onClick={() => setMode(mode === 'chat' ? 'ai' : 'chat')}
                className={`px-3 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 hover:scale-105 ${
                  mode === 'ai' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-white/15 dark:bg-gray-900/20 text-white dark:text-gray-700 hover:bg-white/25 dark:hover:bg-gray-900/30 backdrop-blur-xl border border-white/20 dark:border-white/10'
                }`}
                title={mode === 'chat' ? 'Switch to AI' : 'Switch to Chat'}
              >
                <span className="hidden xs:inline">{mode === 'chat' ? '🤖 AI' : '🌐 Chat'}</span>
                <span className="xs:hidden">{mode === 'chat' ? '🤖' : '🌐'}</span>
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={() => switchMode('lite')}
                  className="px-3 py-2 bg-white/15 dark:bg-gray-900/20 text-white dark:text-gray-700 rounded-2xl text-xs font-bold hover:bg-white/25 dark:hover:bg-gray-900/30 transition-all duration-300 hover:scale-105 backdrop-blur-xl border border-white/20 dark:border-white/10"
                >
                  Lite
                </button>
                <button 
                  onClick={() => switchMode('full')}
                  className="px-3 py-2 bg-white/15 dark:bg-gray-900/20 text-white dark:text-gray-700 rounded-2xl text-xs font-bold hover:bg-white/25 dark:hover:bg-gray-900/30 transition-all duration-300 hover:scale-105 backdrop-blur-xl border border-white/20 dark:border-white/10"
                >
                  Full
                </button>
              </div>
              <button 
                onClick={() => router.push('/settings/simple')}
                className="px-2 sm:px-3 py-2 bg-white/15 dark:bg-gray-900/20 text-white dark:text-gray-700 rounded-2xl text-xs font-bold hover:bg-white/25 dark:hover:bg-gray-900/30 transition-all duration-300 hover:scale-110 backdrop-blur-xl border border-white/20 dark:border-white/10"
                title="Settings"
              >
                ⚙️
              </button>
              <button 
                onClick={handleSignOut}
                className="px-2 sm:px-3 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-white dark:text-gray-700 rounded-2xl text-xs font-bold hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 hover:scale-105 backdrop-blur-xl border border-red-400/30 dark:border-red-600/20"
                title="Sign Out"
              >
                <span className="hidden xs:inline">Sign Out</span>
                <span className="xs:hidden">Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="bg-gradient-to-br from-white/15 via-gray-100/10 to-transparent dark:from-gray-900/25 dark:via-black/15 dark:to-transparent backdrop-blur-2xl border border-white/25 dark:border-white/15 shadow-[0_16px_64px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_64px_rgba(255,255,255,0.1)] rounded-3xl overflow-hidden hover:shadow-[0_20px_80px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_80px_rgba(255,255,255,0.15)] transition-all duration-700">
          <div className="h-[calc(100vh-160px)] sm:h-[calc(100vh-180px)] overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/60 dark:text-gray-600/60">
                <div className="text-6xl mb-4 animate-pulse">{mode === 'ai' ? '🤖' : '💬'}</div>
                <p className="text-lg font-semibold mb-2">No messages yet</p>
                <p className="text-sm bg-white/10 dark:bg-gray-900/20 px-4 py-2 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10">
                  {mode === 'ai' ? 'Ask the AI something!' : 'Start a conversation!'}
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex flex-col gap-2 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-xl border ${
                      message.sender_id === user?.id
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 ml-4 sm:ml-8 border-blue-400/30 shadow-lg shadow-blue-500/20'
                        : message.is_ai_response
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 mr-4 sm:mr-8 border-purple-400/30 shadow-lg shadow-purple-500/20'
                        : 'bg-white/10 dark:bg-gray-900/20 border-white/20 dark:border-white/10 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white dark:text-gray-900">
                        {message.is_ai_response ? '🤖 AI' : message.username}
                      </span>
                      <span className="text-xs text-white/70 dark:text-gray-700/70">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-white dark:text-gray-900 leading-relaxed break-words font-medium">
                      {message.content}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Input */}
          <div className="border-t border-white/20 dark:border-white/10 p-4 sm:p-6 bg-gradient-to-r from-white/5 via-gray-100/5 to-white/5 dark:from-gray-900/10 dark:via-black/10 dark:to-gray-900/10">
            <form onSubmit={handleSend}>
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={mode === 'ai' ? "Ask AI anything..." : "Type your message..."}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white/15 dark:bg-gray-900/25 border border-white/30 dark:border-white/20 rounded-2xl text-sm text-white dark:text-gray-900 placeholder-white/60 dark:placeholder-gray-700/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-xl font-medium transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-900/30"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className={`px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 whitespace-nowrap backdrop-blur-xl shadow-lg ${
                    sending || !newMessage.trim()
                      ? 'bg-white/10 dark:bg-gray-900/20 text-white/50 dark:text-gray-700/50 cursor-not-allowed border border-white/20 dark:border-white/10'
                      : mode === 'ai'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-purple-500/30'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-blue-500/30'
                  }`}
                >
                  <span className="hidden xs:inline">{sending ? 'Sending...' : 'Send'}</span>
                  <span className="xs:hidden">{sending ? '...' : '→'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}