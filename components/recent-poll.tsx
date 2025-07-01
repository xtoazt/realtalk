"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Globe, Clock } from "lucide-react"

interface Poll {
  id: string
  title: string
  description?: string
  options: string[]
  is_public: boolean
  expires_at?: string
  created_at: string
  user_response?: number
  results: { option_index: number; count: number }[]
  total_responses: number
}

interface RecentPollProps {
  currentUserId: string
  onViewAllPolls: () => void
}

export function RecentPoll({ currentUserId, onViewAllPolls }: RecentPollProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRecentPoll = useCallback(async () => {
    try {
      const response = await fetch(`/api/polls/recent?userId=${currentUserId}`)
      if (response.ok) {
        const data = await response.json()
        setPoll(data.poll)
      }
    } catch (error) {
      console.error("Failed to fetch recent poll:", error)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    fetchRecentPoll()
  }, [fetchRecentPoll])

  const handleVote = async (optionIndex: number) => {
    if (!poll) return

    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_index: optionIndex }),
      })

      if (response.ok) {
        fetchRecentPoll()
      }
    } catch (error) {
      console.error("Failed to vote:", error)
    }
  }

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card className="animate-fadeIn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Your Latest Poll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (!poll) {
    return (
      <Card className="animate-fadeIn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Your Latest Poll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No polls created yet</p>
            <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={onViewAllPolls}>
              Create Your First Poll
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasVoted = poll.user_response !== undefined
  const expired = isExpired(poll.expires_at)

  return (
    <Card className={`animate-fadeIn ${expired ? "opacity-75" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Your Latest Poll
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAllPolls} className="text-xs">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-sm">{poll.title}</h4>
          {poll.description && <p className="text-xs text-muted-foreground mt-1">{poll.description}</p>}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {poll.is_public ? <Globe className="h-3 w-3" /> : <Users className="h-3 w-3" />}
          <span>{poll.total_responses} responses</span>
          {poll.expires_at && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className={expired ? "text-red-500" : ""}>
                {expired ? "Expired" : `Expires ${formatTime(poll.expires_at)}`}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {poll.options.slice(0, 2).map((option, index) => {
            const result = poll.results.find((r) => r.option_index === index)
            const count = result?.count || 0
            const percentage = poll.total_responses > 0 ? (count / poll.total_responses) * 100 : 0
            const isSelected = poll.user_response === index

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="flex-1 justify-start text-xs h-7"
                    onClick={() => !hasVoted && !expired && handleVote(index)}
                    disabled={hasVoted || expired}
                  >
                    {option}
                  </Button>
                  {hasVoted && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  )}
                </div>
                {hasVoted && (
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${
                        isSelected ? "bg-primary" : "bg-gray-400"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
          {poll.options.length > 2 && (
            <p className="text-xs text-muted-foreground text-center">+{poll.options.length - 2} more options</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
