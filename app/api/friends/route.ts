import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createFriendship, getFriendships } from "@/lib/db"

export async function GET() {
  console.log("[friends-api] GET request received")
  try {
    const user = await getCurrentUser()
    console.log("[friends-api] getCurrentUser result:", !!user)
    
    if (!user) {
      console.log("[friends-api] No user found, returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[friends-api] Fetching friendships for user:", user.id)
    const friendships = await getFriendships(user.id)
    console.log("[friends-api] Found friendships:", friendships?.length || 0)
    return NextResponse.json({ friendships })
  } catch (error: any) {
    console.error("GET Friends API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { addresseeId } = await request.json()

    if (!addresseeId) {
      return NextResponse.json({ error: "Addressee ID is required" }, { status: 400 })
    }

    const friendship = await createFriendship(user.id, addresseeId)
    return NextResponse.json({ friendship })
  } catch (error: any) {
    console.error("POST Friend Request API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
