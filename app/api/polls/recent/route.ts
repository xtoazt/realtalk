import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Get the most recent poll created by the user
    const polls = await query`
      SELECT p.*, 
             pr.selected_option as user_response,
             COALESCE(response_counts.total_responses, 0) as total_responses
      FROM polls p
      LEFT JOIN poll_responses pr ON p.id = pr.poll_id AND pr.user_id = ${user.id}
      LEFT JOIN (
        SELECT poll_id, COUNT(*) as total_responses
        FROM poll_responses
        GROUP BY poll_id
      ) response_counts ON p.id = response_counts.poll_id
      WHERE p.creator_id = ${user.id}
      ORDER BY p.created_at DESC
      LIMIT 1
    `

    if (polls.length === 0) {
      return NextResponse.json({ poll: null })
    }

    const poll = polls[0]

    // Get results for the poll
    const results = await query`
      SELECT selected_option as option_index, COUNT(*) as count
      FROM poll_responses
      WHERE poll_id = ${poll.id}
      GROUP BY selected_option
      ORDER BY selected_option
    `

    const pollWithResults = { ...poll, results }

    return NextResponse.json({ poll: pollWithResults })
  } catch (error: any) {
    console.error("GET recent poll API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
