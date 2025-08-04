"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Camera, Save, MessageCircle, UserPlus, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface ProfileUser {
  id: string
  username: string
  profile_picture?: string
  bio?: string
  created_at: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
}

interface ProfilePageProps {
  userId?: string
  onStartDM?: (userId: string) => void
}

export function ProfilePage({ userId, onStartDM }: ProfilePageProps) {
  const { user: currentUser } = useUser()
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [friendshipStatus, setFriendshipStatus] = useState<string | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  // Edit state
  const [editMode, setEditMode] = useState(false)
  const [editBio, setEditBio] = useState("")

  const targetUserId = userId || currentUser?.id

  useEffect(() => {
    if (targetUserId) {
      fetchProfile()
    }
  }, [targetUserId])

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const fetchProfile = async () => {
    if (!targetUserId) return

    try {
      setError(null)
      const response = await fetch(`/api/users/${targetUserId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const data = await response.json()
      setProfileUser(data.user)
      setFriendshipStatus(data.friendshipStatus)
      setIsOwnProfile(data.isOwnProfile)
      setEditBio(data.user.bio || "")
    } catch (err) {
      console.error("Profile fetch error:", err)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !isOwnProfile) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const uploadResponse = await fetch("/api/upload-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image")
      }

      const uploadData = await uploadResponse.json()

      // Update profile with new image URL
      const profileResponse = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profile_picture: uploadData.url }),
      })

      if (!profileResponse.ok) {
        throw new Error("Failed to update profile picture")
      }

      setSuccess("Profile picture updated!")
      await fetchProfile()
    } catch (err) {
      console.error("Image upload error:", err)
      setError("Failed to upload profile picture")
    } finally {
      setUploading(false)
    }
  }

  const saveBio = async () => {
    if (!isOwnProfile || saving) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bio: editBio }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update bio")
      }

      setSuccess("Bio updated!")
      setEditMode(false)
      await fetchProfile()
    } catch (err) {
      console.error("Bio update error:", err)
      setError(err instanceof Error ? err.message : "Failed to update bio")
    } finally {
      setSaving(false)
    }
  }

  const sendFriendRequest = async () => {
    if (!profileUser || isOwnProfile) return

    try {
      setError(null)
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ friendId: profileUser.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send friend request")
      }

      setSuccess("Friend request sent!")
      await fetchProfile()
    } catch (err) {
      console.error("Friend request error:", err)
      setError(err instanceof Error ? err.message : "Failed to send friend request")
    }
  }

  const startDM = async () => {
    if (!profileUser || isOwnProfile || !onStartDM) return
    onStartDM(profileUser.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error && !profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md border-red-500">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertDescription>Profile not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          {isOwnProfile ? "Your Profile" : `${profileUser.username}'s Profile`}
        </h1>
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

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileUser.profile_picture || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{profileUser.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              {isOwnProfile && (
                <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/80 rounded-full">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </label>
              )}
            </div>

            <div className="flex-1">
              <CardTitle
                className={`text-2xl ${getUsernameClassName(false, profileUser.has_gold_animation, !!profileUser.name_color)}`}
                style={
                  shouldApplyCustomColor(profileUser.has_gold_animation, false)
                    ? getUsernameColorStyle(profileUser.name_color)
                    : {}
                }
              >
                @{profileUser.username}
              </CardTitle>
              {profileUser.custom_title && (
                <p className="text-sm text-muted-foreground italic mt-1">{profileUser.custom_title}</p>
              )}
              <CardDescription>Member since {new Date(profileUser.created_at).toLocaleDateString()}</CardDescription>

              {!isOwnProfile && (
                <div className="flex gap-2 mt-4">
                  <Button onClick={startDM} size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send DM
                  </Button>

                  {friendshipStatus === null && (
                    <Button onClick={sendFriendRequest} variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friend
                    </Button>
                  )}

                  {friendshipStatus === "pending" && (
                    <Button variant="outline" size="sm" disabled>
                      Friend Request Sent
                    </Button>
                  )}

                  {friendshipStatus === "accepted" && (
                    <Button variant="outline" size="sm" disabled>
                      Friends
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Bio</Label>
              {isOwnProfile && !editMode && (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  Edit
                </Button>
              )}
            </div>

            {editMode && isOwnProfile ? (
              <div className="space-y-2">
                <Textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{editBio.length}/500 characters</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditMode(false)
                        setEditBio(profileUser.bio || "")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveBio} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[100px] p-3 bg-muted rounded-md">
                {profileUser.bio ? (
                  <p className="whitespace-pre-wrap">{profileUser.bio}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    {isOwnProfile ? "Add a bio to tell others about yourself" : "No bio yet"}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
