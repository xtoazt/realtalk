"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"

export default function SimpleSettings() {
  const { user, loading, setUser } = useUser()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [loading, user, router])

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      router.push("/auth")
    } catch (error) {
      router.push("/auth")
    }
  }

  const switchMode = async (mode: string) => {
    setSaving(true)
    try {
      await fetch('/api/user/settings', { 
        method: 'PATCH', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ ui_mode: mode })
      })
      localStorage.setItem('ui-mode', mode)
      router.push(`/dashboard${mode === 'full' ? '' : `/${mode}`}`)
    } catch (error) {
      console.error("Failed to switch mode:", error)
    } finally {
      setSaving(false)
    }
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
      padding: '20px'
    }}>
      <div style={{
        borderBottom: '1px solid #cccccc',
        paddingBottom: '10px',
        marginBottom: '20px'
      }}>
        <strong>Settings</strong>
        <button 
          onClick={() => router.push('/dashboard/simple')}
          style={{
            float: 'right',
            padding: '2px 8px',
            border: '1px solid #ccc',
            background: 'white',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          BACK
        </button>
      </div>

      <div style={{marginBottom: '20px'}}>
        <div style={{marginBottom: '10px'}}>
          <strong>User:</strong> @{user.username}
        </div>
        <div style={{marginBottom: '10px'}}>
          <strong>Email:</strong> {user.email}
        </div>
      </div>

      <div style={{marginBottom: '20px'}}>
        <div style={{marginBottom: '10px', fontWeight: 'bold'}}>UI Mode:</div>
        <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
          <button
            onClick={() => switchMode('simple')}
            disabled={saving}
            style={{
              padding: '5px 10px',
              border: '2px solid #000',
              background: '#000',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            SIMPLE (CURRENT)
          </button>
          <button
            onClick={() => switchMode('lite')}
            disabled={saving}
            style={{
              padding: '5px 10px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '11px'
            }}
          >
            LITE
          </button>
          <button
            onClick={() => switchMode('full')}
            disabled={saving}
            style={{
              padding: '5px 10px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '11px'
            }}
          >
            FULL
          </button>
        </div>
        <div style={{fontSize: '10px', color: '#666'}}>
          Simple: Basic chat only<br/>
          Lite: Minimal features<br/>
          Full: All features
        </div>
      </div>

      <div style={{marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ccc'}}>
        <button
          onClick={handleSignOut}
          style={{
            padding: '8px 16px',
            border: '1px solid #ff0000',
            background: '#ffffff',
            color: '#ff0000',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          SIGN OUT
        </button>
      </div>
    </div>
  )
}