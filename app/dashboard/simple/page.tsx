"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"

interface Message {
  id: string
  content: string
  username: string
  created_at: string
}

export default function SimplePage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [mode, setMode] = useState<'chat' | 'ai'>('chat')

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }
    
    if (user) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [user, loading, router, mode])

  const fetchMessages = async () => {
    try {
      const chatType = mode === 'ai' ? 'dm' : 'global'
      const chatId = mode === 'ai' ? 'ai-user-id-12345' : undefined
      const params = new URLSearchParams({ chatType })
      if (chatId) params.append('chatId', chatId)
      
      const response = await fetch(`/api/messages?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages.slice(-20))
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
      const chatId = mode === 'ai' ? 'ai-user-id-12345' : undefined
      
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
    <div style={{
      fontFamily: 'monospace',
      backgroundColor: '#ffffff',
      color: '#000000',
      minHeight: '100vh',
      padding: '10px'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #cccccc',
        paddingBottom: '10px',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong>real.simple</strong>
          <span style={{marginLeft: '10px', color: '#666'}}>@{user.username}</span>
          <span style={{marginLeft: '10px', fontSize: '10px', color: '#999'}}>
            [{mode === 'chat' ? 'GLOBAL CHAT' : 'AI CHAT'}]
          </span>
        </div>
        <div>
          <button 
            onClick={() => setMode(mode === 'chat' ? 'ai' : 'chat')}
            style={{
              marginRight: '5px',
              padding: '2px 8px',
              border: '1px solid #000',
              background: mode === 'ai' ? '#000' : 'white',
              color: mode === 'ai' ? 'white' : '#000',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            {mode === 'chat' ? 'AI' : 'CHAT'}
          </button>
          <button 
            onClick={() => switchMode('lite')}
            style={{
              marginRight: '5px',
              padding: '2px 8px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            LITE
          </button>
          <button 
            onClick={() => switchMode('full')}
            style={{
              marginRight: '5px',
              padding: '2px 8px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            FULL
          </button>
          <button 
            onClick={() => router.push('/settings/simple')}
            style={{
              marginRight: '5px',
              padding: '2px 8px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            SET
          </button>
          <button 
            onClick={handleSignOut}
            style={{
              padding: '2px 8px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            OUT
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        height: 'calc(100vh - 120px)',
        overflow: 'auto',
        border: '1px solid #cccccc',
        padding: '10px',
        marginBottom: '10px',
        backgroundColor: '#fafafa'
      }}>
        {messages.length === 0 ? (
          <div style={{textAlign: 'center', color: '#999', padding: '20px'}}>
            No messages yet
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} style={{marginBottom: '6px', lineHeight: '1.2'}}>
              <span style={{fontSize: '10px', fontWeight: 'bold'}}>{message.username}:</span>{' '}
              <span style={{fontSize: '10px'}}>{message.content}</span>
              <div style={{fontSize: '8px', color: '#999', marginTop: '1px'}}>
                {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend}>
        <div style={{display: 'flex', gap: '10px'}}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={mode === 'ai' ? "Ask AI..." : "Type message..."}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #cccccc',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            style={{
              padding: '8px 16px',
              border: '1px solid #cccccc',
              backgroundColor: sending ? '#f0f0f0' : '#ffffff',
              cursor: sending ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
          >
            {sending ? 'SEND...' : 'SEND'}
          </button>
        </div>
      </form>
    </div>
  )
}