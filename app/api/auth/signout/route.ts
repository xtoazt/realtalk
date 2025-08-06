import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Delete the session token cookie
    cookieStore.set("session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    })

    // Also try to delete without options (fallback)
    cookieStore.delete("session_token")

    console.log("Signout successful: session_token cookie deleted")

    return NextResponse.json(
      { success: true },
      {
        headers: {
          // Clear any cached responses
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error: any) {
    console.error("Signout API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
