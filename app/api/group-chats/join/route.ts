import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getGroupChatByShortCode, createJoinRequest } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { shortCode } = await request.json()

    if (!shortCode) {
      return NextResponse.json({ error: "Short code is required" }, { status: 400 })
    }

    // Find the group chat by short code
    const groupChat = await getGroupChatByShortCode(shortCode)
    if (!groupChat) {
      return NextResponse.json({ error: "Group chat not found" }, { status: 404 })
    }

    // Create join request
    const joinRequest = await createJoinRequest(groupChat.id, user.id)

    return NextResponse.json({ 
      message: "Join request sent successfully",
      groupChat: {
        id: groupChat.id,
        name: groupChat.name,
        creator_username: groupChat.creator_username
      }
    })
  } catch (error: any) {
    console.error("Failed to join group chat:", error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
