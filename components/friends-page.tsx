"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Search, Check, X, MessageCircle } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface Friend {
  id: string
  username: string
  name_color?: string
  has_gold_animation?: boolean
  custom_title?: string
  status: "pending_sent" | "pending_received" | "accepted"
  created_at: string
}

interface FriendsPageProps {
  currentUserId: string
  onStartDM: (userId: string, username: string) => void
}

export function FriendsPage({ currentUserId, onStartDM }: FriendsPageProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newFriendUsername, setNewFriendUsername] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState(false)

  const fetchFriends = useCallback(async () => {
    try {
      const response = await fetch("/api/friends")
      if (response.ok) {
        const data = await response.json()
        setFriends(data.friends)
      }
    } catch (error) {
      console.error("Failed to fetch friends:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFriends()
  }, [fetchFriends])

  const sendFriendRequest = async () => {
    if (!newFriendUsername.trim() || sendingRequest) return

    setSendingRequest(true)
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newFriendUsername.trim() }),
      })

      if (response.ok) {
        setNewFriendUsername("")
        await fetchFriends()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to send friend request")
      }
    } catch (error) {
      console.error("Failed to send friend request:", error)
      alert("Failed to send friend request")
    } finally {
      setSendingRequest(false)
    }
  }

  const handleFriendRequest = async (friendId: string, action: "accept" | "reject") => {
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        await fetchFriends()
      } else {
        const error = await response.json()
        alert(error.error || `Failed to ${action} friend request`)
      }
    } catch (error) {
      console.error(`Failed to ${action} friend request:`, error)
      alert(`Failed to ${action} friend request`)
    }
  }

  const getFilteredFriends = (status: string) => {
    return friends
      .filter((friend) => {
        if (status === "all") return friend.status === "accepted"
        return friend.status === status
      })
      .filter((friend) => (searchTerm ? friend.username.toLowerCase().includes(searchTerm.toLowerCase()) : true))
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading friends...</p>
        </div>
      </div>
    )
  }

  const acceptedFriends = getFilteredFriends("all")
  const pendingReceived = getFilteredFriends("pending_received")
  const pendingSent = getFilteredFriends("pending_sent")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Friends
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Friend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={newFriendUsername}
              onChange={(e) => setNewFriendUsername(e.target.value)}
              placeholder="Enter username"
              onKeyPress={(e) => e.key === "Enter" && sendFriendRequest()}
            />
            <Button onClick={sendFriendRequest} disabled={!newFriendUsername.trim() || sendingRequest}>
              {sendingRequest ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search friends..."
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            Friends
            {acceptedFriends.length > 0 && <Badge variant="secondary">{acceptedFriends.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending
            {pendingReceived.length > 0 && <Badge variant="destructive">{pendingReceived.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            Sent
            {pendingSent.length > 0 && <Badge variant="outline">{pendingSent.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-2">
          {acceptedFriends.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No friends yet</h3>
                <p className="text-gray-500 text-center">
                  {searchTerm ? "No friends match your search" : "Add some friends to get started!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            acceptedFriends.map((friend) => (
              <Card key={friend.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={getUsernameClassName(false, friend.has_gold_animation, !!friend.name_color)}
                            style={
                              shouldApplyCustomColor(friend.has_gold_animation, false)
                                ? getUsernameColorStyle(friend.name_color)
                                : {}
                            }
                          >
                            {friend.username}
                          </span>
                          {friend.custom_title && (
                            <span className="text-xs text-gray-500 italic">{friend.custom_title}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Friends since {formatDate(friend.created_at)}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onStartDM(friend.id, friend.username)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-2">
          {pendingReceived.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserPlus className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No pending requests</h3>
                <p className="text-gray-500 text-center">Friend requests will appear here</p>
              </CardContent>
            </Card>
          ) : (
            pendingReceived.map((friend) => (
              <Card key={friend.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-medium">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={getUsernameClassName(false, friend.has_gold_animation, !!friend.name_color)}
                            style={
                              shouldApplyCustomColor(friend.has_gold_animation, false)
                                ? getUsernameColorStyle(friend.name_color)
                                : {}
                            }
                          >
                            {friend.username}
                          </span>
                          {friend.custom_title && (
                            <span className="text-xs text-gray-500 italic">{friend.custom_title}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Sent request on {formatDate(friend.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleFriendRequest(friend.id, "accept")}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleFriendRequest(friend.id, "reject")}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-2">
          {pendingSent.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserPlus className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No sent requests</h3>
                <p className="text-gray-500 text-center">Requests you send will appear here</p>
              </CardContent>
            </Card>
          ) : (
            pendingSent.map((friend) => (
              <Card key={friend.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={getUsernameClassName(false, friend.has_gold_animation, !!friend.name_color)}
                            style={
                              shouldApplyCustomColor(friend.has_gold_animation, false)
                                ? getUsernameColorStyle(friend.name_color)
                                : {}
                            }
                          >
                            {friend.username}
                          </span>
                          {friend.custom_title && (
                            <span className="text-xs text-gray-500 italic">{friend.custom_title}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Request sent on {formatDate(friend.created_at)}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
