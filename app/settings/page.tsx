"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useUser } from "@/hooks/use-user"
import { Settings, Palette, Bell, User, Trash2 } from "lucide-react"

interface UserSettings {
  username: string
  name_color: string
  has_gold_animation: boolean
  theme: string
  notifications_enabled: boolean
  signup_code: string
}

export default function SettingsPage() {
  const { user, loading, setUser: updateLocalUser } = useUser()
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [nameColor, setNameColor] = useState("#ffffff")
  const [hasGoldAnimation, setHasGoldAnimation] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false) // New state for dark mode
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [signupCode, setSignupCode] = useState("")
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteUsernameConfirm, setDeleteUsernameConfirm] = useState("")
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission>("default")

  useEffect(() => {
    if (!loading && user) {
      setUsername(user.username)
      setNameColor(user.name_color || "#ffffff")
      setHasGoldAnimation(user.has_gold_animation || false)
      setIsDarkMode(user.theme === "dark") // Initialize dark mode switch
      setNotificationsEnabled(user.notifications_enabled || false)
      setSignupCode(user.signup_code || "")
      checkNotificationPermission()
    }
  }, [user, loading])

  const checkNotificationPermission = () => {
    if ("Notification" in window) {
      setNotificationPermissionStatus(Notification.permission)
    }
  }

  const handleSaveSettings = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          name_color: nameColor,
          has_gold_animation: hasGoldAnimation,
          theme: isDarkMode ? "dark" : "light", // Save theme based on switch
          notifications_enabled: notificationsEnabled,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        updateLocalUser(data.user) // Update user context
        alert("Settings saved successfully!")
      } else {
        const errorData = await response.json()
        alert(`Failed to save settings: ${errorData.error || response.statusText}`)
      }
    } catch (error: any) {
      console.error("Failed to save settings:", error)
      alert(`An unexpected error occurred: ${error.message}`)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteUsernameConfirm !== user.username) {
      alert("Please type your username correctly to confirm deletion.")
      return
    }

    if (confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
      try {
        const response = await fetch("/api/user/delete", {
          method: "DELETE",
        })

        if (response.ok) {
          alert("Account deleted successfully. You will now be redirected to the sign-in page.")
          router.push("/auth") // Redirect to sign-in after deletion
        } else {
          const errorData = await response.json()
          alert(`Failed to delete account: ${errorData.error || response.statusText}`)
        }
      } catch (error: any) {
        console.error("Failed to delete account:", error)
        alert(`An unexpected error occurred: ${error.message}`)
      }
    }
  }

  const handleNotificationsToggle = async (checked: boolean) => {
    setNotificationsEnabled(checked)
    if (checked) {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          console.log("Notification permission already granted.")
          new Notification("Notifications Enabled", {
            body: "You will now receive notifications from real.",
            icon: "/favicon.png",
          })
        } else if (Notification.permission !== "denied") {
          const permission = await Notification.requestPermission()
          setNotificationPermissionStatus(permission) // Update permission status after request
          if (permission === "granted") {
            console.log("Notification permission granted.")
            new Notification("Notifications Enabled", {
              body: "You will now receive notifications from real.",
              icon: "/favicon.png",
            })
          } else {
            console.log("Notification permission denied.")
            setNotificationsEnabled(false) // Revert switch if permission denied
            alert("Notification permission denied. Please enable notifications in your browser settings.")
          }
        } else {
          console.log("Notification permission previously denied.")
          alert("Notification permission is blocked. Please enable notifications in your browser settings.")
        }
      } else {
        alert("Your browser does not support notifications.")
        setNotificationsEnabled(false)
      }
    }
    // Always update settings in DB after toggle, even if permission is denied
    await handleSaveSettings()
  }

  const handleGoldCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value
    setSignupCode(code)
    if (code === "qwea") {
      setHasGoldAnimation(true)
    } else {
      setHasGoldAnimation(false)
    }
  }

  const testNotification = () => {
    if (notificationPermissionStatus === "granted") {
      new Notification("real. Test", {
        body: "Notifications are working! 🎉",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.20))]">
        <div className="text-muted-foreground animate-pulse">Loading settings...</div>
      </div>
    )
  }

  if (!user) {
    return null // Or redirect to auth page
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.20))] p-4">
      <Card className="w-full max-w-2xl animate-fadeIn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            User Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </h3>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="name-color">Name Color</Label>
              <Input
                id="name-color"
                type="color"
                value={nameColor}
                onChange={(e) => setNameColor(e.target.value)}
                className="w-full h-10"
              />
            </div>
            <div>
              <Label htmlFor="signup-code">Gold Secret Code</Label>
              <Input
                id="signup-code"
                type="text"
                value={signupCode}
                onChange={handleGoldCodeChange}
                placeholder="Enter secret code for gold animation"
              />
              {hasGoldAnimation && <p className="text-sm text-green-500 mt-1">Gold animation enabled!</p>}
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme
            </h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode-switch">Dark Mode</Label>
              <Switch
                id="dark-mode-switch"
                checked={isDarkMode}
                onCheckedChange={(checked) => setIsDarkMode(checked)}
              />
            </div>
            <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled">Enable Desktop Notifications</Label>
              <Switch
                id="notifications-enabled"
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsToggle}
              />
            </div>
            <p className="text-sm text-muted-foreground">Receive real-time alerts for new messages and events.</p>
            <p className="text-xs text-muted-foreground mt-1">Permission Status: {notificationPermissionStatus}</p>

            {notificationPermissionStatus === "denied" && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  Notifications are blocked by your browser. Please enable them in your browser settings and refresh the
                  page.
                </p>
              </div>
            )}

            {notificationPermissionStatus === "granted" && notificationsEnabled && (
              <Button size="sm" onClick={testNotification} variant="outline">
                Test Notification
              </Button>
            )}
          </div>

          {/* Save Button */}
          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>

          {/* Delete Account */}
          <div className="space-y-4 pt-4 border-t border-destructive/50">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />
              Danger Zone
            </h3>
            <Button variant="destructive" onClick={() => setShowDeleteConfirmation(true)} className="w-full">
              Delete Account
            </Button>
            {showDeleteConfirmation && (
              <Card className="bg-destructive/10 border-destructive mt-4">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-destructive">
                    This action is irreversible. To confirm, type your username "
                    <span className="font-bold">{user.username}</span>" below.
                  </p>
                  <Input
                    type="text"
                    placeholder="Confirm username"
                    value={deleteUsernameConfirm}
                    onChange={(e) => setDeleteUsernameConfirm(e.target.value)}
                    className="bg-destructive/20 border-destructive text-destructive-foreground placeholder:text-destructive-foreground/70"
                  />
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteUsernameConfirm !== user.username}
                    className="w-full"
                  >
                    I understand, delete my account
                  </Button>
                  <Button variant="outline" onClick={() => setShowDeleteConfirmation(false)} className="w-full mt-2">
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
