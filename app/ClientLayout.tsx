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
      // Apply stored hue immediately on client mount
      try {
        const hue = localStorage.getItem('user-hue')
        if (hue) {
          document.documentElement.className = document.documentElement.className
            .replace(/hue-\w+/g, '')
            .concat(` hue-${hue}`)
        }
      } catch {}
      // iOS Safari viewport height fix and scroll restoration
      window.history.scrollRestoration = 'manual'
      const setVh = () => {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }
      setVh()
      window.addEventListener('resize', setVh)
      return () => window.removeEventListener('resize', setVh)
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
