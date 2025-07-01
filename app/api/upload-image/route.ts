import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export const config = {
  runtime: "edge",
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 })
  }

  try {
    // Use addRandomSuffix: true to ensure unique filenames and prevent overwrite errors
    const blob = await put(filename, request.body!, {
      access: "public",
      addRandomSuffix: true,
    })

    return NextResponse.json(blob)
  } catch (error: any) {
    console.error("Failed to upload image:", error)
    return NextResponse.json({ error: `Failed to upload image: ${error.message}` }, { status: 500 })
  }
}
