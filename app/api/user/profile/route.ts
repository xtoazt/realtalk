import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()
    console.log("[profile-api] Updating profile:", updates)

    const allowedFields = ["profile_picture", "bio"]
    const validUpdates: any = {}

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === "bio" && typeof value === "string" && value.length > 500) {
          return NextResponse.json({ error: "Bio must be 500 characters or less" }, { status: 400 })
        }
        validUpdates[key] = value
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // Build dynamic update query
    const setClause = Object.keys(validUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ")

    const queryString = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, signup_code, name_color, custom_title, has_gold_animation, 
                notifications_enabled, theme, hue, profile_picture, bio
    `

    const params = [user.id, ...Object.values(validUpdates)]
    const result = await query.unsafe(queryString, params)

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: result[0] })
  } catch (error: any) {
    console.error("[profile-api] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
