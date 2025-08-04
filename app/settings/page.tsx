"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Settings, Palette, Bell, User, Trash2, Save, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const { user, setUser, signOut, loading: userLoading, refreshUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [theme, setTheme] = useState("light")
  const [hue, setHue] = useState("blue")
  const [notifications, setNotifications] = useState(true)
  const [customTitle, setCustomTitle] = useState("")
  const [nameColor, setNameColor] = useState("")

  // Initialize form state when user loads
  useEffect(() => {
    if (user) {
      console.log("[settings] Initializing form with user data:", user)
      setTheme(user.theme || "light")
      setHue(user.hue || "blue")
      setNotifications(user.notifications_enabled ?? true)
      setCustomTitle(user.custom_title || "")
      setNameColor(user.name_color || "")
    }
  }, [user])

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const handleSaveSettings = async () => {
    if (!user || loading) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("[settings] Saving settings:", { theme, hue, notifications, customTitle, nameColor })

      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          theme,
          hue,
          notifications_enabled: notifications,
          custom_title: customTitle.trim() || null,
          name_color: nameColor.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update settings")
      }

      const data = await response.json()
      console.log("[settings] Settings updated successfully:", data.user)

      // Update user context with new data
      setUser(data.user)
      setSuccess("Settings updated successfully!")
    } catch (err) {
      console.error("[settings] Save error:", err)
      setError(err instanceof Error ? err.message : "Failed to update settings")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleting) return

    const confirmed = confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your messages and data.",
    )

    if (!confirmed) return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete account")
      }

      // Account deleted successfully, sign out
      await signOut()
    } catch (err) {
      console.error("[settings] Delete error:", err)
      setError(err instanceof Error ? err.message : "Failed to delete account")
      setDeleting(false)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    // Apply immediately for preview
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(newTheme)
  }

  const handleHueChange = (newHue: string) => {
    setHue(newHue)
    // Apply immediately for preview
    document.documentElement.classList.remove(
      "hue-red",
      "hue-orange",
      "hue-yellow",
      "hue-green",
      "hue-blue",
      "hue-purple",
      "hue-pink",
      "hue-gray",
    )
    document.documentElement.classList.add(`hue-${newHue}`)

    const hueValues = {
      red: "0",
      orange: "25",
      yellow: "45",
      green: "120",
      blue: "220",
      purple: "270",
      pink: "320",
      gray: "0",
    }
    document.documentElement.style.setProperty("--hue", hueValues[newHue as keyof typeof hueValues] || "220")
  }

  // Show loading state while user is being fetched
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-muted-foreground">Loading user data...</div>
        </div>
      </div>
    )
  }

  // Show error if no user after loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">Please sign in to access your settings.</p>
              <Button onClick={() => (window.location.href = "/auth")}>Go to Sign In</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-500">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hue">Color</Label>
                <Select value={hue} onValueChange={handleHueChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Customize your profile appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customTitle">Custom Title</Label>
              <Input
                id="customTitle"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter a custom title"
                maxLength={50}
              />
              <p className="text-sm text-muted-foreground mt-1">{customTitle.length}/50 characters</p>
            </div>

            {user.signup_code === "asdf" && (
              <div>
                <Label htmlFor="nameColor">Name Color (Hex)</Label>
                <Input
                  id="nameColor"
                  value={nameColor}
                  onChange={(e) => setNameColor(e.target.value)}
                  placeholder="#6366f1"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
                <p className="text-sm text-muted-foreground mt-1">Enter a hex color code (e.g., #6366f1)</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications for mentions and messages</p>
              </div>
              <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-between">
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>

          <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
