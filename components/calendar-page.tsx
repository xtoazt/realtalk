"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Plus, Clock, MapPin, Users } from "lucide-react"
import { getUsernameClassName, getUsernameColorStyle, shouldApplyCustomColor } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  description?: string
  event_date: string
  location?: string
  created_by: string
  creator_username: string
  creator_name_color?: string
  creator_has_gold_animation?: boolean
  creator_custom_title?: string
  created_at: string
}

interface CalendarPageProps {
  currentUserId: string
}

export function CalendarPage({ currentUserId }: CalendarPageProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [location, setLocation] = useState("")

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

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleCreateEvent = async () => {
    if (!title.trim() || !eventDate || creating) return

    setCreating(true)
    try {
      const eventDateTime = eventTime ? `${eventDate}T${eventTime}:00` : `${eventDate}T12:00:00`

      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          event_date: eventDateTime,
          location: location.trim() || null,
        }),
      })

      if (response.ok) {
        setTitle("")
        setDescription("")
        setEventDate("")
        setEventTime("")
        setLocation("")
        setShowCreateDialog(false)
        await fetchEvents()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create event")
      }
    } catch (error) {
      console.error("Failed to create event:", error)
      alert("Failed to create event")
    } finally {
      setCreating(false)
    }
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()

    let dateLabel = ""
    if (isToday) dateLabel = "Today"
    else if (isTomorrow) dateLabel = "Tomorrow"
    else dateLabel = date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })

    const timeLabel = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    return { dateLabel, timeLabel, fullDate: date }
  }

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {}

    events.forEach((event) => {
      const date = new Date(event.event_date).toDateString()
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(event)
    })

    // Sort dates
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    return sortedDates.map((date) => ({
      date,
      events: grouped[date].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()),
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading events...</p>
        </div>
      </div>
    )
  }

  const groupedEvents = groupEventsByDate(events)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Calendar
        </h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Create a new calendar event for the community</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter event description"
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventDate">Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="eventTime">Time (Optional)</Label>
                  <Input id="eventTime" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter event location"
                  maxLength={100}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  disabled={!title.trim() || !eventDate || creating}
                  className="flex-1"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {groupedEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No events scheduled</h3>
            <p className="text-gray-500 text-center mb-4">
              Create the first event to get the community calendar started!
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map(({ date, events }) => (
            <div key={date}>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                {formatEventDate(events[0].event_date).dateLabel}
              </h3>
              <div className="space-y-3">
                {events.map((event) => {
                  const { timeLabel } = formatEventDate(event.event_date)
                  return (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{timeLabel}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>
                                  Created by{" "}
                                  <span
                                    className={getUsernameClassName(
                                      false,
                                      event.creator_has_gold_animation,
                                      !!event.creator_name_color,
                                    )}
                                    style={
                                      shouldApplyCustomColor(event.creator_has_gold_animation, false)
                                        ? getUsernameColorStyle(event.creator_name_color)
                                        : {}
                                    }
                                  >
                                    {event.creator_username}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
