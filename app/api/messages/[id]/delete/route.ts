import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messageId = params.id

    // Get the message to check ownership
    const messageResult = await query`
      SELECT sender_id FROM messages WHERE id = ${messageId}
    `

    if (messageResult.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    const message = messageResult[0]

    // Check if user can delete the message
    // User can delete if they own the message OR they have gold animation (qwea signup code)
    const canDelete = message.sender_id === user.id || user.has_gold_animation

    if (!canDelete) {
      return NextResponse.json({ error: "Unauthorized to delete this message" }, { status: 403 })
    }

    // Delete the message and its reactions
    await query`BEGIN`

    try {
      await query`DELETE FROM message_reactions WHERE message_id = ${messageId}`
      await query`DELETE FROM messages WHERE id = ${messageId}`
      await query`COMMIT`

      return NextResponse.json({ success: true })
    } catch (error) {
      await query`ROLLBACK`
      throw error
    }
  } catch (error: any) {
    console.error("Delete message API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
