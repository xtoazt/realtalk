import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { updateUserSettings } from "@/lib/db"

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()
    console.log("[settings-api] Updating user settings:", updates)

    // Validate theme if provided
    if (updates.theme) {
      const validThemes = ["monochrome", "sunset", "sunrise", "forest", "ocean"]
      if (!validThemes.includes(updates.theme)) {
        return NextResponse.json({ error: "Invalid theme selected" }, { status: 400 })
      }
    }

    const updatedUser = await updateUserSettings(user.id, updates)
    console.log("[settings-api] Updated user:", updatedUser?.username)

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("[settings-api] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
