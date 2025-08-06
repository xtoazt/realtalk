import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    console.log("[/api/auth/me] GET request received")
    
    const user = await getCurrentUser()
    
    if (!user) {
      console.log("[/api/auth/me] No authenticated user")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("[/api/auth/me] Returning user:", user.username)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("[/api/auth/me] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
