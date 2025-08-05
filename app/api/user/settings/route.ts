import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(request: NextRequest) {
  try {
    console.log("[settings] PATCH request received")

    const user = await getCurrentUser()
    if (!user) {
      console.log("[settings] No authenticated user")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[settings] Request body:", body)

    const { theme, hue, notifications_enabled, name_color, custom_title, bio } = body

    // Update user settings
    const updatedUsers = await sql`
      UPDATE users 
      SET 
        theme = COALESCE(${theme}, theme),
        hue = COALESCE(${hue}, hue),
        notifications_enabled = COALESCE(${notifications_enabled}, notifications_enabled),
        name_color = COALESCE(${name_color}, name_color),
        custom_title = COALESCE(${custom_title}, custom_title),
        bio = COALESCE(${bio}, bio)
      WHERE id = ${user.id}
      RETURNING id, username, email, signup_code, name_color, custom_title, 
                has_gold_animation, notifications_enabled, theme, hue, 
                profile_picture, bio, created_at
    `

    if (updatedUsers.length === 0) {
      console.log("[settings] Failed to update user")
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }

    const updatedUser = updatedUsers[0]
    console.log("[settings] User updated successfully:", updatedUser.username)

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("[settings] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[settings] GET Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
