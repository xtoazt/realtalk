import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get events that user can see (created by them or invited to)
    const events = await query`
      SELECT DISTINCT e.*, u.username as creator_username
      FROM calendar_events e
      JOIN users u ON e.creator_id = u.id
      WHERE e.creator_id = ${user.id}
         OR e.id IN (
           SELECT event_id FROM calendar_participants WHERE user_id = ${user.id}
         )
      ORDER BY e.start_time ASC
    `

    // Get participants for each event
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        const participants = await query`
          SELECT cp.user_id, cp.status, u.username
          FROM calendar_participants cp
          JOIN users u ON cp.user_id = u.id
          WHERE cp.event_id = ${event.id}
        `
        return { ...event, participants }
      }),
    )

    return NextResponse.json({ events: eventsWithParticipants })
  } catch (error: any) {
    console.error("GET calendar API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, start_time, end_time, is_collaborative, participants } = await request.json()

    if (!title || !start_time || !end_time) {
      return NextResponse.json({ error: "Title, start time, and end time are required" }, { status: 400 })
    }

    // Validate times
    if (new Date(start_time) >= new Date(end_time)) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 })
    }

    // Create event
    const eventResult = await query`
      INSERT INTO calendar_events (creator_id, title, description, start_time, end_time, is_collaborative)
      VALUES (${user.id}, ${title}, ${description}, ${start_time}, ${end_time}, ${is_collaborative || false})
      RETURNING *
    `

    const event = eventResult[0]

    // Add participants if collaborative
    if (is_collaborative && participants && participants.length > 0) {
      for (const participantId of participants) {
        await query`
          INSERT INTO calendar_participants (event_id, user_id, status)
          VALUES (${event.id}, ${participantId}, 'pending')
          ON CONFLICT (event_id, user_id) DO NOTHING
        `
      }
    }

    return NextResponse.json({ event })
  } catch (error: any) {
    console.error("POST calendar API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
