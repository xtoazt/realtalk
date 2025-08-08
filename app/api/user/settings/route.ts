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

    const updated = await updateUserSettings(user.id, updates)
    console.log("[settings-api] Update successful:", updated)
    return NextResponse.json({ user: updated })
  } catch (error: any) {
    console.error("[settings-api] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
