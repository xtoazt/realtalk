import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getAcceptedFriends } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const friends = await getAcceptedFriends(user.id)
    return NextResponse.json({ friends })
  } catch (error: any) {
    console.error("GET Accepted Friends API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
