"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, MessageCircle, UserPlus, Save, Calendar } from "lucide-react"
import { useUser } from "@/hooks/use-user"

interface ProfileUser {
  id: string
  username: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  profile_picture?: string
  bio?: string
  created_at: string
}

interface FriendshipStatus {
  status: string
  canSendRequest: boolean
}

interface ProfilePageProps {
  userId?: string
  onStartDM?: (userId: string) => void
}

export function ProfilePage({ userId, onStartDM }: ProfilePageProps) {
  const { user: currentUser } = useUser()
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [friendship, setFriendship] = useState<FriendshipStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bio, setBio] = useState("")
  const [profilePicture, setProfilePicture] = useState("")

  const isOwnProfile = !userId || userId === currentUser?.id

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const targetUserId = userId || currentUser?.id
        if (!targetUserId) return

        if (isOwnProfile && currentUser) {
          setProfileUser(currentUser as ProfileUser)
          setBio(currentUser.bio || "")
          setProfilePicture(currentUser.profile_picture || "")
        } else {
          const response = await fetch(`/api/users/${targetUserId}`)
          if (response.ok) {
            const data = await response.json()
            setProfileUser(data.user)
            setFriendship(data.friendship)
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, currentUser, isOwnProfile])

  const handleSaveProfile = async () => {
    if (!isOwnProfile) return

    setSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: bio.trim() || null,
          profile_picture: profilePicture.trim() || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfileUser(data.user)
        setEditing(false)
      } else {
        const errorData = await response.json()
        alert(`Failed to update profile: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleSendFriendRequest = async () => {
    if (!profileUser || !friendship?.canSendRequest) return

    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressee_id: profileUser.id }),
      })

      if (response.ok) {
        setFriendship({ status: "pending", canSendRequest: false })
      } else {
        const errorData = await response.json()
        alert(`Failed to send friend request: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Failed to send friend request:", error)
      alert("An unexpected error occurred")
    }
  }

  const getUsernameStyle = (nameColor?: string, hasGold?: boolean) => {
    if (hasGold) {
      return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse font-medium"
    }
    return nameColor ? { color: nameColor } : {}
  }

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
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
    <div className="space-y-6 relative z-10">
      <Card className="glass-effect hover-lift animate-fadeIn">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profileUser.profile_picture || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">{profileUser.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1
                    className="text-2xl font-bold"
                    style={getUsernameStyle(profileUser.name_color, profileUser.has_gold_animation)}
                  >
                    @{profileUser.username}
                  </h1>
                  {profileUser.custom_title && (
                    <p className="text-sm text-muted-foreground mt-1">{profileUser.custom_title}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Button
                      onClick={() => setEditing(!editing)}
                      variant="outline"
                      className="hover-lift bg-transparent"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {editing ? "Cancel" : "Edit Profile"}
                    </Button>
                  ) : (
                    <>
                      {friendship?.canSendRequest && (
                        <Button onClick={handleSendFriendRequest} className="hover-glow">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friend
                        </Button>
                      )}
                      {friendship?.status === "accepted" && onStartDM && (
                        <Button
                          onClick={() => onStartDM(profileUser.id)}
                          variant="outline"
                          className="hover-lift bg-transparent"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      )}
                      {friendship?.status === "pending" && (
                        <Button disabled variant="outline">
                          Request Sent
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Profile Picture URL</label>
                <Input
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  placeholder="https://example.com/your-image.jpg"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={500}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">{bio.length}/500 characters</p>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="hover-glow">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {profileUser.bio ? (
                <div>
                  <h3 className="font-medium mb-2">About</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{profileUser.bio}</p>
                </div>
              ) : isOwnProfile ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No bio yet. Click "Edit Profile" to add one!</p>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>This user hasn't added a bio yet.</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatJoinDate(profileUser.created_at)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
