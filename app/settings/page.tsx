"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, User, Palette, Bell, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user, loading, error, updateUser } = useUser()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [saveError, setSaveError] = useState("")
  const [formData, setFormData] = useState({
    theme: "dark",
    hue: "gray",
    notifications_enabled: false,
    name_color: "",
    custom_title: "",
    bio: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        theme: user.theme || "dark",
        hue: user.hue || "gray",
        notifications_enabled: user.notifications_enabled || false,
        name_color: user.name_color || "",
        custom_title: user.custom_title || "",
        bio: user.bio || "",
      })
    }
  }, [user])

  useEffect(() => {
    if (saveMessage || saveError) {
      const timer = setTimeout(() => {
        setSaveMessage("")
        setSaveError("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage, saveError])

  const handleSave = async () => {
    if (!user) {
      setSaveError("Please log in to save settings")
      return
    }

    setSaving(true)
    setSaveMessage("")
    setSaveError("")

    try {
      console.log("[Settings] Saving settings:", formData)

      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      console.log("[Settings] Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[Settings] Settings saved successfully:", data)

        updateUser(data.user)
        setSaveMessage("Settings saved successfully!")
      } else {
        const errorData = await response.json()
        console.error("[Settings] Save failed:", errorData)
        setSaveError(`Failed to save settings: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("[Settings] Save error:", error)
      setSaveError("An unexpected error occurred while saving settings")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Apply theme changes immediately for preview
    if (field === "theme" || field === "hue") {
      const newTheme = field === "theme" ? value : formData.theme
      const newHue = field === "hue" ? value : formData.hue

      // Remove existing classes
      document.documentElement.classList.remove("light", "dark")
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

      // Apply new classes
      document.documentElement.classList.add(newTheme)
      document.documentElement.classList.add(`hue-${newHue}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xl text-foreground">Loading settings...</span>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4">{error || "User data not available. Please log in again."}</p>
            <Button onClick={() => router.push("/auth")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground font-medium">{user.username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">Customize your experience and manage your account</p>
          </div>

          {/* Messages */}
          {saveMessage && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">{saveMessage}</AlertDescription>
            </Alert>
          )}

          {saveError && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">{saveError}</AlertDescription>
            </Alert>
          )}

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <span>Profile Settings</span>
              </CardTitle>
              <CardDescription>Customize your profile information and appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground font-medium">
                    Username
                  </Label>
                  <Input 
                    id="username" 
                    value={user.username} 
                    disabled 
                    className="bg-muted text-muted-foreground cursor-not-allowed" 
                  />
                  <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_title" className="text-foreground font-medium">
                    Custom Title
                  </Label>
                  <Input
                    id="custom_title"
                    value={formData.custom_title}
                    onChange={(e) => handleInputChange("custom_title", e.target.value)}
                    placeholder="Enter a custom title"
                    className="bg-background border-border text-foreground"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.custom_title.length}/50 characters
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_color" className="text-foreground font-medium">
                  Name Color
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="name_color"
                    type="color"
                    value={formData.name_color || "#6366f1"}
                    onChange={(e) => handleInputChange("name_color", e.target.value)}
                    className="w-16 h-10 p-1 bg-background border-border cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.name_color}
                    onChange={(e) => handleInputChange("name_color", e.target.value)}
                    placeholder="#6366f1"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Choose a custom color for your username</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-foreground font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="bg-background border-border text-foreground min-h-[100px] resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bio.length}/200 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-primary" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-foreground font-medium">
                    Theme
                  </Label>
                  <Select value={formData.theme} onValueChange={(value) => handleInputChange("theme", value)}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">🌙 Dark</SelectItem>
                      <SelectItem value="light">☀️ Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hue" className="text-foreground font-medium">
                    Color Scheme
                  </Label>
                  <Select value={formData.hue} onValueChange={(value) => handleInputChange("hue", value)}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gray">⚫ Monochrome</SelectItem>
                      <SelectItem value="red">🔴 Red</SelectItem>
                      <SelectItem value="orange">🟠 Orange</SelectItem>
                      <SelectItem value="yellow">🟡 Yellow</SelectItem>
                      <SelectItem value="green">🟢 Green</SelectItem>
                      <SelectItem value="blue">🔵 Blue</SelectItem>
                      <SelectItem value="purple">🟣 Purple</SelectItem>
                      <SelectItem value="pink">🩷 Pink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="notifications" className="text-foreground font-medium">
                    Enable Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new messages and updates
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={formData.notifications_enabled}
                  onCheckedChange={(checked) => handleInputChange("notifications_enabled", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-end pt-6 border-t border-border">
            <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
