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
      SELECT m.*, u.signup_code
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ${messageId}
    `

    if (messageResult.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    const message = messageResult[0]

    // Check if user can delete this message
    const canDelete = message.sender_id === user.id || user.signup_code === "qwea"

    if (!canDelete) {
      return NextResponse.json({ error: "Not authorized to delete this message" }, { status: 403 })
    }

    // Delete the message
    await query`DELETE FROM messages WHERE id = ${messageId}`

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[delete-message] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
