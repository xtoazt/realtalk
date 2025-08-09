"use client"

import { useEffect, useRef, useState } from "react"

export default function Page() {
  const [ready, setReady] = useState(false)
  const [address, setAddress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const frameRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const inject = async () => {
      try {
        const addScript = (src: string) =>
          new Promise<void>((resolve, reject) => {
            const s = document.createElement("script")
            s.src = src
            s.defer = true
            s.onload = () => resolve()
            s.onerror = () => reject(new Error(`Failed to load ${src}`))
            document.head.appendChild(s)
          })

        await addScript("https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@3/dist/uv.bundle.js")
        await addScript("/uv/uv.config.js")

        if ("serviceWorker" in navigator) {
          // @ts-ignore - __uv$config injected by uv.config.js
          await navigator.serviceWorker.register("/uv/uv.sw.js", { scope: (self as any).__uv$config.prefix })
        }
        setReady(true)
      } catch (e: any) {
        setError(e?.message || "Failed to initialize proxy")
      }
    }
    inject()
  }, [])

  const toUrl = (input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return ""
    try {
      const u = new URL(trimmed)
      return u.toString()
    } catch {
      return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`
    }
  }

  const navigate = (target?: string) => {
    try {
      // @ts-ignore - __uv$config injected by uv.config.js
      const cfg = (self as any).__uv$config
      const url = toUrl(target ?? address)
      if (!url) return
      const proxied = cfg.prefix + cfg.encodeUrl(url)
      if (frameRef.current) {
        frameRef.current.src = proxied
      } else {
        window.location.href = proxied
      }
    } catch (e: any) {
      setError(e?.message || "Navigation failed")
    }
  }

  const goHome = () => navigate("https://www.google.com")
  const goBack = () => frameRef.current?.contentWindow?.history.back()
  const goForward = () => frameRef.current?.contentWindow?.history.forward()
  const reload = () => frameRef.current?.contentWindow?.location.reload()

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn min-h-[60vh] px-4">
      <h1 className="text-xl font-semibold mb-4">Search</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex gap-2 mb-3">
        <button className="px-3 py-2 rounded border" onClick={goBack} disabled={!ready}>&larr;</button>
        <button className="px-3 py-2 rounded border" onClick={goForward} disabled={!ready}>&rarr;</button>
        <button className="px-3 py-2 rounded border" onClick={reload} disabled={!ready}>Reload</button>
        <button className="px-3 py-2 rounded border" onClick={goHome} disabled={!ready}>Home</button>
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Enter URL or search…"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate()
          }}
          disabled={!ready}
        />
        <button
          className="px-4 py-2 rounded bg-black text-white border"
          onClick={() => navigate()}
          disabled={!ready}
        >
          Go
        </button>
      </div>
      <iframe ref={frameRef} className="w-full h-[70vh] rounded-xl border" />
    </div>
  )
}


