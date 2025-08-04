import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { profile_picture, bio } = await request.json()

    const result = await query`
      UPDATE users 
      SET profile_picture = ${profile_picture || null}, 
          bio = ${bio || null},
          updated_at = NOW()
      WHERE id = ${user.id}
      RETURNING id, username, email, signup_code, name_color, custom_title, has_gold_animation, 
                notifications_enabled, theme, hue, profile_picture, bio
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: result[0] })
  } catch (error: any) {
    console.error("Update profile API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
