import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { option_index } = await request.json()
    const pollId = params.id

    if (typeof option_index !== "number" || option_index < 0) {
      return NextResponse.json({ error: "Valid option index is required" }, { status: 400 })
    }

    // Check if poll exists and user has access
    const pollCheck = await query`
      SELECT p.*, p.expires_at
      FROM polls p
      WHERE p.id = ${pollId}
        AND (p.is_public = true
             OR p.creator_id = ${user.id}
             OR p.id IN (
               SELECT poll_id FROM poll_shares WHERE user_id = ${user.id}
             ))
    `

    if (pollCheck.length === 0) {
      return NextResponse.json({ error: "Poll not found or access denied" }, { status: 404 })
    }

    const poll = pollCheck[0]

    // Check if poll has expired
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return NextResponse.json({ error: "Poll has expired" }, { status: 400 })
    }

    // Check if option index is valid
    if (option_index >= poll.options.length) {
      return NextResponse.json({ error: "Invalid option index" }, { status: 400 })
    }

    // Insert or update vote
    await query`
      INSERT INTO poll_responses (poll_id, user_id, selected_option)
      VALUES (${pollId}, ${user.id}, ${option_index})
      ON CONFLICT (poll_id, user_id)
      DO UPDATE SET selected_option = ${option_index}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Vote API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
