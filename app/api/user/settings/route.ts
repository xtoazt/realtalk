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
    console.log("[settings-api] Updating user settings:", updates)

    const allowedFields = ["custom_title", "name_color", "notifications_enabled", "theme", "hue"]
    const validUpdates: any = {}

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        validUpdates[key] = value
      }
    }

    console.log("[settings-api] Valid updates:", validUpdates)

    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // Validate hue if provided
    if (validUpdates.hue) {
      const validHues = ["blue", "purple", "pink", "red", "orange", "yellow", "green", "teal"]
      if (!validHues.includes(validUpdates.hue)) {
        return NextResponse.json({ error: "Invalid hue selected" }, { status: 400 })
      }
    }

    // Validate theme if provided
    if (validUpdates.theme) {
      const validThemes = ["light", "dark"]
      if (!validThemes.includes(validUpdates.theme)) {
        return NextResponse.json({ error: "Invalid theme selected" }, { status: 400 })
      }
    }

    // Build dynamic update query
    const setClause = Object.keys(validUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ")

    const queryString = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, signup_code, name_color, custom_title, has_gold_animation, notifications_enabled, theme, hue
    `

    const params = [user.id, ...Object.values(validUpdates)]

    console.log("[settings-api] Executing query:", queryString, "with params:", params)

    const result = await query.unsafe(queryString, params)

    if (result.length === 0) {
      console.error("[settings-api] No user found or updated for ID:", user.id)
      return NextResponse.json({ error: "User not found or no settings updated." }, { status: 404 })
    }

    console.log("[settings-api] Update successful:", result[0])
    return NextResponse.json({ user: result[0] })
  } catch (error: any) {
    console.error("[settings-api] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
