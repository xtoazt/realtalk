import { type NextRequest, NextResponse } from "next/server"
import { votePoll } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pollId = params.id
    const body = await request.json()
    const { optionIndex, option_index } = body

    // Support both naming conventions
    const selectedOption = optionIndex !== undefined ? optionIndex : option_index

    if (selectedOption === undefined || selectedOption < 0) {
      return NextResponse.json({ error: "Invalid option index" }, { status: 400 })
    }

    console.log("[vote-poll] User:", userId, "voting on poll:", pollId, "option:", selectedOption)

    const result = await votePoll(pollId, userId, selectedOption)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    console.log("[vote-poll] Vote cast successfully")

    return NextResponse.json({
      success: true,
      poll: result.poll,
    })
  } catch (error) {
    console.error("[vote-poll] Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to vote" }, { status: 500 })
  }
}
