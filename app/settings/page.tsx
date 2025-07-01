"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Trash2, Bell, BellOff } from "lucide-react"
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
  signup_code?: string
}

const themes = [
  {
    id: "monochrome",
    name: "Monochrome",
    description: "Clean black and white",
    colors: ["#000000", "#ffffff", "#6b7280"],
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange and pink tones",
    colors: ["#f97316", "#ec4899", "#fbbf24"],
  },
  {
    id: "sunrise",
    name: "Sunrise",
    description: "Soft yellow and blue hues",
    colors: ["#fbbf24", "#60a5fa", "#f472b6"],
  },
  { id: "forest", name: "Forest", description: "Natural green palette", colors: ["#16a34a", "#65a30d", "#84cc16"] },
  { id: "ocean", name: "Ocean", description: "Cool blue tones", colors: ["#0ea5e9", "#3b82f6", "#06b6d4"] },
]

export default function SettingsPage() {
  const { user, loading: userLoading, setUser: updateLocalUser } = useUser()
  const [saving, setSaving] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  const [nameColor, setNameColor] = useState("#6366f1")
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    console.log("[SettingsPage] User data changed:", user)
    if (!userLoading && user) {
      setCustomTitle(user.custom_title || "")
      setNameColor(user.name_color || "#6366f1")
      checkNotificationPermission()
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
      } else {
        if (user?.notifications_enabled) {
          await updateSettings({ notifications_enabled: false })
        }
      }
    }
  }

  const updateSettings = async (updates: Partial<User>) => {
    if (!user) {
      console.warn("[SettingsPage] Attempted to update settings but user is null.")
      setError("User data not available. Please try again.")
      return
    }

    setSaving(true)
    setError(null)
    console.log("[SettingsPage] Sending update:", updates)
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[SettingsPage] Update successful, received:", data.user)
        updateLocalUser(data.user)
      } else {
        const errorData = await response.json()
        console.error("[SettingsPage] Failed to update settings:", errorData.error || response.statusText)
        setError(`Failed to update settings: ${errorData.error || response.statusText}`)
      }
    } catch (error: any) {
      console.error("[SettingsPage] Failed to update settings (network/unexpected error):", error)
      setError(`An unexpected error occurred while saving settings: ${error.message}`)
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
          console.error("Failed to delete account:", errorData.error || response.statusText)
          alert(`Failed to delete account: ${errorData.error || response.statusText}`)
        }
      } catch (error) {
        console.error("Failed to delete account:", error)
        alert("An unexpected error occurred while deleting account.")
      }
    }
  }

  const testNotification = () => {
    if (notificationPermission === "granted") {
      new Notification("real. Test", {
        body: "Notifications are working! 🎉",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      })
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">User data not available. Redirecting...</div>
      </div>
    )
  }

  const canCustomize = user.signup_code === "asdf" || user.signup_code === "qwea"

  return (
    <div className="min-h-screen bg-background p-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto pt-20">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {error && (
          <div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md mb-4 animate-fadeIn">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input value={user.username} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Customization (for special users) */}
          {canCustomize && (
            <Card>
              <CardHeader>
                <CardTitle>Customization</CardTitle>
                <p className="text-sm text-muted-foreground">Special features unlocked with your signup code</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Custom Title</label>
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Your custom title"
                  />
                  <Button
                    size="sm"
                    className="mt-2"
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
                        className="w-10 h-10 rounded border"
                      />
                      <Button size="sm" onClick={() => updateSettings({ name_color: nameColor })} disabled={saving}>
                        {saving ? "Saving..." : "Save Color"}
                      </Button>
                    </div>
                  </div>
                )}

                {user.signup_code === "qwea" && (
                  <div className="p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">✨ Gold Animation Enabled</p>
                    <p className="text-xs text-yellow-700">Your name appears with a shiny gold animation in chats</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <p className="text-sm text-muted-foreground">Current theme: {user.theme}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-102 ${
                      user.theme === theme.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => updateSettings({ theme: theme.id })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{theme.name}</p>
                        <p className="text-sm text-muted-foreground">{theme.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {theme.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {user.theme === theme.id && <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {user.notifications_enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive notifications for new messages</p>
                  <p className="text-xs text-muted-foreground mt-1">Permission: {notificationPermission}</p>
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
                <Button size="sm" onClick={testNotification} variant="outline">
                  Test Notification
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
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
