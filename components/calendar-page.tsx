"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Plus, X, Users, Clock, ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  is_collaborative: boolean
  creator_username: string
  creator_id: string
  created_at: string
  participants?: { user_id: string; username: string; status: string }[]
}

interface Friend {
  friend_id: string
  friend_username: string
  friend_name_color?: string
  friend_has_gold?: boolean
}

interface CalendarPageProps {
  currentUserId: string
}

export function CalendarPage({ currentUserId }: CalendarPageProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Create event form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isCollaborative, setIsCollaborative] = useState(false)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/calendar")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
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
    fetchEvents()
    fetchFriends()
  }, [fetchEvents, fetchFriends])

  const handleCreateEvent = async () => {
    if (!title.trim() || !startTime || !endTime) return

    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          start_time: startTime,
          end_time: endTime,
          is_collaborative: isCollaborative,
          participants: selectedParticipants,
        }),
      })

      if (response.ok) {
        setShowCreateEvent(false)
        resetForm()
        fetchEvents()
      }
    } catch (error) {
      console.error("Failed to create event:", error)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStartTime("")
    setEndTime("")
    setIsCollaborative(false)
    setSelectedParticipants([])
  }

  const getUsernameStyle = (nameColor?: string, hasGold?: boolean) => {
    if (hasGold) {
      return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse font-medium"
    }
    return nameColor ? { color: nameColor } : {}
  }

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString()
    return events.filter((event) => {
      const eventDate = new Date(event.start_time).toDateString()
      return eventDate === dateStr
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground animate-pulse">Loading calendar...</div>
      </div>
    )
  }

  const days = getDaysInMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString([], { month: "long", year: "numeric" })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <Button onClick={() => setShowCreateEvent(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {monthYear}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const dayEvents = date ? getEventsForDate(date) : []
              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-1 border rounded-lg ${
                    date ? "hover:bg-accent/50 cursor-pointer" : ""
                  } ${isToday(date) ? "bg-primary/10 border-primary" : ""}`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium ${isToday(date) ? "text-primary" : ""}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs p-1 bg-primary/20 rounded truncate"
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No events scheduled</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first event to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events
                .filter((event) => new Date(event.start_time) >= new Date())
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .slice(0, 5)
                .map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>
                            {formatDateTime(event.start_time)} - {formatDateTime(event.end_time)}
                          </span>
                          {event.is_collaborative && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>Collaborative</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Created by @{event.creator_username}</div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Create Event</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateEvent(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
              </div>

              <div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="collaborative" checked={isCollaborative} onCheckedChange={setIsCollaborative} />
                <label htmlFor="collaborative" className="text-sm">
                  Make this a collaborative event
                </label>
              </div>

              {isCollaborative && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Invite participants</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {friends.map((friend) => (
                      <div key={friend.friend_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={friend.friend_id}
                          checked={selectedParticipants.includes(friend.friend_id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedParticipants([...selectedParticipants, friend.friend_id])
                            } else {
                              setSelectedParticipants(selectedParticipants.filter((id) => id !== friend.friend_id))
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
                  onClick={handleCreateEvent}
                  disabled={!title.trim() || !startTime || !endTime}
                  className="flex-1"
                >
                  Create Event
                </Button>
                <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
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
