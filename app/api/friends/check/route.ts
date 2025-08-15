import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get("userId")

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ friendship: null })
    }

    // Check if there's an existing friendship
    const friendships = await query`
      SELECT * FROM friendships
      WHERE (requester_id = ${user.id} AND addressee_id = ${targetUserId})
         OR (requester_id = ${targetUserId} AND addressee_id = ${user.id})
      LIMIT 1
    `

    return NextResponse.json({ friendship: friendships[0] || null })
  } catch (error) {
    console.error("Failed to check friendship:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
