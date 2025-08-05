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
import { Loader2, Save, User, Palette, Bell } from "lucide-react"

export default function SettingsPage() {
  const { user, loading, error, updateUser } = useUser()
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
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

  const handleSave = async () => {
    if (!user) {
      setSaveMessage("Please log in to save settings")
      return
    }

    setSaving(true)
    setSaveMessage("")

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

        // Update user context with new data
        updateUser(data.user)
        setSaveMessage("Settings saved successfully!")

        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        const errorData = await response.json()
        console.error("[Settings] Save failed:", errorData)
        setSaveMessage(`Failed to save settings: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("[Settings] Save error:", error)
      setSaveMessage("An unexpected error occurred while saving settings")
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
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-foreground">Loading settings...</span>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{error || "User data not available. Please log in again."}</p>
            <Button className="mt-4" onClick={() => (window.location.href = "/auth")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-2 mb-6">
          <User className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Settings</span>
            </CardTitle>
            <CardDescription>Customize your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Username
                </Label>
                <Input id="username" value={user.username} disabled className="bg-muted text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_title" className="text-foreground">
                  Custom Title
                </Label>
                <Input
                  id="custom_title"
                  value={formData.custom_title}
                  onChange={(e) => handleInputChange("custom_title", e.target.value)}
                  placeholder="Enter a custom title"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_color" className="text-foreground">
                Name Color (Hex)
              </Label>
              <Input
                id="name_color"
                value={formData.name_color}
                onChange={(e) => handleInputChange("name_color", e.target.value)}
                placeholder="#6366f1"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-foreground">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                className="bg-background border-border text-foreground min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-foreground">
                  Theme
                </Label>
                <Select value={formData.theme} onValueChange={(value) => handleInputChange("theme", value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hue" className="text-foreground">
                  Color Scheme
                </Label>
                <Select value={formData.hue} onValueChange={(value) => handleInputChange("hue", value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gray">Monochrome</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
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
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-foreground">
                  Enable Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive notifications for new messages and updates</p>
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
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {saveMessage && (
              <p className={`text-sm ${saveMessage.includes("successfully") ? "text-green-600" : "text-destructive"}`}>
                {saveMessage}
              </p>
            )}
          </div>
          <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
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
    </div>
  )
}
