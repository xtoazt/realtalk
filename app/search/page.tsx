"use client"

import { useMemo, useRef, useState } from "react"

export default function Page() {
  const [ready, setReady] = useState(false)
  const [address, setAddress] = useState("")
  const [tabs, setTabs] = useState<{ id: string; title: string; url: string }[]>([
    { id: "t1", title: "New Tab", url: "" },
  ])
  const [activeTabId, setActiveTabId] = useState("t1")
  const [error, setError] = useState<string | null>(null)
  const frameRef = useRef<HTMLIFrameElement | null>(null)

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId)!, [tabs, activeTabId])

  // No SW or external scripts needed with simple CORS proxy
  const ready = true

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
      const url = toUrl(target ?? address)
      if (!url) return
      const proxied = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
      // Update active tab url and optimistic title
      const hostname = (() => { try { return new URL(url).hostname } catch { return url } })()
      setTabs((prev) => prev.map((t) => t.id === activeTabId ? { ...t, url: proxied, title: hostname } : t))
      if (frameRef.current) frameRef.current.src = proxied
    } catch (e: any) {
      setError(e?.message || "Navigation failed")
    }
  }

  const goHome = () => navigate("https://www.google.com")
  const goBack = () => frameRef.current?.contentWindow?.history.back()
  const goForward = () => frameRef.current?.contentWindow?.history.forward()
  const reload = () => frameRef.current?.contentWindow?.location.reload()

  const addTab = (initialUrl?: string) => {
    const id = `t${Math.random().toString(36).slice(2, 8)}`
    const title = "New Tab"
    setTabs((prev) => prev.concat([{ id, title, url: "" }]))
    setActiveTabId(id)
    if (initialUrl) {
      setAddress(initialUrl)
      setTimeout(() => navigate(initialUrl), 0)
    } else {
      setAddress("")
      if (frameRef.current) frameRef.current.src = "about:blank"
    }
  }

  const closeTab = (id: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== id))
    if (id === activeTabId) {
      const remaining = tabs.filter((t) => t.id !== id)
      const next = remaining[remaining.length - 1] || { id: `t${Date.now()}`, title: "New Tab", url: "" }
      if (!remaining.length) setTabs([next])
      setActiveTabId(next.id)
      setAddress("")
      if (frameRef.current) frameRef.current.src = next.url || "about:blank"
    }
  }

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn min-h-[60vh] px-4">
      <h1 className="text-xl font-semibold mb-4">Search</h1>
      {/* Tabs Bar */}
      <div className="flex items-center gap-2 mb-2 overflow-x-auto">
        {tabs.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm whitespace-nowrap cursor-pointer ${
              t.id === activeTabId ? "bg-black text-white border-black" : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
            }`}
            onClick={() => {
              setActiveTabId(t.id)
              setAddress("")
              if (frameRef.current) frameRef.current.src = t.url || "about:blank"
            }}
          >
            <span className="max-w-[140px] truncate">{t.title || "New Tab"}</span>
            {tabs.length > 1 && (
              <button className="ml-1 text-xs" onClick={(e) => { e.stopPropagation(); closeTab(t.id) }}>
                ×
              </button>
            )}
          </div>
        ))}
        <button className="px-2 py-1 rounded-full border" onClick={() => addTab()}>+</button>
      </div>
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


