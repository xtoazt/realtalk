import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getPendingJoinRequests, approveJoinRequest, rejectJoinRequest } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const groupChatId = params.id
    const requests = await getPendingJoinRequests(groupChatId)

    return NextResponse.json({ requests })
  } catch (error: any) {
    console.error("Failed to get join requests:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId, action, requesterId } = await request.json()
    const groupChatId = params.id

    if (!requestId || !action || !requesterId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (action === 'approve') {
      await approveJoinRequest(requestId, groupChatId, requesterId)
      return NextResponse.json({ message: "Join request approved" })
    } else if (action === 'reject') {
      await rejectJoinRequest(requestId)
      return NextResponse.json({ message: "Join request rejected" })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Failed to process join request:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
