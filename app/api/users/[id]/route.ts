import { NextResponse, type NextRequest } from "next/server"
import { query } from "@/lib/db"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rows = await query`
      SELECT id, username, name_color, has_gold_animation, profile_picture, bio,
             is_frozen, frozen_by, freeze_message, freeze_popup_message, signup_code, created_at
      FROM users WHERE id = ${params.id}
    `
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ user: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
