import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

export async function DELETE() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[delete-user-api] Deleting user:", user.username)

    // Start transaction and delete user data
    await query`BEGIN`

    // Delete user's messages
    await query`DELETE FROM messages WHERE sender_id = ${user.id}`

    // Delete user's friendships
    await query`DELETE FROM friendships WHERE requester_id = ${user.id} OR addressee_id = ${user.id}`

    // Delete user's group chat memberships
    await query`DELETE FROM group_chat_members WHERE user_id = ${user.id}`

    // Delete user's notifications
    await query`DELETE FROM notifications WHERE user_id = ${user.id}`

    // Delete user's message reactions
    await query`DELETE FROM message_reactions WHERE user_id = ${user.id}`

    // Finally delete the user
    await query`DELETE FROM users WHERE id = ${user.id}`

    await query`COMMIT`

    // Clear the auth cookie
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")

    console.log("[delete-user-api] User deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    await query`ROLLBACK`
    console.error("[delete-user-api] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
