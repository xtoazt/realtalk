import { type NextRequest, NextResponse } from "next/server"
import { getUserById, getFriendshipStatus } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUserId = await verifyAuth(request)
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const targetUserId = params.id
    console.log("[user-profile] Fetching profile for:", targetUserId, "by:", currentUserId)

    // Get the target user
    const user = await getUserById(targetUserId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isOwnProfile = currentUserId === targetUserId
    let friendshipStatus = null

    // Get friendship status if not own profile
    if (!isOwnProfile) {
      friendshipStatus = await getFriendshipStatus(currentUserId, targetUserId)
    }

    // Remove sensitive data for other users
    const publicUser = {
      id: user.id,
      username: user.username,
      profile_picture: user.profile_picture,
      bio: user.bio,
      created_at: user.created_at,
      name_color: user.name_color,
      custom_title: user.custom_title,
      has_gold_animation: user.has_gold_animation,
    }

    return NextResponse.json({
      user: publicUser,
      isOwnProfile,
      friendshipStatus,
    })
  } catch (error) {
    console.error("[user-profile] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch profile" },
      { status: 500 },
    )
  }
}
