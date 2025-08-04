import { type NextRequest, NextResponse } from "next/server"
import { updateUserProfile } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function PATCH(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { profile_picture, bio } = body

    console.log("[profile] Updating profile for user:", userId, { profile_picture: !!profile_picture, bio: !!bio })

    // Validate inputs
    if (bio && bio.length > 500) {
      return NextResponse.json({ error: "Bio must be 500 characters or less" }, { status: 400 })
    }

    if (profile_picture && typeof profile_picture !== "string") {
      return NextResponse.json({ error: "Invalid profile picture URL" }, { status: 400 })
    }

    // Update profile
    const updatedUser = await updateUserProfile(userId, {
      profile_picture: profile_picture || null,
      bio: bio || null,
    })

    console.log("[profile] Profile updated successfully")

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error("[profile] Update error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 },
    )
  }
}
