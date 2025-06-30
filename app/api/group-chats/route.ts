import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createGroupChat, getUserGroupChats } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const groupChats = await getUserGroupChats(user.id)
    return NextResponse.json({ groupChats })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, memberIds = [] } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Group chat name is required" }, { status: 400 })
    }

    const groupChat = await createGroupChat(name, user.id, memberIds)
    return NextResponse.json({ groupChat })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
