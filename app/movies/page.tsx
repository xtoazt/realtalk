"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Play, Search, X, Settings, ExternalLink, Copy, Info, Film, Loader2, Grid, List, Heart, HeartOff, Star } from "lucide-react"

type Movie = {
  id: number
  title: string
  poster_path: string | null
  release_date?: string
  overview?: string
  vote_average?: number
}

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
const buildVidSrc = (
  version: 'v2' | 'v3',
  identifier: string, // tmdb numeric id or imdb tt id
  autoPlay: boolean,
  opts?: { poster?: boolean }
) => {
  const base = `https://vidsrc.cc/${version}/embed/movie/${identifier}`
  const params = new URLSearchParams()
  if (version === 'v3') {
    params.set('autoPlay', autoPlay ? 'true' : 'false')
    if (typeof opts?.poster === 'boolean') params.set('poster', String(opts.poster))
  }
  const query = params.toString()
  return query ? `${base}?${query}` : base
}

export default function MoviesPage() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || "2713804610e1e236b1cf44bfac3a7776"

  const [top10, setTop10] = useState<Movie[]>([])
  const [all, setAll] = useState<Movie[]>([])
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Movie | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [category, setCategory] = useState<'popular'|'top_rated'|'upcoming'|'now_playing'>('popular')
  const [page, setPage] = useState(1)
  const [loadingList, setLoadingList] = useState(false)
  const [compact, setCompact] = useState(false)
  const [watchlist, setWatchlist] = useState<Movie[]>([])
  const [showWatchlist, setShowWatchlist] = useState(true)
  const [useImdb, setUseImdb] = useState(true)
  const [version, setVersion] = useState<'v2' | 'v3'>('v3')
  const [autoPlay, setAutoPlay] = useState(false)
  const [showPoster, setShowPoster] = useState(false)
  const [embedSrc, setEmbedSrc] = useState<string>("")
  const [loadingEmbed, setLoadingEmbed] = useState(false)
  const [embedError, setEmbedError] = useState<string | null>(null)
  const [imdbByTmdb, setImdbByTmdb] = useState<Record<number, string | undefined>>({})
  const rowRef = useRef<HTMLDivElement>(null)
  const originalOpenRef = useRef<typeof window.open | null>(null)

  const fetchMovies = useCallback(async (page = 1, search?: string, category?: 'popular'|'top_rated'|'upcoming'|'now_playing') => {
    const url = search
      ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(search)}&page=${page}`
      : `https://api.themoviedb.org/3/movie/${category || 'popular'}?api_key=${apiKey}&page=${page}`
    const res = await fetch(url)
    const data = await res.json()
    return (data.results || []) as Movie[]
  }, [apiKey])

  const fetchImdbId = useCallback(async (tmdbId: number) => {
    if (imdbByTmdb[tmdbId] !== undefined) return imdbByTmdb[tmdbId]
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${apiKey}`)
      const data = await res.json()
      const imdb = data?.imdb_id || undefined
      setImdbByTmdb((prev) => ({ ...prev, [tmdbId]: imdb }))
      return imdb
    } catch {
      setImdbByTmdb((prev) => ({ ...prev, [tmdbId]: undefined }))
      return undefined
    }
  }, [apiKey, imdbByTmdb])

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
      setLoadingList(true)
      if (query.trim()) {
        fetchMovies(1, query.trim()).then((res)=>{ setAll(res); setPage(1) }).finally(()=> setLoadingList(false))
      } else {
        fetchMovies(1, undefined, category).then((res)=>{ setAll(res); setPage(1) }).finally(()=> setLoadingList(false))
      }
    }, 250)
    return () => clearTimeout(timeout)
  }, [query, category, fetchMovies])

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
    setEmbedError(null)
  }

  const playSelected = () => {
    if (!selected) return
    // Temporarily block popups while player active
    originalOpenRef.current = window.open
    ;(window as any).open = () => null
    setShowPlayer(true)
    setLoadingEmbed(true)
    ;(async () => {
      const imdb = useImdb ? await fetchImdbId(selected.id) : undefined
      const identifier = imdb && imdb.startsWith('tt') ? imdb : String(selected.id)
      const src = buildVidSrc(version, identifier, autoPlay, { poster: showPoster })
      setEmbedSrc(src)
    })()
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

  const yearOf = (date?: string) => (date ? new Date(date).getFullYear() : undefined)
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Link copied')
    } catch {}
  }

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

      {/* Toolbar */}
      <div className="sticky top-4 z-10 px-4 mt-3">
        <div className="glass-effect flex items-center flex-wrap gap-2 px-4 py-2 rounded-full shadow-lg">
          <button onClick={()=> location.href = '/dashboard'} className="text-xs px-3 py-1 rounded-full border text-white/90 border-white/30 hover:bg-white/10">Back to Dashboard</button>
          <div className="flex items-center gap-1 mr-2">
            {(['popular','top_rated','upcoming','now_playing'] as const).map((c) => (
              <button key={c} onClick={()=>setCategory(c)} className={`text-xs px-2 py-1 rounded-full border ${category===c? 'bg-white text-black border-white' : 'text-white/80 border-white/30 hover:bg-white/10'}`}>{c.replace('_',' ')}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Search className="h-4 w-4 opacity-70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies..."
              className="bg-transparent outline-none text-sm"
            />
          </div>
          <div className="w-px h-4 bg-white/20 mx-2" />
          <button className="text-xs px-2 py-1 rounded-full border text-white/80 border-white/30 hover:bg-white/10" onClick={()=>setCompact(v=>!v)}>
            {compact ? <List className="h-3 w-3 inline mr-1" /> : <Grid className="h-3 w-3 inline mr-1" />} {compact? 'Comfort' : 'Compact'}
          </button>
          <button className="text-xs px-2 py-1 rounded-full border text-white/80 border-white/30 hover:bg-white/10" onClick={()=>setShowWatchlist(v=>!v)}>
            <Heart className="h-3 w-3 inline mr-1" /> {showWatchlist? 'Hide' : 'Show'} Watchlist
          </button>
        </div>
      </div>

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Heart className="h-4 w-4 text-pink-400" /> Watchlist</h2>
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto no-scrollbar p-2">
              {watchlist.map((m) => (
                <button key={`wl-${m.id}`} onClick={()=>openMovie(m)} className="flex-none w-36 rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 relative group">
                  {m.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${IMAGE_BASE}${m.poster_path}`} alt={m.title} className="w-full h-auto" />
                  ) : (
                    <div className="w-full h-52 bg-muted" />
                  )}
                  <span className="absolute bottom-1 left-1 right-1 text-[11px] bg-black/60 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">{m.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

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
        {loadingList && <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
        <div className={`grid ${compact? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'}`}>
          {all.map((m) => (
            <button
              key={m.id}
              onClick={() => openMovie(m)}
              className="rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 relative group"
            >
              {m.poster_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`${IMAGE_BASE}${m.poster_path}`} alt={m.title} className="w-full h-auto" />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted" />
              )}
              <div className="absolute top-1 left-1 text-[11px] bg-black/60 px-1.5 py-0.5 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <Star className="h-3 w-3 text-yellow-400" /> {m.vote_average?.toFixed(1) || '—'}
              </div>
              <button
                onClick={(e)=>{ e.stopPropagation();
                  setWatchlist((prev)=> {
                    const exists = prev.some((x)=>x.id===m.id)
                    const next = exists ? prev.filter(x=>x.id!==m.id) : prev.concat([m])
                    try { localStorage.setItem('watchlist', JSON.stringify(next)) } catch {}
                    return next
                  })
                }}
                title="Toggle watchlist"
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                {watchlist.some(x=>x.id===m.id) ? <Heart className="h-3.5 w-3.5 text-pink-400" /> : <HeartOff className="h-3.5 w-3.5 text-white" />}
              </button>
            </button>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={async()=>{
              const nextPage = page + 1
              setLoadingList(true)
              const more = await fetchMovies(nextPage, query.trim()||undefined, category)
              setAll((prev)=> prev.concat(more))
              setPage(nextPage)
              setLoadingList(false)
            }}
            className="px-4 py-2 text-sm rounded-full border hover:bg-white/10"
          >
            Load more
          </button>
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

          {/* Title & Controls */}
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <h3 className="text-2xl md:text-3xl font-bold mb-1">{selected.title} {yearOf(selected.release_date) ? <span className="text-base text-muted-foreground">({yearOf(selected.release_date)})</span> : null}</h3>
            {selected.overview && <p className="max-w-2xl text-sm text-muted-foreground mb-3 line-clamp-3">{selected.overview}</p>}
            {!showPlayer ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full">
                  <Settings className="h-4 w-4" />
                  <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={useImdb} onChange={(e)=>setUseImdb(e.target.checked)} /> Use IMDB when available</label>
                  <select className="bg-transparent text-sm border rounded px-2 py-1" value={version} onChange={(e)=>setVersion(e.target.value as 'v2'|'v3')}>
                    <option value="v3">v3</option>
                    <option value="v2">v2</option>
                  </select>
                  <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={autoPlay} onChange={(e)=>setAutoPlay(e.target.checked)} /> Autoplay</label>
                  <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={showPoster} onChange={(e)=>setShowPoster(e.target.checked)} /> Poster</label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={playSelected}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg"
                  >
                    <Play className="h-5 w-5" /> Play
                  </button>
                </div>
                <div className="text-xs text-white/70 flex items-center gap-1"><Info className="h-3 w-3" /> If playback fails, try switching version.</div>
              </div>
            ) : (
              <div className="absolute inset-0">
                {loadingEmbed && (
                  <div className="absolute inset-0 grid place-items-center text-white/80"><div className="w-6 h-6 border-2 border-white/60 border-t-transparent rounded-full animate-spin" /></div>
                )}
                {embedError && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white rounded px-3 py-1 text-sm shadow">{embedError}</div>
                )}
                <iframe
                  key={embedSrc}
                  src={embedSrc}
                  className="w-full h-full"
                  sandbox="allow-same-origin allow-scripts allow-pointer-lock allow-forms"
                  allow="autoplay; encrypted-media; fullscreen"
                  referrerPolicy="no-referrer"
                  onLoad={() => setLoadingEmbed(false)}
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <button className="text-xs bg-white/10 hover:bg-white/20 text-white rounded px-3 py-1" onClick={() => window.open(embedSrc, '_blank') }><ExternalLink className="h-3 w-3 inline mr-1" />Open in new tab</button>
                  <button className="text-xs bg-white/10 hover:bg-white/20 text-white rounded px-3 py-1" onClick={() => copyToClipboard(embedSrc)}><Copy className="h-3 w-3 inline mr-1" />Copy link</button>
                  <button className="text-xs bg-white/10 hover:bg-white/20 text-white rounded px-3 py-1" onClick={() => { setShowPlayer(false); setTimeout(playSelected, 0) }}>Reload</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}



