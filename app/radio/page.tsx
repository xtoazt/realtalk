"use client"

import dynamic from "next/dynamic"

const RadioPage = dynamic(() => import("@/components/radio-page"), { ssr: false })

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto animate-fadeIn px-4">
      <div className="sticky top-4 z-10 mb-3">
        <button
          onClick={()=> location.href = '/dashboard'}
          className="text-xs px-3 py-1 rounded-full border backdrop-blur-md bg-white/40 dark:bg-black/30 text-black dark:text-white border-white/40 dark:border-white/20 hover:bg-white/60 dark:hover:bg-black/50"
        >
          Back to Dashboard
        </button>
      </div>
      <RadioPage />
    </div>
  )
}


