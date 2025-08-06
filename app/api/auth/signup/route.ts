import { type NextRequest, NextResponse } from "next/server"
import { signUp } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  console.log("[signup-api] POST request received")

  try {
    const body = await request.json()
    const { username, password, signupCode } = body
    console.log("[signup-api] Request data:", { username, signupCode: signupCode ? "provided" : "none" })

    if (!username || !password) {
      console.error("[signup-api] Missing required fields")
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    if (username.length < 3) {
      console.error("[signup-api] Username too short")
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 })
    }

    if (password.length < 6) {
      console.error("[signup-api] Password too short")
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const { user, token } = await signUp(username, password, signupCode)

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("[signup-api] Signup successful, cookie set")
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
    console.error("[signup-api] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
