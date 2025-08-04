import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("[auth/me] Returning user data:", user.username, "has_gold_animation:", user.has_gold_animation)

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        signup_code: user.signup_code,
        name_color: user.name_color,
        custom_title: user.custom_title,
        has_gold_animation: user.has_gold_animation,
        notifications_enabled: user.notifications_enabled,
        theme: user.theme,
        hue: user.hue,
        profile_picture: user.profile_picture,
        bio: user.bio,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error("[auth/me] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
