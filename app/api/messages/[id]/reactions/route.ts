import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { addMessageReaction, removeMessageReaction } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messageId = params.id
    const { emoji } = await request.json()

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 })
    }

    const reaction = await addMessageReaction(messageId, user.id, emoji)
    return NextResponse.json({ reaction })
  } catch (error: any) {
    console.error("POST reaction API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messageId = params.id
    const { emoji } = await request.json() // Get emoji from body for DELETE

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 })
    }

    await removeMessageReaction(messageId, user.id, emoji)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("DELETE reaction API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
