"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { notificationService } from "@/lib/notification-service"
import { AI_USER_ID } from "@/lib/constants"
import { Sparkles, Zap, Star, Heart, Bot, Globe, Settings, LogOut, Users, Hash } from "lucide-react"

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
      const chatId = mode === 'ai' ? AI_USER_ID : undefined
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900">
        <div className="relative">
          <div className="text-white animate-pulse text-4xl font-black mb-4">Loading the future...</div>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-200" />
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-400" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 dark:from-indigo-100 dark:via-purple-50 dark:to-pink-100 overflow-hidden relative">
      {/* Mega animated background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-64 -right-64 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/25 to-blue-500/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-64 -left-64 w-[600px] h-[600px] bg-gradient-to-br from-pink-400/25 to-rose-500/25 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute animate-float top-20 left-20">
          <Sparkles className="h-12 w-12 text-cyan-300/60 animate-pulse" />
        </div>
        <div className="absolute animate-float delay-300 top-40 right-32">
          <Star className="h-10 w-10 text-pink-300/60 animate-pulse delay-200" />
        </div>
        <div className="absolute animate-float delay-700 bottom-32 left-40">
          <Zap className="h-14 w-14 text-yellow-300/60 animate-pulse delay-500" />
        </div>
        <div className="absolute animate-float delay-1000 bottom-20 right-20">
          <Heart className="h-8 w-8 text-rose-300/60 animate-pulse delay-700" />
        </div>
      </div>
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-violet-600/98 via-purple-600/98 to-fuchsia-600/98 dark:from-indigo-200/98 dark:via-purple-100/98 dark:to-pink-200/98 backdrop-blur-3xl border-b-2 border-white/30 dark:border-white/40 shadow-[0_8px_32px_rgba(139,92,246,0.3)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6 min-w-0">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-300 to-cyan-300 rounded-full animate-pulse shadow-2xl shadow-emerald-300/60" />
                  <div className="absolute inset-0 w-6 h-6 bg-gradient-to-r from-emerald-200 to-cyan-200 rounded-full animate-ping opacity-50" />
                  <Zap className="absolute inset-0 h-6 w-6 text-white animate-pulse delay-500" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white dark:text-gray-900">
                  real<span className="text-white/60 dark:text-gray-600">.simple</span>
                </h1>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-lg">
                <span className="text-white/90 dark:text-gray-800/90 font-bold truncate">@{user.username}</span>
                <span className="px-4 py-2 bg-white/20 dark:bg-gray-900/30 backdrop-blur-2xl rounded-3xl text-sm font-black text-white dark:text-gray-900 border-2 border-white/30 dark:border-white/20 shadow-xl whitespace-nowrap">
                  {mode === 'chat' ? '🌐 Global' : '🤖 AI'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMode(mode === 'chat' ? 'ai' : 'chat')}
                className={`px-6 py-3 rounded-3xl text-lg font-black transition-all duration-500 hover:scale-110 backdrop-blur-2xl border-2 shadow-2xl ${
                  mode === 'ai' 
                    ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white border-purple-300/50 shadow-purple-400/40' 
                    : 'bg-white/25 dark:bg-gray-900/35 text-white dark:text-gray-900 hover:bg-white/35 dark:hover:bg-gray-900/45 border-white/40 dark:border-white/25'
                }`}
                title={mode === 'chat' ? 'Switch to AI' : 'Switch to Chat'}
              >
                <span className="hidden sm:inline">{mode === 'chat' ? '🤖 AI' : '🌐 Chat'}</span>
                <span className="sm:hidden text-2xl">{mode === 'chat' ? '🤖' : '🌐'}</span>
              </button>
              <div className="hidden lg:flex items-center gap-3">
                <button 
                  onClick={() => switchMode('lite')}
                  className="px-4 py-3 bg-white/25 dark:bg-gray-900/35 text-white dark:text-gray-900 rounded-3xl text-lg font-black hover:bg-white/35 dark:hover:bg-gray-900/45 transition-all duration-300 hover:scale-110 backdrop-blur-2xl border-2 border-white/40 dark:border-white/25 shadow-xl"
                >
                  Lite
                </button>
                <button 
                  onClick={() => switchMode('full')}
                  className="px-4 py-3 bg-white/25 dark:bg-gray-900/35 text-white dark:text-gray-900 rounded-3xl text-lg font-black hover:bg-white/35 dark:hover:bg-gray-900/45 transition-all duration-300 hover:scale-110 backdrop-blur-2xl border-2 border-white/40 dark:border-white/25 shadow-xl"
                >
                  Full
                </button>
              </div>
              <button 
                onClick={() => router.push('/settings/simple')}
                className="p-3 bg-white/25 dark:bg-gray-900/35 text-white dark:text-gray-900 rounded-3xl hover:bg-white/35 dark:hover:bg-gray-900/45 transition-all duration-300 hover:scale-110 backdrop-blur-2xl border-2 border-white/40 dark:border-white/25 shadow-xl group"
                title="Settings"
              >
                <Settings className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
              <button 
                onClick={handleSignOut}
                className="p-3 bg-gradient-to-r from-red-400/30 to-pink-400/30 text-white rounded-3xl hover:from-red-400/50 hover:to-pink-400/50 transition-all duration-300 hover:scale-110 backdrop-blur-2xl border-2 border-red-300/50 shadow-xl group"
                title="Sign Out"
              >
                <LogOut className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="bg-gradient-to-br from-white/25 via-white/15 to-white/10 dark:from-gray-900/35 dark:via-gray-800/25 dark:to-gray-700/15 backdrop-blur-3xl border-2 border-white/40 dark:border-white/25 shadow-[0_24px_120px_rgba(0,0,0,0.3)] dark:shadow-[0_24px_120px_rgba(255,255,255,0.2)] rounded-3xl overflow-hidden relative">
          
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-2xl animate-pulse delay-700" />
          </div>

          <div className="relative h-[calc(100vh-200px)] overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/80 dark:text-gray-800/80">
                <div className="text-8xl mb-8 animate-pulse">{mode === 'ai' ? '🤖' : '💬'}</div>
                <p className="text-3xl font-bold mb-4">No messages yet</p>
                <p className="text-xl bg-white/15 dark:bg-gray-900/25 px-8 py-4 rounded-3xl backdrop-blur-2xl border-2 border-white/30 dark:border-white/20 shadow-2xl">
                  {mode === 'ai' ? 'Ask the AI something incredible!' : 'Start an amazing conversation!'}
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex flex-col gap-3 p-6 rounded-3xl transition-all duration-500 hover:scale-105 backdrop-blur-2xl border-2 shadow-2xl relative overflow-hidden ${
                      message.sender_id === user?.id
                        ? 'bg-gradient-to-r from-blue-400/30 to-cyan-400/30 ml-8 sm:ml-16 border-blue-300/50 shadow-blue-400/30'
                        : message.is_ai_response
                        ? 'bg-gradient-to-r from-purple-400/30 to-pink-400/30 mr-8 sm:mr-16 border-purple-300/50 shadow-purple-400/30'
                        : 'bg-white/20 dark:bg-gray-900/30 border-white/40 dark:border-white/25 shadow-white/20'
                    }`}
                  >
                    {/* Message decoration */}
                    <div className="absolute top-2 right-2">
                      <Sparkles className="h-4 w-4 text-white/30 animate-pulse" />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-white dark:text-gray-900">
                        {message.is_ai_response ? '🤖 AI' : message.username}
                      </span>
                      <span className="text-sm text-white/80 dark:text-gray-800/80 bg-white/20 dark:bg-gray-900/30 px-3 py-1 rounded-2xl backdrop-blur-xl">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-lg text-white dark:text-gray-900 leading-relaxed break-words font-semibold">
                      {message.content}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Input */}
          <div className="border-t-2 border-white/30 dark:border-white/20 p-6 bg-gradient-to-r from-white/10 via-white/5 to-white/10 dark:from-gray-900/20 dark:via-gray-800/15 dark:to-gray-900/20 backdrop-blur-2xl relative">
            <form onSubmit={handleSend}>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={mode === 'ai' ? "Ask AI anything incredible..." : "Type your epic message..."}
                  className="flex-1 px-6 py-4 bg-white/20 dark:bg-gray-900/30 border-2 border-white/40 dark:border-white/25 rounded-3xl text-lg text-white dark:text-gray-900 placeholder-white/70 dark:placeholder-gray-700/70 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-2xl font-semibold transition-all duration-300 hover:bg-white/30 dark:hover:bg-gray-900/40 shadow-xl"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className={`px-8 py-4 rounded-3xl text-lg font-black transition-all duration-500 hover:scale-110 backdrop-blur-2xl shadow-2xl border-2 relative overflow-hidden ${
                    sending || !newMessage.trim()
                      ? 'bg-white/15 dark:bg-gray-900/25 text-white/50 dark:text-gray-700/50 cursor-not-allowed border-white/30 dark:border-white/20'
                      : mode === 'ai'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-purple-500/40 border-purple-300/50'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-blue-500/40 border-blue-300/50'
                  }`}
                >
                  {/* Button decoration */}
                  {!(sending || !newMessage.trim()) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  )}
                  <span className="relative z-10">
                    <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
                    <span className="sm:hidden text-2xl">{sending ? '⏳' : '🚀'}</span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}