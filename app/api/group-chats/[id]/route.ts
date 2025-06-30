import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { deleteGroupChat } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const groupId = params.id
    await deleteGroupChat(groupId, user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("DELETE group chat API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
