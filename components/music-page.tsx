"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Play, Search, X } from "lucide-react"

type SearchResult = {
  id: string
  title: string
  img: string
}

type SearchResponse = {
  status: number
  response: SearchResult[]
  message: string
}

type FetchResponse = {
  status: number
  response: string
  message: string
}

type LyricsResponse = {
  status: number
  response: string // HTML string
  message: string
}

const API_BASE = "https://musicapi.x007.workers.dev"
const ENGINES = ["wunk", "gaama", "seevn", "hunjama", "mtmusic"] as const
type Engine = typeof ENGINES[number]

export default function MusicPage() {
  const [engine, setEngine] = useState<Engine>("wunk")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [lyricsHtml, setLyricsHtml] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const canSearch = useMemo(() => query.trim().length > 1, [query])

  const doSearch = useCallback(async () => {
    if (!canSearch) {
      setResults([])
      return
    }
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setLoading(true)
    setError(null)
    try {
      const url = `${API_BASE}/search?q=${encodeURIComponent(query.trim())}&searchEngine=${engine}`
      const res = await fetch(url, { signal: ac.signal })
      const data = (await res.json()) as SearchResponse
      if (data.status !== 200) throw new Error(data.message || "Search failed")
      setResults(data.response || [])
    } catch (e: any) {
      if (e?.name === "AbortError") return
      console.error("[music] search error", e)
      setError(e?.message || "Failed to search. Try again.")
    } finally {
      setLoading(false)
    }
  }, [engine, query, canSearch])

  useEffect(() => {
    const t = setTimeout(() => {
      doSearch()
    }, 300)
    return () => clearTimeout(t)
  }, [doSearch])

  const openTrack = async (track: SearchResult) => {
    setSelected(track)
    setLyricsHtml(null)
    setShowPlayer(false)
    setStreamUrl(null)
    try {
      const res = await fetch(`${API_BASE}/fetch?id=${encodeURIComponent(track.id)}`)
      const data = (await res.json()) as FetchResponse
      if (data.status !== 200 || !data.response) throw new Error(data.message || "Failed to fetch track")
      setStreamUrl(data.response)
      setShowPlayer(true)
    } catch (e: any) {
      console.error("[music] fetch error", e)
      setError(e?.message || "Failed to load track.")
    }
  }

  const fetchLyrics = async () => {
    if (!selected) return
    try {
      const res = await fetch(`${API_BASE}/lyrics?id=${encodeURIComponent(selected.id)}`)
      const data = (await res.json()) as LyricsResponse
      if (data.status !== 200 || !data.response) throw new Error(data.message || "No lyrics available")
      setLyricsHtml(data.response)
    } catch (e: any) {
      console.error("[music] lyrics error", e)
      setLyricsHtml("<p>Lyrics not available.</p>")
    }
  }

  const closeOverlay = () => {
    setShowPlayer(false)
    setSelected(null)
    setStreamUrl(null)
    setLyricsHtml(null)
  }

  const isHls = (url?: string | null) => !!url && url.includes(".m3u8")

  return (
    <div className="min-h-[60vh]">
      {/* Search */}
      <div className="sticky top-4 z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 px-4">
        <div className="glass-effect flex items-center gap-2 px-4 py-2 rounded-full shadow-lg">
          <Search className="h-4 w-4 opacity-70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs..."
            className="bg-transparent outline-none text-sm"
          />
        </div>
        <select
          value={engine}
          onChange={(e) => setEngine(e.target.value as Engine)}
          className="px-3 py-2 rounded-full bg-card border text-sm"
          aria-label="Search engine"
        >
          {ENGINES.map((en) => (
            <option key={en} value={en}>
              {en}
            </option>
          ))}
        </select>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="px-4 py-8 text-center text-muted-foreground animate-pulse">Searching…</div>
      )}
      {error && (
        <div className="px-4 py-4 text-center text-red-500">{error}</div>
      )}

      {/* Results */}
      <div className="mt-6 px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {results.map((r) => (
          <button
            key={r.id}
            onClick={() => openTrack(r)}
            className="rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 bg-card border animate-fadeIn text-left"
            title={r.title}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.img} alt={r.title} className="w-full h-40 object-cover bg-muted" />
            <div className="px-2 py-2 text-sm line-clamp-2">{r.title}</div>
            <div className="px-2 pb-3"><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Play className="h-3 w-3"/> Play</span></div>
          </button>
        ))}
      </div>

      {/* Overlay player */}
      {showPlayer && selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <button
            onClick={closeOverlay}
            className="absolute top-4 left-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 shadow-lg"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute top-6 right-6 left-6 bottom-6 grid grid-rows-[auto,1fr,auto] gap-4">
            <div className="text-center text-white text-lg font-semibold truncate">{selected.title}</div>

            <div className="w-full h-full flex items-center justify-center">
              {isHls(streamUrl) ? (
                <video
                  key={selected.id}
                  src={streamUrl ?? undefined}
                  className="w-full h-full max-h-[70vh]"
                  controls
                  playsInline
                />
              ) : (
                <audio key={selected.id} src={streamUrl ?? undefined} className="w-full" controls autoPlay />
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              {engine === "gaama" && (
                <button
                  onClick={fetchLyrics}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg"
                >
                  Lyrics
                </button>
              )}
            </div>
          </div>

          {lyricsHtml && (
            <div className="absolute bottom-4 left-4 right-4 max-h-48 overflow-auto bg-background/90 text-foreground p-4 rounded-xl shadow-lg">
              {/* Lyrics returned as HTML from API */}
              <div dangerouslySetInnerHTML={{ __html: lyricsHtml }} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}


