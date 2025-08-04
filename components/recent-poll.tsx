"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Globe, Clock, Vote } from "lucide-react"

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
  const [voting, setVoting] = useState(false)

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
    if (!poll || voting) return

    setVoting(true)
    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_index: optionIndex }),
      })

      if (response.ok) {
        await fetchRecentPoll() // Refresh to get updated results
      } else {
        const errorData = await response.json()
        console.error("Failed to vote:", errorData.error)
      }
    } catch (error) {
      console.error("Failed to vote:", error)
    } finally {
      setVoting(false)
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

  const getPercentage = (count: number, total: number) => {
    if (total === 0) return 0
    return Math.round((count / total) * 100)
  }

  if (loading) {
    return (
      <Card className="glass-effect animate-fadeIn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Latest Poll
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
      <Card className="glass-effect animate-fadeIn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Latest Poll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No polls available</p>
            <Button variant="outline" size="sm" className="mt-2 bg-transparent hover-lift" onClick={onViewAllPolls}>
              View All Polls
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasVoted = poll.user_response !== undefined
  const expired = isExpired(poll.expires_at)

  return (
    <Card className={`glass-effect animate-fadeIn hover-lift ${expired ? "opacity-75" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Latest Poll
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAllPolls} className="text-xs hover-lift">
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
          {poll.is_public ? <Globe className="h-3 w-3 hue-accent" /> : <Users className="h-3 w-3" />}
          <Vote className="h-3 w-3" />
          <span>{poll.total_responses} votes</span>
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
            const percentage = getPercentage(count, poll.total_responses)
            const isSelected = poll.user_response === index

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`flex-1 justify-start text-xs h-7 hover-lift transition-all duration-200 ${
                      isSelected ? "hue-shadow" : ""
                    }`}
                    onClick={() => !hasVoted && !expired && !voting && handleVote(index)}
                    disabled={hasVoted || expired || voting}
                  >
                    <span className="flex-1 text-left">{option}</span>
                    {voting && (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-1" />
                    )}
                  </Button>
                  {hasVoted && (
                    <span className="text-xs text-muted-foreground ml-2 min-w-[45px] text-right">
                      {count} ({percentage}%)
                    </span>
                  )}
                </div>
                {hasVoted && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all duration-500 ${
                        isSelected ? "hue-bg" : "bg-gray-400 dark:bg-gray-600"
                      }`}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: isSelected ? `hsl(var(--hue) 50% 50%)` : undefined,
                      }}
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

        {!hasVoted && !expired && (
          <p className="text-xs text-muted-foreground text-center opacity-70">Click an option to vote</p>
        )}
      </CardContent>
    </Card>
  )
}
