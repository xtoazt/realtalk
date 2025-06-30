import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")
    console.log("Signout successful: auth-token cookie deleted")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Signout API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
