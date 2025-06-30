import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    console.log("[api/auth/me] User from getCurrentUser:", user ? user.username : "null")

    if (!user) {
      console.log("[api/auth/me] Unauthorized: User is null.")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
