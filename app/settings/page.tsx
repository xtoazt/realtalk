"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { user, loading, error, refreshUser, updateUser } = useUser()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  // Form state
  const [theme, setTheme] = useState("dark")
  const [hue, setHue] = useState("gray")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [nameColor, setNameColor] = useState("")
  const [customTitle, setCustomTitle] = useState("")

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      console.log("[Settings] Initializing form with user data:", user)
      setTheme(user.theme || "dark")
      setHue(user.hue || "gray")
      setNotificationsEnabled(user.notifications_enabled || false)
      setNameColor(user.name_color || "")
      setCustomTitle(user.custom_title || "")
    }
  }, [user])

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading user data...</span>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <Button onClick={refreshUser} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Handle no user state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to access settings</p>
          <Button onClick={() => router.push("/auth")} variant="outline">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      console.log("[Settings] Saving settings...")
      setSaving(true)
      setSaveMessage("")

      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          theme,
          hue,
          notifications_enabled: notificationsEnabled,
          name_color: nameColor || null,
          custom_title: customTitle || null,
        }),
      })

      const data = await response.json()
      console.log("[Settings] Save response:", data)

      if (response.ok) {
        setSaveMessage("Settings saved successfully!")
        updateUser(data.user)
        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        setSaveMessage(`Error: ${data.error || "Failed to save settings"}`)
      }
    } catch (error) {
      console.error("[Settings] Save error:", error)
      setSaveMessage("Error: Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Back to Chat
          </Button>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">User Information</CardTitle>
            <CardDescription className="text-gray-400">Logged in as: {user.username}</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Appearance</CardTitle>
            <CardDescription className="text-gray-400">Customize how the app looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-white">
                Theme
              </Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hue" className="text-white">
                Color Scheme
              </Label>
              <Select value={hue} onValueChange={setHue}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="gray">Monochrome</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="indigo">Indigo</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="pink">Pink</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Profile Customization</CardTitle>
            <CardDescription className="text-gray-400">Customize your profile appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nameColor" className="text-white">
                Custom Name Color
              </Label>
              <Input
                id="nameColor"
                type="color"
                value={nameColor}
                onChange={(e) => setNameColor(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white h-10"
              />
              <p className="text-sm text-gray-400">Choose a custom color for your username</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customTitle" className="text-white">
                Custom Title
              </Label>
              <Textarea
                id="customTitle"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter a custom title..."
                className="bg-gray-700 border-gray-600 text-white"
                maxLength={100}
              />
              <p className="text-sm text-gray-400">Add a custom title that appears next to your name</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Notifications</CardTitle>
            <CardDescription className="text-gray-400">Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              <Label htmlFor="notifications" className="text-white">
                Enable notifications
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>

          {saveMessage && (
            <p className={`text-sm ${saveMessage.includes("Error") ? "text-red-400" : "text-green-400"}`}>
              {saveMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
