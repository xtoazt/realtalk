"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, X } from "lucide-react"

type Game = { name: string; image: string; url: string; new?: boolean }

const SERVER = "https://gms.parcoil.com"

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [q, setQ] = useState("")
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch("/games.json")
      .then((r) => r.json())
      .then(setGames)
      .catch((e) => console.error("Failed to load games.json", e))
  }, [])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return games
    return games.filter((g) => g.name.toLowerCase().includes(t))
  }, [q, games])

  return (
    <div className="min-h-[60vh]">
      {/* Search */}
      <div className="sticky top-4 z-10 flex justify-end px-4">
        <div className="glass-effect flex items-center gap-2 px-4 py-2 rounded-full shadow-lg animate-fadeIn">
          <Search className="h-4 w-4 opacity-70" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search games..."
            className="bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map((g) => (
          <button
            key={g.url}
            onClick={() => setEmbedUrl(`${SERVER}/${g.url}/`)}
            className="rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 bg-card border animate-fadeIn"
            title={g.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${SERVER}/${g.url}/${g.image}`}
              alt={g.name}
              className="w-full h-40 object-cover bg-muted"
            />
            <div className="px-2 py-2 text-sm text-left truncate">{g.name}</div>
          </button>
        ))}
      </div>

      {/* Overlay player */}
      {embedUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <button
            onClick={() => setEmbedUrl(null)}
            className="absolute top-4 left-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 shadow-lg"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <iframe
            src={embedUrl}
            className="w-full h-full"
            sandbox="allow-same-origin allow-scripts allow-pointer-lock allow-forms"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  )
}


