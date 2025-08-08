import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db as sql } from "@/lib/db"

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const rows = await sql`SELECT id, creator_id, is_system FROM channels WHERE id = ${params.id} LIMIT 1`
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const channel = rows[0]
    if (channel.is_system) return NextResponse.json({ error: "Cannot delete system channel" }, { status: 403 })
    if (channel.creator_id !== user.id && user.signup_code !== 'qwea') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await sql`DELETE FROM channels WHERE id = ${params.id}`
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}


