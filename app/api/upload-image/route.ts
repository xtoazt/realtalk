import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export const config = {
  runtime: "edge",
}

export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 })
  }

  try {
    const blob = await put(filename, request.body!, {
      access: "public",
    })

    return NextResponse.json(blob)
  } catch (error: any) {
    console.error("Vercel Blob upload error:", error)
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 })
  }
}
