"use client"

import { useEffect, useState } from "react"

export default function Page() {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/hyperbeam", { method: "POST" })
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)
        setEmbedUrl(data.embedUrl)
      })
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn min-h-[60vh] px-4">
      <h1 className="text-xl font-semibold mb-4">Virtual Machine</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!embedUrl ? (
        <div className="text-muted-foreground">Creating VM…</div>
      ) : (
        <iframe
          src={embedUrl}
          className="w-full h-[70vh] rounded-xl border"
          allow="autoplay; clipboard-read; clipboard-write; fullscreen"
        />
      )}
    </div>
  )}


