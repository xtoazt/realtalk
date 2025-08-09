import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!me.has_gold_animation) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { targetUserId, popupMessage } = await request.json()
    if (!targetUserId || !popupMessage) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    await query`
      UPDATE users
      SET freeze_popup_message = ${popupMessage}, freeze_updated_at = NOW()
      WHERE id = ${targetUserId}
    `

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}


