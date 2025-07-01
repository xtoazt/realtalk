import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@vercel/postgres"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    // Fetch the most recent poll that is either created by the user, is public,
    // or has the user as a participant.
    const result = await sql`
      SELECT
        p.id,
        p.question,
        p.options,
        p.created_at,
        p.creator_id,
        p.is_public,
        u.username AS creator_username,
        (
          SELECT json_agg(json_build_object('option_text', po.option_text, 'votes', po.votes))
          FROM poll_options po
          WHERE po.poll_id = p.id
        ) AS poll_options,
        (
          SELECT COUNT(*)
          FROM poll_votes pv
          WHERE pv.poll_id = p.id AND pv.user_id = ${userId}
        ) > 0 AS has_voted
      FROM polls p
      JOIN users u ON p.creator_id = u.id
      LEFT JOIN poll_participants pp ON p.id = pp.poll_id
      WHERE p.creator_id = ${userId} OR p.is_public = TRUE OR pp.user_id = ${userId}
      ORDER BY p.created_at DESC
      LIMIT 1;
    `

    const recentPoll = result.rows[0] || null

    return NextResponse.json({ recentPoll })
  } catch (error) {
    console.error("Error fetching recent poll:", error)
    return NextResponse.json({ error: "Failed to fetch recent poll" }, { status: 500 })
  }
}
