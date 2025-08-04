"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Users, Search, Check, X, MessageCircle, Loader2 } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: string
  requester_username: string
  addressee_username: string
  requester_name_color?: string
  addressee_name_color?: string
  requester_has_gold: boolean
  addressee_has_gold: boolean
  created_at: string
}

interface SearchUser {
  id: string
  username: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
}

interface FriendsPageProps {
  onStartDM?: (userId: string, username: string) => void
}

export function FriendsPage({ onStartDM }: FriendsPageProps) {
  const { user } = useUser()
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchFriendships()
    }
  }, [user])

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const fetchFriendships = async () => {
    try {
      const response = await fetch("/api/friends", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setFriendships(data.friendships || [])
      } else {
        console.error("Failed to fetch friendships")
      }
    } catch (error) {
      console.error("Friendships fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users || [])
      } else {
        console.error("Failed to search users")
        setSearchResults([])
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const sendFriendRequest = async (friendId: string) => {
    setActionLoading(friendId)
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ friendId }),
      })

      if (response.ok) {
        await fetchFriendships()
        setSearchQuery("")
        setSearchResults([])
      } else {
        const errorData = await response.json()
        console.error("Failed to send friend request:", errorData.error)
      }
    } catch (error) {
      console.error("Friend request error:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const respondToFriendRequest = async (friendshipId: string, status: string) => {
    setActionLoading(friendshipId)
    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchFriendships()
      } else {
        console.error("Failed to respond to friend request")
      }
    } catch (error) {
      console.error("Friend response error:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const startDM = (userId: string, username: string) => {
    onStartDM?.(userId, username)
  }

  const getFriendInfo = (friendship: Friendship) => {
    if (!user) return null

    const isRequester = friendship.requester_id === user.id
    return {
      id: isRequester ? friendship.addressee_id : friendship.requester_id,
      username: isRequester ? friendship.addressee_username : friendship.requester_username,
      nameColor: isRequester ? friendship.addressee_name_color : friendship.requester_name_color,
      hasGold: isRequester ? friendship.addressee_has_gold : friendship.requester_has_gold,
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "accepted":
        return <Badge variant="default">Friends</Badge>
      case "blocked":
        return <Badge variant="destructive">Blocked</Badge>
      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const pendingRequests = friendships.filter((f) => f.status === "pending" && f.addressee_id === user.id)
  const sentRequests = friendships.filter((f) => f.status === "pending" && f.requester_id === user.id)
  const acceptedFriends = friendships.filter((f) => f.status === "accepted")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Friends
          </CardTitle>
          <CardDescription>Search for users to send friend requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {searchResults.map((searchUser) => {
                const existingFriendship = friendships.find(
                  (f) =>
                    (f.requester_id === user.id && f.addressee_id === searchUser.id) ||
                    (f.addressee_id === user.id && f.requester_id === searchUser.id),
                )

                return (
                  <div key={searchUser.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div
                        className={getUsernameClassName(false, searchUser.has_gold_animation, !!searchUser.name_color)}
                        style={
                          shouldApplyCustomColor(searchUser.has_gold_animation, false)
                            ? getUsernameColorStyle(searchUser.name_color)
                            : {}
                        }
                      >
                        @{searchUser.username}
                      </div>
                      {searchUser.custom_title && (
                        <div className="text-xs text-gray-500 italic">{searchUser.custom_title}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {existingFriendship ? (
                        getStatusBadge(existingFriendship.status)
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => sendFriendRequest(searchUser.id)}
                          disabled={actionLoading === searchUser.id}
                        >
                          {actionLoading === searchUser.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Friend Requests</CardTitle>
            <CardDescription>People who want to be your friend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingRequests.map((friendship) => {
                const friendInfo = getFriendInfo(friendship)
                if (!friendInfo) return null

                return (
                  <div key={friendship.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div
                      className={getUsernameClassName(false, friendInfo.hasGold, !!friendInfo.nameColor)}
                      style={
                        shouldApplyCustomColor(friendInfo.hasGold, false)
                          ? getUsernameColorStyle(friendInfo.nameColor)
                          : {}
                      }
                    >
                      @{friendInfo.username}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => respondToFriendRequest(friendship.id, "accepted")}
                        disabled={actionLoading === friendship.id}
                      >
                        {actionLoading === friendship.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondToFriendRequest(friendship.id, "blocked")}
                        disabled={actionLoading === friendship.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {sentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sent Requests</CardTitle>
            <CardDescription>Friend requests you've sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sentRequests.map((friendship) => {
                const friendInfo = getFriendInfo(friendship)
                if (!friendInfo) return null

                return (
                  <div key={friendship.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div
                      className={getUsernameClassName(false, friendInfo.hasGold, !!friendInfo.nameColor)}
                      style={
                        shouldApplyCustomColor(friendInfo.hasGold, false)
                          ? getUsernameColorStyle(friendInfo.nameColor)
                          : {}
                      }
                    >
                      @{friendInfo.username}
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {acceptedFriends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Friends ({acceptedFriends.length})
            </CardTitle>
            <CardDescription>Your accepted friends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {acceptedFriends.map((friendship) => {
                const friendInfo = getFriendInfo(friendship)
                if (!friendInfo) return null

                return (
                  <div key={friendship.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div
                      className={getUsernameClassName(false, friendInfo.hasGold, !!friendInfo.nameColor)}
                      style={
                        shouldApplyCustomColor(friendInfo.hasGold, false)
                          ? getUsernameColorStyle(friendInfo.nameColor)
                          : {}
                      }
                    >
                      @{friendInfo.username}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => startDM(friendInfo.id, friendInfo.username)}>
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  )
}
