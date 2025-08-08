import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db as sql } from "@/lib/db"

export async function GET() {
  try {
    const channels = await sql`SELECT * FROM channels ORDER BY is_system DESC, created_at DESC`
    return NextResponse.json({ channels })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (user.signup_code !== "qwea") {
      return NextResponse.json({ error: "Only gold users can create channels" }, { status: 403 })
    }

    const { name } = await request.json()
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Channel name must be at least 2 characters" }, { status: 400 })
    }

    const cleaned = name.trim().slice(0, 50)
    const existing = await sql`SELECT id FROM channels WHERE name = ${cleaned} LIMIT 1`
    if (existing.length > 0) {
      return NextResponse.json({ error: "Channel name already exists" }, { status: 400 })
    }

    const created = await sql`
      INSERT INTO channels (name, creator_id, is_system)
      VALUES (${cleaned}, ${user.id}, FALSE)
      RETURNING *
    `
    return NextResponse.json({ channel: created[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}


