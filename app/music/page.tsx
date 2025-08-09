"use client"

import dynamic from "next/dynamic"

const MusicPage = dynamic(() => import("@/components/music-page"), { ssr: false })

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <MusicPage />
    </div>
  )
}


