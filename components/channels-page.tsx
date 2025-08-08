"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Hash, Lock } from "lucide-react"

interface Channel {
  id: string
  name: string
  creator_id: string
  is_system: boolean
  created_at: string
}

interface ChannelsPageProps {
  currentUserId: string
  userSignupCode?: string
  onSelectChannel: (channelId: string, channelName: string) => void
}

export function ChannelsPage({ currentUserId, userSignupCode, onSelectChannel }: ChannelsPageProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const canCreate = userSignupCode === "qwea"

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/channels")
      if (res.ok) {
        const data = await res.json()
        setChannels(data.channels)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  const systemChannels = useMemo(() => channels.filter((c) => c.is_system), [channels])
  const userChannels = useMemo(() => channels.filter((c) => !c.is_system), [channels])

  const handleCreate = async () => {
    if (!canCreate || !newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (res.ok) {
        setNewName("")
        fetchChannels()
      } else {
        const err = await res.json().catch(() => ({}))
        alert(`Failed to create channel: ${err.error || res.statusText}`)
      }
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground animate-pulse">Loading channels...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Channels</h2>
        {canCreate && (
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Create a new channel"
              className="w-48"
            />
            <Button onClick={handleCreate} disabled={!newName.trim() || creating} className="hover-glow">
              <Plus className="h-4 w-4 mr-1" /> Create
            </Button>
          </div>
        )}
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Default</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {systemChannels.length === 0 ? (
            <p className="text-muted-foreground text-sm">No channels.</p>
          ) : (
            systemChannels.map((ch) => (
              <Button
                key={ch.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onSelectChannel(ch.id, ch.name)}
              >
                <Hash className="h-4 w-4 mr-2" /> {ch.name}
              </Button>
            ))
          )}
        </CardContent>
      </Card>

      {userChannels.length > 0 && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Created by Gold users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {userChannels.map((ch) => (
              <Button
                key={ch.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onSelectChannel(ch.id, ch.name)}
              >
                <Hash className="h-4 w-4 mr-2" /> {ch.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}


