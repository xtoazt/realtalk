import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Get user profile
    const userResult = await query`
      SELECT id, username, name_color, custom_title, has_gold_animation, 
             profile_picture, bio, created_at
      FROM users 
      WHERE id = ${userId}
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    // Check friendship status
    const friendshipResult = await query`
      SELECT status, requester_id, addressee_id
      FROM friendships
      WHERE (requester_id = ${currentUser.id} AND addressee_id = ${userId})
         OR (requester_id = ${userId} AND addressee_id = ${currentUser.id})
    `

    let friendshipStatus = "none"
    let canSendRequest = true

    if (friendshipResult.length > 0) {
      const friendship = friendshipResult[0]
      friendshipStatus = friendship.status

      if (friendship.status === "pending") {
        canSendRequest = false
      } else if (friendship.status === "accepted") {
        canSendRequest = false
      }
    }

    return NextResponse.json({
      user,
      friendship: {
        status: friendshipStatus,
        canSendRequest: canSendRequest && userId !== currentUser.id,
      },
    })
  } catch (error: any) {
    console.error("[user-profile] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
