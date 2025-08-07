"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Trash2, Bell, BellOff, Palette, Moon, Sun } from 'lucide-react'
import { useUser } from "@/hooks/use-user"

interface User {
  id: string
  username: string
  email: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  notifications_enabled: boolean
  theme: string
  hue: string
  signup_code?: string
}

const hues = [
  { id: "blue", name: "Blue", color: "hsl(220, 70%, 50%)" },
  { id: "purple", name: "Purple", color: "hsl(270, 70%, 50%)" },
  { id: "pink", name: "Pink", color: "hsl(320, 70%, 50%)" },
  { id: "red", name: "Red", color: "hsl(0, 70%, 50%)" },
  { id: "orange", name: "Orange", color: "hsl(30, 70%, 50%)" },
  { id: "yellow", name: "Yellow", color: "hsl(60, 70%, 50%)" },
  { id: "green", name: "Green", color: "hsl(120, 70%, 50%)" },
  { id: "teal", name: "Teal", color: "hsl(180, 70%, 50%)" },
]

export default function SettingsPage() {
  const { user, loading: userLoading, setUser: updateLocalUser } = useUser()
  const { theme, setTheme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  const [nameColor, setNameColor] = useState("#6366f1")
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!userLoading && user) {
      setCustomTitle(user.custom_title || "")
      setNameColor(user.name_color || "#6366f1")
      checkNotificationPermission()

      // Apply user's hue
      if (user.hue) {
        document.documentElement.className = document.documentElement.className
          .replace(/hue-\w+/g, "")
          .concat(` hue-${user.hue}`)
      }
    }
  }, [user, userLoading])

  const checkNotificationPermission = () => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      if (permission === "granted") {
        await updateSettings({ notifications_enabled: true })
        new Notification("Notifications Enabled", {
          body: "You'll now receive notifications from real.",
          icon: "/favicon.png",
        })
      }
    }
  }

  const updateSettings = async (updates: Partial<User>) => {
    if (!user) {
      setError("User data not available. Please try again.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        updateLocalUser(data.user)

        // Apply hue change immediately
        if (updates.hue) {
          document.documentElement.className = document.documentElement.className
            .replace(/hue-\w+/g, "")
            .concat(` hue-${updates.hue}`)
        }
      } else {
        const errorData = await response.json()
        setError(`Failed to update settings: ${errorData.error || response.statusText}`)
      }
    } catch (error: any) {
      setError(`An unexpected error occurred: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const response = await fetch("/api/user/delete", {
          method: "DELETE",
        })

        if (response.ok) {
          router.push("/auth")
        } else {
          const errorData = await response.json()
          alert(`Failed to delete account: ${errorData.error || response.statusText}`)
        }
      } catch (error) {
        alert("An unexpected error occurred while deleting account.")
      }
    }
  }

  const testNotification = () => {
    if (notificationPermission === "granted") {
      new Notification("real. Test", {
        body: "Notifications are working! 🎉",
        icon: "/favicon.png",
      })
    }
  }

  const handleThemeToggle = async (checked: boolean) => {
    const newTheme = checked ? "dark" : "light"
    
    // Update theme immediately
    setTheme(newTheme)
    
    // Update in database
    await updateSettings({ theme: newTheme })
  }

  if (userLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">User data not available. Redirecting...</div>
      </div>
    )
  }

  const canCustomize = user.signup_code === "asdf" || user.signup_code === "qwea"

  return (
    <div className="min-h-screen p-4 relative z-10">
      <div className="max-w-2xl mx-auto pt-20">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="hover-lift">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {error && (
          <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-lg mb-4 animate-fadeIn border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="glass-effect hover-lift animate-fadeIn">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input value={user.username} disabled className="mt-1" />
              </div>
            </CardContent>
          </Card>

          {/* Theme & Appearance */}
          <Card className="glass-effect hover-lift animate-fadeIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={handleThemeToggle}
                  disabled={saving}
                />
              </div>

              {/* Hue Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">Color Hue</label>
                <p className="text-xs text-muted-foreground mb-4">
                  Choose a color that affects shadows, borders, and accents
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {hues.map((hue) => (
                    <button
                      key={hue.id}
                      onClick={() => updateSettings({ hue: hue.id })}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 hover-lift ${
                        user.hue === hue.id
                          ? "border-current hue-shadow"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      style={{
                        borderColor: user.hue === hue.id ? hue.color : undefined,
                        boxShadow: user.hue === hue.id ? `0 4px 20px ${hue.color}30` : undefined,
                      }}
                    >
                      <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: hue.color }} />
                      <p className="text-xs font-medium">{hue.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customization (for special users) */}
          {canCustomize && (
            <Card className="glass-effect hover-lift animate-fadeIn hue-bg border-2 hue-border">
              <CardHeader>
                <CardTitle>✨ Premium Customization</CardTitle>
                <p className="text-sm text-muted-foreground">Special features unlocked with your signup code</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Custom Title</label>
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Your custom title"
                    className="mt-1"
                  />
                  <Button
                    size="sm"
                    className="mt-2 hover-glow"
                    onClick={() => updateSettings({ custom_title: customTitle })}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Title"}
                  </Button>
                </div>

                {user.signup_code === "asdf" && (
                  <div>
                    <label className="text-sm font-medium">Name Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={nameColor}
                        onChange={(e) => setNameColor(e.target.value)}
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                      />
                      <Button
                        size="sm"
                        onClick={() => updateSettings({ name_color: nameColor })}
                        disabled={saving}
                        className="hover-glow"
                      >
                        {saving ? "Saving..." : "Save Color"}
                      </Button>
                    </div>
                  </div>
                )}

                {user.signup_code === "qwea" && (
                  <div className="p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                      ✨ Gold Animation Enabled
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      Your name appears with a shiny gold animation in chats
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          <Card className="glass-effect hover-lift animate-fadeIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {user.notifications_enabled ? <Bell className="h-5 w-5 hue-accent" /> : <BellOff className="h-5 w-5" />}
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Desktop Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified about new messages</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Status:{" "}
                    <span className={notificationPermission === "granted" ? "text-green-600" : "text-orange-600"}>
                      {notificationPermission}
                    </span>
                  </p>
                </div>
                <Switch
                  checked={user.notifications_enabled}
                  onCheckedChange={async (checked) => {
                    if (checked && notificationPermission !== "granted") {
                      await requestNotificationPermission()
                    } else {
                      await updateSettings({ notifications_enabled: checked })
                    }
                  }}
                  disabled={saving}
                />
              </div>

              {notificationPermission === "denied" && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">
                    Notifications are blocked. Please enable them in your browser settings and refresh the page.
                  </p>
                </div>
              )}

              {notificationPermission === "granted" && user.notifications_enabled && (
                <Button size="sm" onClick={testNotification} variant="outline" className="hover-glow bg-transparent">
                  Test Notification
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="glass-effect hover-lift animate-fadeIn border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">This action cannot be undone</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
