"use client"

import dynamic from "next/dynamic"

const RadioPage = dynamic(() => import("@/components/radio-page"), { ssr: false })

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <RadioPage />
    </div>
  )
}


