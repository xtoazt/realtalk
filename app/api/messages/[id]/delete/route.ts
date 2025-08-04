import { type NextRequest, NextResponse } from "next/server"
import { deleteMessage, getMessageById, getUserById } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messageId = params.id
    console.log("[delete-message] Deleting message:", messageId, "by user:", userId)

    // Get the message to check ownership
    const message = await getMessageById(messageId)
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Get current user to check permissions
    const currentUser = await getUserById(userId)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user can delete this message
    const canDelete =
      message.user_id === userId || // Own message
      currentUser.has_gold_animation || // Gold user can delete any message
      currentUser.signup_code === "qwea" // qwea signup code has gold privileges

    if (!canDelete) {
      return NextResponse.json({ error: "You don't have permission to delete this message" }, { status: 403 })
    }

    // Delete the message
    await deleteMessage(messageId)

    console.log("[delete-message] Message deleted successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[delete-message] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete message" },
      { status: 500 },
    )
  }
}
