"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Users, Hash } from "lucide-react"

interface JoinGroupChatProps {
  onClose: () => void
  onJoinSuccess: (groupChat: any) => void
}

export function JoinGroupChat({ onClose, onJoinSuccess }: JoinGroupChatProps) {
  const [shortCode, setShortCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shortCode.trim()) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/group-chats/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortCode: shortCode.trim().toUpperCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        onJoinSuccess(data.groupChat)
        onClose()
      } else {
        setError(data.error || "Failed to join group chat")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Join Group Chat
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Enter Group Code
              </label>
              <Input
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                maxLength={6}
                className="text-center text-lg font-mono tracking-wider"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                6-character code provided by the group creator
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!shortCode.trim() || loading}
                className="flex-1"
              >
                {loading ? "Joining..." : "Join Group"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
