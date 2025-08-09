"use client"

export default function RadioPage() {
  const stations = [
    { id: "s250052", url: "https://tunein.com/embed/player/s250052/" },
    { id: "s249994", url: "https://tunein.com/embed/player/s249994/" },
    { id: "s247158", url: "https://tunein.com/embed/player/s247158/" },
    { id: "s303755", url: "https://tunein.com/embed/player/s303755/" },
    { id: "s22393", url: "https://tunein.com/embed/player/s22393/" },
  ]

  return (
    <div className="min-h-[60vh] px-4">
      <h1 className="text-xl font-semibold mb-4">Radio</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((s) => (
          <div key={s.id} className="rounded-xl overflow-hidden bg-card border shadow-md">
            <iframe
              src={s.url}
              className="w-full"
              style={{ height: 140, border: "none" }}
              allow="autoplay; encrypted-media"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              title={`Radio ${s.id}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}


