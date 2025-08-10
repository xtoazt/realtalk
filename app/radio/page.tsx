"use client"

import dynamic from "next/dynamic"

const RadioPage = dynamic(() => import("@/components/radio-page"), { ssr: false })

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto animate-fadeIn px-4">
      <div className="sticky top-4 z-10 mb-3">
        <button onClick={()=> location.href = '/dashboard'} className="text-xs px-3 py-1 rounded-full border text-white/90 border-white/30 hover:bg-white/10">Back to Dashboard</button>
      </div>
      <RadioPage />
    </div>
  )
}


