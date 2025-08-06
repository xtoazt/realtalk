import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  console.log("[me-api] GET request received")

  try {
    const token = request.cookies.get("auth-token")?.value
    console.log("[me-api] Token found:", !!token)

    if (!token) {
      console.log("[me-api] No token provided")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await getCurrentUser(token)
    console.log("[me-api] User found:", !!user)

    if (!user) {
      console.log("[me-api] Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
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
  } catch (error: any) {
    console.error("[me-api] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
