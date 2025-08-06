import { type NextRequest, NextResponse } from "next/server"
import { signIn } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  console.log("[signin-api] POST request received")

  try {
    const body = await request.json()
    const { username, password } = body
    console.log("[signin-api] Request data:", { username })

    if (!username || !password) {
      console.error("[signin-api] Missing credentials")
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const { user, token } = await signIn(username, password)

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("[signin-api] Signin successful, cookie set")
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
    console.error("[signin-api] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
