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
      <>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4" />
            Latest Poll
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4 text-xs text-muted-foreground">Loading...</div>
        </CardContent>
      </>
    )
  }

  if (!poll) {
    return (
      <>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4" />
            Latest Poll
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4">
            <BarChart3 className="h-6 w-6 mx-auto mb-2 opacity-30 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No polls available</p>
            <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" onClick={onViewAllPolls}>
              View All Polls
            </Button>
          </div>
        </CardContent>
      </>
    )
  }

  const hasVoted = poll.user_response !== undefined
  const expired = isExpired(poll.expires_at)

  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4" />
            Latest Poll
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAllPolls} className="text-xs h-6 px-2">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div>
          <h4 className="font-medium text-xs">{poll.title}</h4>
          {poll.description && <p className="text-xs text-muted-foreground/60 mt-1">{poll.description}</p>}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {poll.is_public ? <Globe className="h-3 w-3" /> : <Users className="h-3 w-3" />}
          <span>{poll.total_responses} votes</span>
          {poll.expires_at && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className={expired ? "text-red-500" : ""}>
                {expired ? "Expired" : `${formatTime(poll.expires_at)}`}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          {poll.options.slice(0, 2).map((option, index) => {
            const result = poll.results.find((r) => r.option_index === index)
            const count = result?.count || 0
            const percentage = getPercentage(count, poll.total_responses)
            const isSelected = poll.user_response === index

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`flex-1 justify-start text-xs h-6 px-2 ${
                      isSelected ? "bg-foreground text-background" : ""
                    }`}
                    onClick={() => !hasVoted && !expired && !voting && handleVote(index)}
                    disabled={hasVoted || expired || voting}
                  >
                    <span className="flex-1 text-left truncate">{option}</span>
                  </Button>
                  {hasVoted && (
                    <span className="text-xs text-muted-foreground min-w-[35px] text-right">
                      {percentage}%
                    </span>
                  )}
                </div>
                {hasVoted && (
                  <div className="w-full bg-muted/30 rounded-full h-0.5">
                    <div
                      className={`h-0.5 rounded-full transition-all duration-500 ${
                        isSelected ? "bg-foreground" : "bg-muted-foreground/40"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
          {poll.options.length > 2 && (
            <p className="text-xs text-muted-foreground/60 text-center">+{poll.options.length - 2} more</p>
          )}
        </div>
      </CardContent>
    </>
  )
}
