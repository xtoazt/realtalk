import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get polls that user can see (created by them, shared with them, or public)
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
    `

    // Get results and total responses for each poll
    const pollsWithResults = await Promise.all(
      polls.map(async (poll) => {
        // Get vote counts for each option
        const results = await query`
          SELECT selected_option as option_index, COUNT(*) as count
          FROM poll_responses
          WHERE poll_id = ${poll.id}
          GROUP BY selected_option
          ORDER BY selected_option
        `

        // Get total response count
        const totalResult = await query`
          SELECT COUNT(*) as total
          FROM poll_responses
          WHERE poll_id = ${poll.id}
        `

        const total_responses = Number.parseInt(totalResult[0].total)

        return {
          ...poll,
          results: results.map((r) => ({
            option_index: r.option_index,
            count: Number.parseInt(r.count),
          })),
          total_responses,
        }
      }),
    )

    return NextResponse.json({ polls: pollsWithResults })
  } catch (error: any) {
    console.error("GET polls API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, options, is_public, shared_with, expires_at } = await request.json()

    if (!title || !options || options.length < 2) {
      return NextResponse.json({ error: "Title and at least 2 options are required" }, { status: 400 })
    }

    // Only qwea users can create public polls
    if (is_public && user.signup_code !== "qwea") {
      return NextResponse.json({ error: "Only special users can create public polls" }, { status: 403 })
    }

    // Create poll
    const pollResult = await query`
      INSERT INTO polls (creator_id, title, description, options, is_public, expires_at)
      VALUES (${user.id}, ${title}, ${description}, ${options}, ${is_public || false}, ${expires_at || null})
      RETURNING *
    `

    const poll = pollResult[0]

    // Share with selected users if not public
    if (!is_public && shared_with && shared_with.length > 0) {
      for (const userId of shared_with) {
        await query`
          INSERT INTO poll_shares (poll_id, user_id)
          VALUES (${poll.id}, ${userId})
          ON CONFLICT (poll_id, user_id) DO NOTHING
        `
      }
    }

    return NextResponse.json({ poll })
  } catch (error: any) {
    console.error("POST poll API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
