import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { searchUsers } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ users: [] })
    }

    const users = await searchUsers(query, user.id)
    return NextResponse.json({ users })
  } catch (error: any) {
    console.error("Search users API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
