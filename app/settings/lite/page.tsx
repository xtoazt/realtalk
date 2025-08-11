"use client"

import SettingsPage from "@/app/settings/page"

export default function LiteSettings() {
  return (
    <div className="min-h-screen p-4 relative z-10">
      <div className="max-w-3xl mx-auto pt-16">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold">Settings (Lite)</div>
          <p className="text-sm text-muted-foreground">All the same controls, in a cleaner layout.</p>
        </div>
        <div className="rounded-2xl border glass-surface p-2">
          <SettingsPage />
        </div>
      </div>
    </div>
  )
}


