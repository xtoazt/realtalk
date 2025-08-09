import { NextResponse, type NextRequest } from "next/server"
import { query } from "@/lib/db"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rows = await query`SELECT id, username, name_color, has_gold_animation, profile_picture, bio, is_frozen, frozen_by, freeze_message, freeze_popup_message FROM users WHERE id = ${params.id}`
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ user: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Get user profile information
    const users = await query`
      SELECT id, username, name_color, custom_title, has_gold_animation, 
             profile_picture, bio, signup_code, created_at
      FROM users 
      WHERE id = ${userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error: any) {
    console.error("Get user profile API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
