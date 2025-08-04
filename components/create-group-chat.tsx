"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Plus, Search, X } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface User {
  id: string
  username: string
  name_color?: string
  has_gold_animation?: boolean
  custom_title?: string
}

interface CreateGroupChatProps {
  currentUserId: string
  onCreateGroup: (name: string, memberIds: string[]) => void
  onCancel: () => void
}

export function CreateGroupChat({ currentUserId, onCreateGroup, onCancel }: CreateGroupChatProps) {
  const [groupName, setGroupName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (searchTerm.trim()) {
      searchUsers()
    } else {
      setUsers([])
    }
  }, [searchTerm])

  const searchUsers = async () => {
    setSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users.filter((user: User) => user.id !== currentUserId))
      }
    } catch (error) {
      console.error("Failed to search users:", error)
    } finally {
      setSearching(false)
    }
  }

  const handleUserToggle = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.size === 0) return

    setLoading(true)
    try {
      await onCreateGroup(groupName.trim(), Array.from(selectedUsers))
    } catch (error) {
      console.error("Failed to create group:", error)
    } finally {
      setLoading(false)
    }
  }

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>
        </div>

        {selectedUsers.size > 0 && (
          <div>
            <Label>Selected Members ({selectedUsers.size})</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Array.from(selectedUsers).map((userId) => {
                const user = users.find((u) => u.id === userId)
                if (!user) return null
                return (
                  <div
                    key={userId}
                    className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full text-sm"
                  >
                    <span
                      className={getUsernameClassName(false, user.has_gold_animation, !!user.name_color)}
                      style={
                        shouldApplyCustomColor(user.has_gold_animation, false)
                          ? getUsernameColorStyle(user.name_color)
                          : {}
                      }
                    >
                      {user.username}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-500/20"
                      onClick={() => handleUserToggle(userId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {searchTerm && (
          <div className="max-h-48 overflow-y-auto border rounded-md">
            {searching ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No users found</div>
            ) : (
              <div className="space-y-1 p-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                  >
                    <Checkbox
                      id={user.id}
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <div className="flex-1">
                      <span
                        className={getUsernameClassName(false, user.has_gold_animation, !!user.name_color)}
                        style={
                          shouldApplyCustomColor(user.has_gold_animation, false)
                            ? getUsernameColorStyle(user.name_color)
                            : {}
                        }
                      >
                        {user.username}
                      </span>
                      {user.custom_title && <span className="text-xs text-gray-500 ml-2">{user.custom_title}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.size === 0 || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
