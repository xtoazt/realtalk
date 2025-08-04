"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Clock, MapPin, Users, Loader2 } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  description?: string
  event_date: string
  location?: string
  creator_id: string
  creator_username: string
  creator_name_color?: string
  creator_has_gold: boolean
  created_at: string
}

export function CalendarPage() {
  const { user } = useUser()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [location, setLocation] = useState("")

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/calendar", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        console.error("Failed to fetch events")
      }
    } catch (error) {
      console.error("Events fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async () => {
    if (!title.trim() || !eventDate) {
      setError("Title and date are required")
      return
    }

    setCreating(true)
    setError(null)

    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          event_date: eventDate,
          location: location.trim() || null,
        }),
      })

      if (response.ok) {
        await fetchEvents()
        setTitle("")
        setDescription("")
        setEventDate("")
        setLocation("")
        setShowCreateForm(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create event")
      }
    } catch (error) {
      console.error("Create event error:", error)
      setError("Failed to create event")
    } finally {
      setCreating(false)
    }
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return date.toLocaleString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const isEventUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const upcomingEvents = events.filter((event) => isEventUpcoming(event.event_date))
  const pastEvents = events.filter((event) => !isEventUpcoming(event.event_date))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Community Calendar
              </CardTitle>
              <CardDescription>Upcoming events and gatherings</CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </CardHeader>

        {showCreateForm && (
          <CardContent className="border-t">
            <div className="space-y-4 pt-4">
              {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}

              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter event title"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event description (optional)"
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventDate">Date & Time</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Event location (optional)"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={createEvent} disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events ({upcomingEvents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <Badge variant="default">Upcoming</Badge>
                      </div>

                      {event.description && <p className="text-gray-600 mb-3">{event.description}</p>}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatEventDate(event.event_date)}
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Created by{" "}
                          <span
                            className={getUsernameClassName(false, event.creator_has_gold, !!event.creator_name_color)}
                            style={
                              shouldApplyCustomColor(event.creator_has_gold, false)
                                ? getUsernameColorStyle(event.creator_name_color)
                                : {}
                            }
                          >
                            @{event.creator_username}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {pastEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Past Events ({pastEvents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pastEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 opacity-75">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <Badge variant="secondary">Past</Badge>
                      </div>

                      {event.description && <p className="text-gray-600 mb-3">{event.description}</p>}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatEventDate(event.event_date)}
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Created by{" "}
                          <span
                            className={getUsernameClassName(false, event.creator_has_gold, !!event.creator_name_color)}
                            style={
                              shouldApplyCustomColor(event.creator_has_gold, false)
                                ? getUsernameColorStyle(event.creator_name_color)
                                : {}
                            }
                          >
                            @{event.creator_username}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {events.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                <p className="text-gray-500 mb-4">Be the first to create a community event!</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Event
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
