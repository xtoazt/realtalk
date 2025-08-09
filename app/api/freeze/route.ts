import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { setUserFrozen, clearUserFrozen } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Gold-only guard
    if (!me.has_gold_animation) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { targetUserId, message } = await request.json()
    if (!targetUserId) return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 })

    const res = await setUserFrozen(targetUserId, me.id, message)
    return NextResponse.json({ ok: true, freeze: res })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!me.has_gold_animation) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get("targetUserId")
    if (!targetUserId) return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 })

    const res = await clearUserFrozen(targetUserId)
    return NextResponse.json({ ok: true, freeze: res })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}


