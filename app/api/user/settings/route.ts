import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("[/api/user/settings] GET request received")
    const user = await getCurrentUser()

    if (!user) {
      console.log("[/api/user/settings] No user found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("[/api/user/settings] Returning user settings for:", user.username)
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name_color: user.name_color,
        custom_title: user.custom_title,
        has_gold_animation: user.has_gold_animation,
        profile_picture: user.profile_picture,
        theme: user.theme || "dark",
        hue: user.hue || "gray",
        notifications_enabled: user.notifications_enabled || false,
      },
    })
  } catch (error) {
    console.error("[/api/user/settings] GET Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[/api/user/settings] POST request received")
    const user = await getCurrentUser()

    if (!user) {
      console.log("[/api/user/settings] No user found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[/api/user/settings] Update data:", body)

    const { theme, hue, notifications_enabled, name_color, custom_title } = body

    // Validate theme and hue
    const validThemes = ["light", "dark"]
    const validHues = ["gray", "red", "orange", "yellow", "green", "blue", "indigo", "purple", "pink"]

    if (theme && !validThemes.includes(theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 })
    }

    if (hue && !validHues.includes(hue)) {
      return NextResponse.json({ error: "Invalid hue" }, { status: 400 })
    }

    // Update user settings
    const updatedUsers = await sql`
      UPDATE users 
      SET 
        theme = COALESCE(${theme}, theme),
        hue = COALESCE(${hue}, hue),
        notifications_enabled = COALESCE(${notifications_enabled}, notifications_enabled),
        name_color = COALESCE(${name_color}, name_color),
        custom_title = COALESCE(${custom_title}, custom_title)
      WHERE id = ${user.id}
      RETURNING id, username, email, name_color, custom_title, has_gold_animation, 
                profile_picture, theme, hue, notifications_enabled, last_active, created_at
    `

    if (updatedUsers.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedUser = updatedUsers[0]
    console.log("[/api/user/settings] User updated successfully:", updatedUser.username)

    return NextResponse.json({
      message: "Settings updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("[/api/user/settings] POST Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
