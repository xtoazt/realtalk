"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Edit, Save, X, Calendar, MessageCircle, UserPlus } from "lucide-react"
import Image from "next/image"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface ProfileUser {
  id: string
  username: string
  email?: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  profile_picture?: string
  bio?: string
  created_at: string
  signup_code?: string
}

interface ProfilePageProps {
  userId: string
  currentUserId: string
  onStartDM?: (userId: string, username: string) => void
  onAddFriend?: (username: string) => void
}

export function ProfilePage({ userId, currentUserId, onStartDM, onAddFriend }: ProfilePageProps) {
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Edit form state
  const [editBio, setEditBio] = useState("")
  const [editCustomTitle, setEditCustomTitle] = useState("")

  const isOwnProfile = userId === currentUserId

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProfileUser(data.user)
        setEditBio(data.user.bio || "")
        setEditCustomTitle(data.user.custom_title || "")
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSaveProfile = async () => {
    if (!profileUser || saving) return

    setSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: editBio.trim() || null,
          custom_title: editCustomTitle.trim() || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfileUser(data.user)
        setEditing(false)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || uploadingImage) return

    const formData = new FormData()
    formData.append("image", file)

    setUploadingImage(true)
    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()

        // Update profile with new image
        const updateResponse = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_picture: data.url }),
        })

        if (updateResponse.ok) {
          const updateData = await updateResponse.json()
          setProfileUser(updateData.user)
        }
      } else {
        const error = await response.json()
        alert(error.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
      alert("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const formatJoinDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">User not found</h3>
          <p className="text-gray-500 text-center">This user profile could not be loaded</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6" />
          Profile
        </h2>
        {isOwnProfile && (
          <Button
            variant={editing ? "outline" : "default"}
            onClick={() => {
              if (editing) {
                setEditBio(profileUser.bio || "")
                setEditCustomTitle(profileUser.custom_title || "")
              }
              setEditing(!editing)
            }}
          >
            {editing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {profileUser.profile_picture ? (
                  <Image
                    src={profileUser.profile_picture || "/placeholder.svg"}
                    alt={`${profileUser.username}'s profile`}
                    width={120}
                    height={120}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-30 h-30 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {profileUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-image-upload"
                    disabled={uploadingImage}
                  />
                  <Label
                    htmlFor="profile-image-upload"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                  >
                    {uploadingImage ? "Uploading..." : "Change Photo"}
                  </Label>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-2xl ${getUsernameClassName(false, profileUser.has_gold_animation, !!profileUser.name_color)}`}
                    style={
                      shouldApplyCustomColor(profileUser.has_gold_animation, false)
                        ? getUsernameColorStyle(profileUser.name_color)
                        : {}
                    }
                  >
                    {profileUser.username}
                  </span>
                  {profileUser.signup_code === "asdf" && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    >
                      Gold Member
                    </Badge>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="customTitle">Custom Title</Label>
                      <Input
                        id="customTitle"
                        value={editCustomTitle}
                        onChange={(e) => setEditCustomTitle(e.target.value)}
                        placeholder="Enter a custom title"
                        maxLength={50}
                      />
                    </div>
                  </div>
                ) : (
                  profileUser.custom_title && (
                    <p className="text-gray-600 dark:text-gray-400 italic">{profileUser.custom_title}</p>
                  )
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</Label>
                {editing ? (
                  <Textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    rows={4}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{profileUser.bio || "No bio provided"}</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatJoinDate(profileUser.created_at)}</span>
              </div>

              {editing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}

              {!isOwnProfile && (
                <div className="flex gap-2 pt-4">
                  {onStartDM && (
                    <Button onClick={() => onStartDM(profileUser.id, profileUser.username)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  )}
                  {onAddFriend && (
                    <Button variant="outline" onClick={() => onAddFriend(profileUser.username)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friend
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
