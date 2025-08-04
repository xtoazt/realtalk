"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Plus, Search, Loader2 } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface User {
  id: string
  username: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
}

interface CreateGroupChatProps {
  onGroupCreated?: (groupId: string) => void
}

export function CreateGroupChat({ onGroupCreated }: CreateGroupChatProps) {
  const { user } = useUser()
  const [groupName, setGroupName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

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

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const createGroup = async () => {
    if (!groupName.trim()) {
      setError("Group name is required")
      return
    }

    if (selectedUsers.size === 0) {
      setError("Please select at least one user")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/group-chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: groupName,
          memberIds: Array.from(selectedUsers),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGroupName("")
        setSelectedUsers(new Set())
        setSearchQuery("")
        setSearchResults([])
        onGroupCreated?.(data.groupChat.id)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create group chat")
      }
    } catch (error) {
      console.error("Create group error:", error)
      setError("Failed to create group chat")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Create Group Chat
        </CardTitle>
        <CardDescription>Create a new group chat with your friends</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}

        <div>
          <Label htmlFor="groupName">Group Name</Label>
          <Input
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            maxLength={50}
          />
        </div>

        <div>
          <Label htmlFor="userSearch">Add Members</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="userSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
            {searchResults.map((searchUser) => (
              <div key={searchUser.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`user-${searchUser.id}`}
                  checked={selectedUsers.has(searchUser.id)}
                  onCheckedChange={() => toggleUserSelection(searchUser.id)}
                />
                <label htmlFor={`user-${searchUser.id}`} className="flex-1 cursor-pointer">
                  <span
                    className={getUsernameClassName(false, searchUser.has_gold_animation, !!searchUser.name_color)}
                    style={
                      shouldApplyCustomColor(searchUser.has_gold_animation, false)
                        ? getUsernameColorStyle(searchUser.name_color)
                        : {}
                    }
                  >
                    @{searchUser.username}
                  </span>
                  {searchUser.custom_title && (
                    <span className="text-xs text-gray-500 ml-2 italic">{searchUser.custom_title}</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        )}

        {selectedUsers.size > 0 && (
          <div className="text-sm text-gray-600">
            Selected: {selectedUsers.size} user{selectedUsers.size !== 1 ? "s" : ""}
          </div>
        )}

        <Button onClick={createGroup} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
