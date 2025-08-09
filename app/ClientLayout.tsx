"use client"

import type React from "react"
import "./globals.css"
import { Inter } from 'next/font/google'
import { ThemeProvider } from "next-themes"
import { UserProvider } from "@/hooks/use-user"
import { ParticleBackground } from "@/components/particle-background"
import { useEffect } from "react"
import { VoiceWidget } from "@/components/voice/VoiceWidget"
import { FreezeOverlay } from "@/components/FreezeOverlay"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Register service worker for basic notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <html lang="en" suppressHydrationWarning className="hue-blue">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={true}
        >
          <UserProvider>
            <ParticleBackground />
            {children}
            <VoiceWidget />
            <FreezeOverlay />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
