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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Settings
              </h1>
            </div>
            <button 
              onClick={() => router.push('/dashboard/simple')}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  @{user.username}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
            </div>

            {/* UI Mode Selection */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                Interface Mode
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <button
                  onClick={() => switchMode('simple')}
                  disabled={saving}
                  className="p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left transition-all disabled:opacity-50"
                >
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Simple
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Current mode
                  </div>
                </button>
                <button
                  onClick={() => switchMode('lite')}
                  disabled={saving}
                  className="p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg text-left transition-all disabled:opacity-50"
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Lite
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Minimal features
                  </div>
                </button>
                <button
                  onClick={() => switchMode('full')}
                  disabled={saving}
                  className="p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg text-left transition-all disabled:opacity-50"
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Full
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    All features
                  </div>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between different interface complexity levels
              </p>
            </div>

            {/* Sign Out */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}