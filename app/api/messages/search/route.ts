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
    const searchQuery = searchParams.get("q")

    if (!searchQuery || searchQuery.trim().length < 2) {
      return NextResponse.json({ messages: [] })
    }

    // Search messages that the user has access to
    const messages = await query`
      SELECT m.id, m.content, m.chat_type, m.chat_id, m.message_type, m.created_at,
             u.username, u.name_color, u.has_gold_animation
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (
        -- Global messages (everyone can see)
        m.chat_type = 'global'
        OR
        -- DM messages where user is involved
        (m.chat_type = 'dm' AND (m.sender_id = ${user.id} OR m.chat_id = ${user.id}))
        OR
        -- Group messages where user is a member
        (m.chat_type = 'group' AND m.chat_id IN (
          SELECT group_chat_id FROM group_chat_members WHERE user_id = ${user.id}
        ))
      )
      AND (
        m.content ILIKE ${`%${searchQuery.trim()}%`}
        OR u.username ILIKE ${`%${searchQuery.trim()}%`}
      )
      ORDER BY m.created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error("Search messages API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
