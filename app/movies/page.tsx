"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Play, Search, X } from "lucide-react"

type Movie = {
  id: number
  title: string
  poster_path: string | null
}

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
const EMBED_BASE = "https://vidsrc.in/embed/movie/"

export default function MoviesPage() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "2713804610e1e236b1cf44bfac3a7776"

  const [top10, setTop10] = useState<Movie[]>([])
  const [all, setAll] = useState<Movie[]>([])
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Movie | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)
  const originalOpenRef = useRef<typeof window.open | null>(null)

  const fetchMovies = useCallback(async (page = 1, search?: string) => {
    const url = search
      ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(search)}&page=${page}`
      : `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`
    const res = await fetch(url)
    const data = await res.json()
    return (data.results || []) as Movie[]
  }, [apiKey])

  useEffect(() => {
    // initial load
    fetchMovies(1).then((movies) => {
      const random = [...movies].sort(() => 0.5 - Math.random()).slice(0, 10)
      setTop10(random)
      setAll(movies)
    })
  }, [fetchMovies])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        fetchMovies(1, query.trim()).then(setAll)
      } else {
        fetchMovies(1).then(setAll)
      }
    }, 250)
    return () => clearTimeout(timeout)
  }, [query, fetchMovies])

  const scrollRight = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: rowRef.current.clientWidth * 0.8, behavior: "smooth" })
    }
  }
  const scrollLeft = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: -rowRef.current.clientWidth * 0.8, behavior: "smooth" })
    }
  }

  const openMovie = (movie: Movie) => {
    setSelected(movie)
    setShowPlayer(false)
  }

  const playSelected = () => {
    if (!selected) return
    // Temporarily block popups while player active
    originalOpenRef.current = window.open
    ;(window as any).open = () => null
    setShowPlayer(true)
  }

  const closeOverlay = () => {
    setShowPlayer(false)
    setSelected(null)
    if (originalOpenRef.current) {
      window.open = originalOpenRef.current
      originalOpenRef.current = null
    }
  }

  const featured = useMemo(() => top10[0], [top10])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className="h-64 md:h-96 rounded-b-[40px] relative overflow-hidden"
        style={{
          backgroundImage: featured?.poster_path ? `url(${IMAGE_BASE}${featured.poster_path})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-4 left-4 hue-bg/50 px-4 py-2 rounded-full text-sm backdrop-blur">
          Real TV • Fresh releases in 4K when available
        </div>
      </div>

      {/* Search */}
      <div className="sticky top-4 z-10 flex justify-end px-4">
        <div className="glass-effect flex items-center gap-2 px-4 py-2 rounded-full shadow-lg">
          <Search className="h-4 w-4 opacity-70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* Top 10 */}
      <section className="mt-8 px-4">
        <h2 className="text-xl font-semibold mb-2">Top 10 Today</h2>
        <div className="relative">
          <div ref={rowRef} className="flex gap-3 overflow-x-auto no-scrollbar p-2 pr-10">
            {top10.map((m) => (
              <button
                key={m.id}
                onClick={() => openMovie(m)}
                className="flex-none w-40 rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105"
              >
                {m.poster_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${IMAGE_BASE}${m.poster_path}`} alt={m.title} className="w-full h-auto" />
                ) : (
                  <div className="w-full h-60 bg-muted" />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* All */}
      <section className="mt-6 px-4">
        <h2 className="text-xl font-semibold mb-3">All</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {all.map((m) => (
            <button
              key={m.id}
              onClick={() => openMovie(m)}
              className="rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105"
            >
              {m.poster_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`${IMAGE_BASE}${m.poster_path}`} alt={m.title} className="w-full h-auto" />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Overlay */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <button
            onClick={closeOverlay}
            className="absolute top-4 left-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 shadow-lg"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Poster */}
          {selected.poster_path && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${IMAGE_BASE}${selected.poster_path}`}
              alt={selected.title}
              className="hidden md:block absolute top-6 right-6 w-60 h-80 object-cover rounded-3xl shadow-2xl"
            />
          )}

          {/* Title & Play */}
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{selected.title}</h3>
            {!showPlayer ? (
              <button
                onClick={playSelected}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg"
              >
                <Play className="h-5 w-5" /> Play
              </button>
            ) : (
              <div className="absolute inset-0">
                <iframe
                  key={selected.id}
                  src={`${EMBED_BASE}${selected.id}`}
                  className="w-full h-full"
                  // Strong sandbox to block popups/ads
                  sandbox="allow-same-origin allow-scripts"
                  allow="autoplay; encrypted-media"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}



