import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { updateUserActivity } from "@/lib/db"

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await updateUserActivity(user.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Update activity API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
