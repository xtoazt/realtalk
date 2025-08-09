"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Camera, UserPlus, MessageCircle, Snowflake, SnowflakeIcon, Unlock, MessageSquare } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import Image from "next/image"

interface ProfileUser {
  id: string
  username: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  profile_picture?: string
  bio?: string
  signup_code?: string
}

interface ProfilePageProps {
  userId?: string // If provided, show another user's profile
  onStartDM?: (userId: string, username: string) => void
  onSendFriendRequest?: (userId: string) => void
}

export function ProfilePage({ userId, onStartDM, onSendFriendRequest }: ProfilePageProps) {
  const { user: currentUser, setUser: updateCurrentUser } = useUser()
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showFreezeDialog, setShowFreezeDialog] = useState(false)
  const [freezeMsg, setFreezeMsg] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)

  // Form state
  const [bio, setBio] = useState("")
  const [profilePicture, setProfilePicture] = useState("")

  const isOwnProfile = !userId || userId === currentUser?.id
  const isGold = Boolean(currentUser?.has_gold_animation)

  useEffect(() => {
    const fetchProfile = async () => {
      if (isOwnProfile && currentUser) {
        setProfileUser(currentUser)
        setBio(currentUser.bio || "")
        setProfilePicture(currentUser.profile_picture || "")
      } else if (userId) {
        try {
          const response = await fetch(`/api/users/${userId}`)
          if (response.ok) {
            const data = await response.json()
            setProfileUser(data.user)
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error)
        }
      }
      setLoading(false)
    }

    fetchProfile()
  }, [userId, currentUser, isOwnProfile])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const response = await fetch(`/api/upload-image?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      })

      if (response.ok) {
        const blob = await response.json()
        setProfilePicture(blob.url)
      } else {
        const errorData = await response.json()
        alert(`Failed to upload image: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Image upload error:", error)
      alert("An unexpected error occurred during image upload.")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!isOwnProfile) return

    setSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_picture: profilePicture || null,
          bio: bio.trim() || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        updateCurrentUser(data.user)
        setProfileUser(data.user)
        setEditing(false)
      } else {
        const errorData = await response.json()
        alert(`Failed to update profile: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("An unexpected error occurred while updating profile.")
    } finally {
      setSaving(false)
    }
  }

  const getUsernameStyle = (user: ProfileUser) => {
    if (user.has_gold_animation) {
      return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse font-medium"
    }
    return user.name_color ? { color: user.name_color } : {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground animate-pulse">Loading profile...</div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{isOwnProfile ? "Your Profile" : `@${profileUser.username}'s Profile`}</h2>
        {isOwnProfile && (
          <Button onClick={() => setEditing(!editing)} variant={editing ? "outline" : "default"}>
            {editing ? "Cancel" : "Edit Profile"}
          </Button>
        )}
      </div>

      <Card className="glass-effect hover-lift animate-fadeIn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {profileUser.profile_picture ? (
                <Image
                  src={profileUser.profile_picture || "/placeholder.svg"}
                  alt={`${profileUser.username}'s profile`}
                  width={100}
                  height={100}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
              {editing && (
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`text-2xl font-bold ${profileUser.has_gold_animation ? getUsernameStyle(profileUser) : ""}`}
                style={!profileUser.has_gold_animation ? getUsernameStyle(profileUser) : {}}
              >
                @{profileUser.username}
              </h3>
              {profileUser.custom_title && (
                <p className="text-sm italic text-muted-foreground mt-1">{profileUser.custom_title}</p>
              )}
              {profileUser.signup_code && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {profileUser.signup_code === "asdf" && "✨ Custom Colors"}
                    {profileUser.signup_code === "qwea" && "👑 Gold Member"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium mb-2 block">Bio</label>
            {editing ? (
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={500}
                className="resize-none"
              />
            ) : (
              <div className="min-h-[100px] p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {profileUser.bio ? (
                  <p className="text-sm whitespace-pre-wrap">{profileUser.bio}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {isOwnProfile ? "Add a bio to tell others about yourself" : "No bio available"}
                  </p>
                )}
              </div>
            )}
            {editing && <p className="text-xs text-muted-foreground mt-1">{bio.length}/500 characters</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {editing ? (
              <>
                <Button onClick={handleSaveProfile} disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </Button>
              </>
            ) : !isOwnProfile ? (
              <>
                <Button onClick={() => onStartDM?.(profileUser.id, profileUser.username)} className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" onClick={() => onSendFriendRequest?.(profileUser.id)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend
                </Button>
                {isGold && (
                  <>
                    <Button variant="destructive" onClick={() => setShowFreezeDialog(true)}>
                      <Snowflake className="h-4 w-4 mr-2" /> Freeze
                    </Button>
                    <Button variant="outline" onClick={async () => {
                      try {
                        await fetch(`/api/freeze?targetUserId=${profileUser.id}`, { method: 'DELETE' })
                        alert('User unfrozen')
                      } catch { alert('Failed to unfreeze') }
                    }}>
                      <Unlock className="h-4 w-4 mr-2" /> Unfreeze
                    </Button>
                  </>
                )}
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Freeze Dialog */}
      {showFreezeDialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-4 border">
            <div className="text-lg font-semibold mb-2">Freeze @{profileUser.username}</div>
            <p className="text-sm text-muted-foreground mb-2">Only gold members can do this. The user will be prevented from typing or using voice.</p>
            <textarea
              className="w-full border rounded p-2 text-sm mb-3"
              rows={3}
              placeholder="Optional message shown on their screen"
              value={freezeMsg}
              onChange={(e) => setFreezeMsg(e.target.value)}
            />
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" onClick={() => setShowFreezeDialog(false)}>Cancel</Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const txt = prompt('Popup message to show immediately (optional)') || ''
                    if (!txt) return
                    try {
                      await fetch('/api/freeze/popup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId: profileUser.id, popupMessage: txt }) })
                      alert('Popup sent')
                    } catch { alert('Failed to send popup') }
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-1" /> Send Popup
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      const r = await fetch('/api/freeze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId: profileUser.id, message: freezeMsg }) })
                      if (r.ok) {
                        alert('User frozen')
                        setShowFreezeDialog(false)
                        setFreezeMsg('')
                      } else {
                        const d = await r.json(); alert(d.error || 'Failed to freeze')
                      }
                    } catch { alert('Failed to freeze') }
                  }}
                >
                  <SnowflakeIcon className="h-4 w-4 mr-1" /> Confirm Freeze
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
