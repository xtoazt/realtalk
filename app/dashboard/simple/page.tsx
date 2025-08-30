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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  real<span className="text-slate-500">.simple</span>
                </h1>
              </div>
              <div className="hidden xs:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="truncate">@{user.username}</span>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs whitespace-nowrap">
                  {mode === 'chat' ? '🌐 Global' : '🤖 AI'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button 
                onClick={() => setMode(mode === 'chat' ? 'ai' : 'chat')}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mode === 'ai' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={mode === 'chat' ? 'Switch to AI' : 'Switch to Chat'}
              >
                <span className="hidden xs:inline">{mode === 'chat' ? '🤖 AI' : '🌐 Chat'}</span>
                <span className="xs:hidden">{mode === 'chat' ? '🤖' : '🌐'}</span>
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={() => switchMode('lite')}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Lite
                </button>
                <button 
                  onClick={() => switchMode('full')}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Full
                </button>
              </div>
              <button 
                onClick={() => router.push('/settings/simple')}
                className="px-2 sm:px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Settings"
              >
                ⚙️
              </button>
              <button 
                onClick={handleSignOut}
                className="px-2 sm:px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
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
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="h-[calc(100vh-160px)] sm:h-[calc(100vh-180px)] overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                <div className="text-4xl mb-2">{mode === 'ai' ? '🤖' : '💬'}</div>
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">
                  {mode === 'ai' ? 'Ask the AI something!' : 'Start a conversation!'}
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex flex-col gap-1 p-2.5 sm:p-3 rounded-lg transition-colors ${
                      message.sender_id === user?.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 ml-4 sm:ml-8'
                        : message.is_ai_response
                        ? 'bg-purple-50 dark:bg-purple-900/20 mr-4 sm:mr-8'
                        : 'bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {message.is_ai_response ? '🤖 AI' : message.username}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed break-words">
                      {message.content}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Input */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 sm:p-4">
            <form onSubmit={handleSend}>
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={mode === 'ai' ? "Ask AI anything..." : "Type your message..."}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    sending || !newMessage.trim()
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : mode === 'ai'
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
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