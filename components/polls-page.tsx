"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { BarChart3, Plus, X, Users, Globe, Clock, Trash2, Vote } from "lucide-react"

interface Poll {
  id: string
  title: string
  description?: string
  options: string[]
  is_public: boolean
  creator_username: string
  creator_id: string
  expires_at?: string
  created_at: string
  user_response?: number
  results: { option_index: number; count: number }[]
  total_responses: number
}

interface Friend {
  friend_id: string
  friend_username: string
  friend_name_color?: string
  friend_has_gold?: boolean
}

interface PollsPageProps {
  currentUserId: string
  userSignupCode?: string
}

export function PollsPage({ currentUserId, userSignupCode }: PollsPageProps) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [showCreatePoll, setShowCreatePoll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [votingPollId, setVotingPollId] = useState<string | null>(null)

  // Create poll form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [isPublic, setIsPublic] = useState(false)
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [expiresAt, setExpiresAt] = useState("")

  const fetchPolls = useCallback(async () => {
    try {
      const response = await fetch("/api/polls")
      if (response.ok) {
        const data = await response.json()
        console.log("[polls-page] Fetched polls:", data.polls)
        setPolls(data.polls)
      } else {
        console.error("[polls-page] Failed to fetch polls:", response.status)
      }
    } catch (error) {
      console.error("Failed to fetch polls:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFriends = useCallback(async () => {
    try {
      const response = await fetch("/api/friends/accepted")
      if (response.ok) {
        const data = await response.json()
        setFriends(data.friends)
      }
    } catch (error) {
      console.error("Failed to fetch friends:", error)
    }
  }, [])

  useEffect(() => {
    fetchPolls()
    fetchFriends()
  }, [fetchPolls, fetchFriends])

  const handleCreatePoll = async () => {
    if (!title.trim() || options.filter((o) => o.trim()).length < 2) return

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          options: options.filter((o) => o.trim()),
          is_public: isPublic,
          shared_with: selectedFriends,
          expires_at: expiresAt || undefined,
        }),
      })

      if (response.ok) {
        setShowCreatePoll(false)
        resetForm()
        fetchPolls()
      } else {
        const errorData = await response.json()
        console.error("Failed to create poll:", errorData.error)
        alert(`Failed to create poll: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Failed to create poll:", error)
      alert("An unexpected error occurred while creating the poll.")
    }
  }

  const handleDeletePoll = async (pollId: string) => {
    if (confirm("Are you sure you want to delete this poll? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/polls/${pollId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchPolls()
        } else {
          const errorData = await response.json()
          alert(`Failed to delete poll: ${errorData.error || response.statusText}`)
        }
      } catch (error) {
        console.error("Failed to delete poll:", error)
        alert("An unexpected error occurred while deleting the poll.")
      }
    }
  }

  const handleVote = async (pollId: string, optionIndex: number) => {
    console.log(`[polls-page] Voting on poll ${pollId} with option ${optionIndex}`)
    setVotingPollId(pollId)

    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_index: optionIndex }),
      })

      if (response.ok) {
        console.log("[polls-page] Vote successful, refreshing polls")
        await fetchPolls() // Refresh to get updated results
      } else {
        const errorData = await response.json()
        console.error("Failed to vote:", errorData.error)
        alert(`Failed to vote: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to vote:", error)
      alert("An unexpected error occurred while voting.")
    } finally {
      setVotingPollId(null)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setOptions(["", ""])
    setIsPublic(false)
    setSelectedFriends([])
    setExpiresAt("")
  }

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const getUsernameStyle = (nameColor?: string, hasGold?: boolean) => {
    if (hasGold) {
      return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse font-medium"
    }
    return nameColor ? { color: nameColor } : {}
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const getPercentage = (count: number, total: number) => {
    if (total === 0) return 0
    return Math.round((count / total) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground animate-pulse">Loading polls...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Polls</h2>
        <Button onClick={() => setShowCreatePoll(true)} className="hover-lift hover-glow">
          <Plus className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </div>

      <div className="grid gap-4">
        {polls.length === 0 ? (
          <Card className="glass-effect animate-fadeIn">
            <CardContent className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No polls yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first poll to gather opinions!</p>
            </CardContent>
          </Card>
        ) : (
          polls.map((poll, index) => {
            const hasVoted = poll.user_response !== undefined
            return (
              <Card
                key={poll.id}
                className={`glass-effect hover-lift animate-fadeIn ${isExpired(poll.expires_at) ? "opacity-75" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{poll.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {poll.is_public ? <Globe className="h-3 w-3 hue-accent" /> : <Users className="h-3 w-3" />}
                            <Vote className="h-3 w-3" />
                            <span>{poll.total_responses} votes</span>
                            {poll.expires_at && (
                              <>
                                <Clock className="h-3 w-3" />
                                <span className={isExpired(poll.expires_at) ? "text-red-500" : ""}>
                                  {isExpired(poll.expires_at) ? "Expired" : `Expires ${formatTime(poll.expires_at)}`}
                                </span>
                              </>
                            )}
                          </div>
                          {poll.creator_id === currentUserId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePoll(poll.id)}
                              className="text-red-500 hover:bg-red-500/10 h-6 w-6 p-0"
                              title="Delete Poll"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {poll.description && <p className="text-sm text-muted-foreground mt-1">{poll.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className={poll.creator_username ? getUsernameStyle(undefined, false) : ""}>
                      by @{poll.creator_username}
                    </span>
                    <span>
                      {poll.user_response !== undefined ? "You voted" : "Click to vote"} • {poll.total_responses} total
                      votes
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {poll.options.map((option, optionIndex) => {
                    const result = poll.results.find((r) => r.option_index === optionIndex)
                    const count = result?.count || 0
                    const percentage = getPercentage(count, poll.total_responses)
                    const isSelected = poll.user_response === optionIndex
                    const isVoting = votingPollId === poll.id

                    return (
                      <div key={optionIndex} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            className={`flex-1 justify-start hover-lift transition-all duration-200 ${
                              isSelected ? "hue-shadow" : ""
                            } ${!isExpired(poll.expires_at) ? "cursor-pointer" : ""}`}
                            onClick={() =>
                              !isExpired(poll.expires_at) && !isVoting && handleVote(poll.id, optionIndex)
                            }
                            disabled={isExpired(poll.expires_at) || isVoting}
                          >
                            <span className="flex-1 text-left">{option}</span>
                            {isVoting && (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
                            )}
                          </Button>
                          {hasVoted && (
                            <span className="text-sm text-muted-foreground ml-3 min-w-[60px] text-right">
                              {count} ({percentage}%)
                            </span>
                          )}
                        </div>
                        {hasVoted && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-700 ease-out ${
                                isSelected
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 hue-shadow"
                                  : "bg-gray-400 dark:bg-gray-600"
                              }`}
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: isSelected ? `hsl(var(--hue) 60% 50%)` : undefined,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {!isExpired(poll.expires_at) && (
                    <p className="text-xs text-muted-foreground text-center mt-4 opacity-70">
                      Click on an option to {hasVoted ? "change your vote" : "cast your vote"}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create Poll Modal */}
      {showCreatePoll && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto glass-effect animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Create Poll</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCreatePoll(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Poll title"
                  className="focus:hue-shadow"
                />
              </div>

              <div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="focus:hue-shadow"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Options</label>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="focus:hue-shadow"
                    />
                    {options.length > 2 && (
                      <Button variant="ghost" size="sm" onClick={() => removeOption(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <Button variant="outline" size="sm" onClick={addOption} className="hover-lift bg-transparent">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                )}
              </div>

              <div>
                <Input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="focus:hue-shadow"
                />
                <p className="text-xs text-muted-foreground mt-1">Optional expiration date</p>
              </div>

              {userSignupCode === "qwea" && (
                <div className="flex items-center space-x-2 p-3 hue-bg rounded-lg">
                  <Checkbox id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                  <label htmlFor="public" className="text-sm font-medium">
                    Share with all users (public poll)
                  </label>
                </div>
              )}

              {!isPublic && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Share with friends</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {friends.map((friend) => (
                      <div key={friend.friend_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={friend.friend_id}
                          checked={selectedFriends.includes(friend.friend_id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFriends([...selectedFriends, friend.friend_id])
                            } else {
                              setSelectedFriends(selectedFriends.filter((id) => id !== friend.friend_id))
                            }
                          }}
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
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleCreatePoll}
                  disabled={!title.trim() || options.filter((o) => o.trim()).length < 2}
                  className="flex-1 hover-glow"
                >
                  Create Poll
                </Button>
                <Button variant="outline" onClick={() => setShowCreatePoll(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
