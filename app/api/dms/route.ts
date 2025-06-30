import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getUserDMs } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dms = await getUserDMs(user.id)
    return NextResponse.json({ dms })
  } catch (error: any) {
    console.error("GET DMs API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
