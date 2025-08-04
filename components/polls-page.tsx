"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Vote, Users, Calendar, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Poll {
  id: string
  question: string
  options: string[]
  votes: number[]
  total_votes: number
  created_by: string
  created_by_username: string
  created_at: string
  user_vote?: number
}

interface PollsPageProps {
  currentUserId: string
  userSignupCode?: string
}

export function PollsPage({ currentUserId, userSignupCode }: PollsPageProps) {
  const { user } = useUser()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [voting, setVoting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Create poll form state
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""],
  })

  useEffect(() => {
    fetchPolls()
  }, [])

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const fetchPolls = async () => {
    try {
      setError(null)
      const response = await fetch("/api/polls/recent", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch polls")
      }

      const data = await response.json()
      console.log("[polls] Fetched polls:", data.polls)
      setPolls(data.polls || [])
    } catch (err) {
      console.error("[polls] Fetch error:", err)
      setError("Failed to load polls")
    } finally {
      setLoading(false)
    }
  }

  const createPoll = async () => {
    if (!user || creating) return

    // Validate form
    if (!newPoll.question.trim()) {
      setError("Question is required")
      return
    }

    const validOptions = newPoll.options.filter((opt) => opt.trim())
    if (validOptions.length < 2) {
      setError("At least 2 options are required")
      return
    }

    setCreating(true)
    setError(null)

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          question: newPoll.question.trim(),
          options: validOptions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create poll")
      }

      const data = await response.json()
      console.log("[polls] Created poll:", data.poll)

      setSuccess("Poll created successfully!")
      setNewPoll({ question: "", options: ["", ""] })
      await fetchPolls() // Refresh polls
    } catch (err) {
      console.error("[polls] Create error:", err)
      setError(err instanceof Error ? err.message : "Failed to create poll")
    } finally {
      setCreating(false)
    }
  }

  const votePoll = async (pollId: string, optionIndex: number) => {
    if (!user || voting) return

    setVoting(pollId)
    setError(null)

    try {
      console.log(`[polls] Voting on poll ${pollId}, option ${optionIndex}`)

      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ optionIndex }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to vote")
      }

      const data = await response.json()
      console.log("[polls] Vote response:", data)

      setSuccess("Vote cast successfully!")
      await fetchPolls() // Refresh polls to show updated results
    } catch (err) {
      console.error("[polls] Vote error:", err)
      setError(err instanceof Error ? err.message : "Failed to vote")
    } finally {
      setVoting(null)
    }
  }

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }))
    }
  }

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }))
    }
  }

  const updateOption = (index: number, value: string) => {
    setNewPoll((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Vote className="h-8 w-8" />
          Polls
        </h1>
        <p className="text-muted-foreground">Create and participate in community polls</p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-500">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Create Poll */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Poll
          </CardTitle>
          <CardDescription>Ask the community a question</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              placeholder="What would you like to ask?"
              value={newPoll.question}
              onChange={(e) => setNewPoll((prev) => ({ ...prev, question: e.target.value }))}
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground mt-1">{newPoll.question.length}/200 characters</p>
          </div>

          <div>
            <Label>Options</Label>
            <div className="space-y-2">
              {newPoll.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    maxLength={100}
                  />
                  {newPoll.options.length > 2 && (
                    <Button variant="outline" size="icon" onClick={() => removeOption(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {newPoll.options.length < 6 && (
              <Button variant="outline" size="sm" onClick={addOption} className="mt-2 bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          <Button onClick={createPoll} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Poll
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Polls List */}
      <div className="space-y-6">
        {polls.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Vote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No polls yet. Create the first one!</p>
            </CardContent>
          </Card>
        ) : (
          polls.map((poll) => (
            <Card key={poll.id}>
              <CardHeader>
                <CardTitle>{poll.question}</CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    by @{poll.created_by_username}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(poll.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Vote className="h-4 w-4" />
                    {poll.total_votes} votes
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {poll.options.map((option, index) => {
                  const votes = poll.votes[index] || 0
                  const percentage = poll.total_votes > 0 ? (votes / poll.total_votes) * 100 : 0
                  const hasVoted = poll.user_vote !== undefined
                  const isUserVote = poll.user_vote === index

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isUserVote ? "text-primary" : ""}`}>
                          {option} {isUserVote && "✓"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {votes} votes ({percentage.toFixed(1)}%)
                        </span>
                      </div>

                      {hasVoted ? (
                        <Progress value={percentage} className="h-2" />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => votePoll(poll.id, index)}
                          disabled={voting === poll.id}
                          className="w-full"
                        >
                          {voting === poll.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vote"}
                        </Button>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
