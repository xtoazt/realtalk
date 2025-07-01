import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pollId = params.id

    // Check if poll exists and user is the creator
    const pollCheck = await query`
      SELECT creator_id FROM polls WHERE id = ${pollId}
    `

    if (pollCheck.length === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    if (pollCheck[0].creator_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this poll" }, { status: 403 })
    }

    // Start transaction
    await query`BEGIN`

    try {
      // Delete poll responses
      await query`DELETE FROM poll_responses WHERE poll_id = ${pollId}`

      // Delete poll shares
      await query`DELETE FROM poll_shares WHERE poll_id = ${pollId}`

      // Delete the poll itself
      await query`DELETE FROM polls WHERE id = ${pollId}`

      await query`COMMIT`

      return NextResponse.json({ success: true })
    } catch (error) {
      await query`ROLLBACK`
      throw error
    }
  } catch (error: any) {
    console.error("Delete poll API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
