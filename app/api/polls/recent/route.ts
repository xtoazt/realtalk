import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the most recent poll that the user can access (created by them, public, or shared with them)
    const polls = await query`
      SELECT DISTINCT p.*, u.username as creator_username,
        pr.selected_option as user_response
      FROM polls p
      JOIN users u ON p.creator_id = u.id
      LEFT JOIN poll_responses pr ON p.id = pr.poll_id AND pr.user_id = ${user.id}
      WHERE p.is_public = true 
        OR p.creator_id = ${user.id}
        OR p.id IN (
          SELECT poll_id FROM poll_shares WHERE user_id = ${user.id}
        )
      ORDER BY p.created_at DESC
      LIMIT 1
    `

    if (polls.length === 0) {
      return NextResponse.json({ poll: null })
    }

    const poll = polls[0]

    // Get poll results
    const results = await query`
      SELECT selected_option as option_index, COUNT(*) as count
      FROM poll_responses
      WHERE poll_id = ${poll.id}
      GROUP BY selected_option
    `

    const totalResponses = await query`
      SELECT COUNT(*) as total
      FROM poll_responses
      WHERE poll_id = ${poll.id}
    `

    return NextResponse.json({
      poll: {
        ...poll,
        results: results.map((r) => ({ option_index: r.option_index, count: Number.parseInt(r.count) })),
        total_responses: Number.parseInt(totalResponses[0].total),
      },
    })
  } catch (error: any) {
    console.error("Recent poll API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
