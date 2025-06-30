import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getOnlineUsers } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Pass the current user's ID to filter for online friends
    const onlineUsers = await getOnlineUsers(user.id)
    return NextResponse.json({ onlineUsers })
  } catch (error: any) {
    console.error("Get online users API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
