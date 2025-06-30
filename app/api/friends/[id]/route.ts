import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { updateFriendshipStatus } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const friendship = await updateFriendshipStatus(params.id, status)
    return NextResponse.json({ friendship })
  } catch (error: any) {
    console.error("PATCH Friendship Status API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
