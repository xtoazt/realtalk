"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Check, X, Search, MessageCircle, RefreshCw } from "lucide-react"

interface User {
  id: string
  username: string
  name_color?: string
  has_gold_animation?: boolean
}

interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: string
  requester_username: string
  addressee_username: string
  requester_name_color?: string
  addressee_name_color?: string
  requester_has_gold?: boolean
  addressee_has_gold?: boolean
}

interface FriendsPageProps {
  currentUserId: string
  onStartDM: (friendId: string, friendUsername: string) => void
}

export function FriendsPage({ currentUserId, onStartDM }: FriendsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [sendRequestError, setSendRequestError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  const fetchFriendships = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/friends")
      if (response.ok) {
        const data = await response.json()
        setFriendships(data.friendships)
        setLastUpdate(Date.now())
      } else {
        console.error("Failed to fetch friendships:", response.status, await response.text())
      }
    } catch (error) {
      console.error("Failed to fetch friendships:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFriendships()
    const interval = setInterval(fetchFriendships, 3000)
    return () => clearInterval(interval)
  }, [fetchFriendships])

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSendRequestError(null)
      return
    }

    setSearchLoading(true)
    setSendRequestError(null)
    try {
      console.log("[friends-page] Searching for:", searchQuery)
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`)

      if (response.ok) {
        const data = await response.json()
        console.log("[friends-page] Search results:", data.users)
        setSearchResults(data.users || [])
      } else {
        const errorData = await response.json()
        console.error("Failed to search users:", errorData.error || response.statusText)
        setSendRequestError(errorData.error || "Failed to search users.")
        setSearchResults([])
      }
    } catch (error: any) {
      console.error("Failed to search users:", error)
      setSendRequestError(error.message || "An unexpected error occurred during search.")
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Auto-search as user types (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers()
      } else {
        setSearchResults([])
        setSendRequestError(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const sendFriendRequest = async (userId: string) => {
    setSendRequestError(null)
    try {
      console.log("[friends-page] Sending friend request to:", userId)
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresseeId: userId }),
      })

      if (response.ok) {
        console.log("[friends-page] Friend request sent successfully")
        fetchFriendships()
        // Don't clear search results immediately, let user see the state change
      } else {
        const data = await response.json()
        console.error("Failed to send friend request:", data.error)
        setSendRequestError(data.error || "Failed to send friend request.")
      }
    } catch (error: any) {
      console.error("Failed to send friend request:", error)
      setSendRequestError(error.message || "Something went wrong.")
    }
  }

  const respondToFriendRequest = async (friendshipId: string, status: string) => {
    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchFriendships()
      } else {
        const errorData = await response.json()
        console.error("Failed to respond to friend request:", errorData.error || response.statusText)
        alert(`Failed to respond: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Failed to respond to friend request:", error)
      alert("An unexpected error occurred while responding to request.")
    }
  }

  const getUsernameStyle = (nameColor?: string, hasGold?: boolean) => {
    if (hasGold) {
      return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse font-medium"
    }
    return nameColor ? { color: nameColor } : {}
  }

  const getButtonState = (user: User) => {
    const isAlreadyFriend = acceptedFriends.some((f) => f.requester_id === user.id || f.addressee_id === user.id)
    const hasPendingFromThem = pendingRequests.some((f) => f.requester_id === user.id)
    const hasPendingToThem = sentRequests.some((f) => f.addressee_id === user.id)

    if (isAlreadyFriend) return { text: "Friends", disabled: true, variant: "secondary" as const }
    if (hasPendingFromThem) return { text: "Accept?", disabled: false, variant: "default" as const }
    if (hasPendingToThem) return { text: "Pending", disabled: true, variant: "outline" as const }
    return { text: "Add Friend", disabled: false, variant: "default" as const }
  }

  const pendingRequests = friendships.filter((f) => f.status === "pending" && f.addressee_id === currentUserId)
  const sentRequests = friendships.filter((f) => f.status === "pending" && f.requester_id === currentUserId)
  const acceptedFriends = friendships.filter((f) => f.status === "accepted")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Friends</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Search Users */}
      <Card className="animate-fadeIn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="transition-all duration-200 focus:scale-102"
            />
            {searchLoading && (
              <div className="flex items-center px-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {sendRequestError && (
            <div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md animate-fadeIn">
              {sendRequestError}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2 animate-fadeIn">
              <p className="text-sm text-muted-foreground">Found {searchResults.length} user(s)</p>
              {searchResults.map((user) => {
                const buttonState = getButtonState(user)
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-all duration-200"
                  >
                    <span
                      className={user.has_gold_animation ? getUsernameStyle(undefined, true) : ""}
                      style={!user.has_gold_animation ? getUsernameStyle(user.name_color) : {}}
                    >
                      @{user.username}
                    </span>
                    <Button
                      size="sm"
                      variant={buttonState.variant}
                      onClick={() => sendFriendRequest(user.id)}
                      className="transition-all duration-200 hover:scale-105"
                      disabled={buttonState.disabled}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      {buttonState.text}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {searchQuery.trim() && searchResults.length === 0 && !searchLoading && !sendRequestError && (
            <div className="text-center py-4 text-gray-500">No users found for "{searchQuery}"</div>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="animate-fadeIn border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Friend Requests ({pendingRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingRequests.map((friendship) => (
                <div
                  key={friendship.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-primary/5 animate-slideIn"
                >
                  <span
                    className={friendship.requester_has_gold ? getUsernameStyle(undefined, true) : ""}
                    style={!friendship.requester_has_gold ? getUsernameStyle(friendship.requester_name_color) : {}}
                  >
                    @{friendship.requester_username}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => respondToFriendRequest(friendship.id, "accepted")}
                      className="bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => respondToFriendRequest(friendship.id, "blocked")}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <Card className="animate-fadeIn">
          <CardHeader>
            <CardTitle>Sent Requests ({sentRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sentRequests.map((friendship) => (
                <div key={friendship.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span
                    className={friendship.addressee_has_gold ? getUsernameStyle(undefined, true) : ""}
                    style={!friendship.addressee_has_gold ? getUsernameStyle(friendship.addressee_name_color) : {}}
                  >
                    @{friendship.addressee_username}
                  </span>
                  <span className="text-sm text-muted-foreground animate-pulse">Pending</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card className="animate-fadeIn">
        <CardHeader>
          <CardTitle>Friends ({acceptedFriends.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-4 animate-pulse">Loading friends...</div>
          ) : acceptedFriends.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No friends yet. Start by searching for users above!
            </p>
          ) : (
            <div className="space-y-2">
              {acceptedFriends.map((friendship) => {
                const friend =
                  friendship.requester_id === currentUserId
                    ? {
                        id: friendship.addressee_id,
                        username: friendship.addressee_username,
                        name_color: friendship.addressee_name_color,
                        has_gold: friendship.addressee_has_gold,
                      }
                    : {
                        id: friendship.requester_id,
                        username: friendship.requester_username,
                        name_color: friendship.requester_name_color,
                        has_gold: friendship.requester_has_gold,
                      }

                return (
                  <div
                    key={friendship.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-all duration-200 animate-slideIn"
                  >
                    <span
                      className={friend.has_gold ? getUsernameStyle(undefined, true) : ""}
                      style={!friend.has_gold ? getUsernameStyle(friend.name_color) : {}}
                    >
                      @{friend.username}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => onStartDM(friend.id, friend.username)}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
