import { NextResponse } from "next/server"

export async function POST() {
  const apiKey = process.env.HYPERBEAM_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Missing HYPERBEAM_API_KEY env" }, { status: 500 })
  }
  try {
    const res = await fetch("https://engine.hyperbeam.com/v0/vm", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      // You can pass options like default_url here if desired
      body: JSON.stringify({}),
      // Ensure Node runtime; don't use Next edge fetch cache
      cache: "no-store",
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Hyperbeam error: ${res.status} ${text}` }, { status: 500 })
    }

    const data = await res.json()
    // data typically contains: session_id, embed_url, admin_token
    return NextResponse.json({
      sessionId: data.session_id,
      embedUrl: data.embed_url,
      adminToken: data.admin_token,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}


