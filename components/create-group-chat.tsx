"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

interface Friend {
  friend_id: string
  friend_username: string
  friend_name_color?: string
  friend_has_gold?: boolean
}

interface CreateGroupChatProps {
  onClose: () => void
  onCreate: (name: string, memberIds: string[]) => void
}

export function CreateGroupChat({ onClose, onCreate }: CreateGroupChatProps) {
  const [groupName, setGroupName] = useState("")
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends/accepted")
      if (response.ok) {
        const data = await response.json()
        setFriends(data.friends)
      }
    } catch (error) {
      console.error("Failed to fetch friends:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends((prev) => (prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]))
  }

  const handleCreate = () => {
    if (groupName.trim()) {
      onCreate(groupName.trim(), selectedFriends)
    }
  }

  const getUsernameStyle = (nameColor?: string, hasGold?: boolean) => {
    if (hasGold) {
      return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse font-medium"
    }
    return nameColor ? { color: nameColor } : {}
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create Group Chat</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Group chat name" />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Add Friends</h4>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading friends...</div>
            ) : friends.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No friends to add</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {friends.map((friend) => (
                  <div key={friend.friend_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={friend.friend_id}
                      checked={selectedFriends.includes(friend.friend_id)}
                      onCheckedChange={() => handleFriendToggle(friend.friend_id)}
                    />
                    <label
                      htmlFor={friend.friend_id}
                      className="text-sm cursor-pointer"
                      style={!friend.friend_has_gold ? getUsernameStyle(friend.friend_name_color) : {}}
                    >
                      <span className={getUsernameStyle(friend.friend_name_color, friend.friend_has_gold)}>
                        @{friend.friend_username}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={!groupName.trim()} className="flex-1">
              Create Group
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
