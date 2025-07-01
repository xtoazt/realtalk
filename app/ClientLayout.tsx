"use client"

import type React from "react"

import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { useUser } from "@/hooks/use-user" // Import useUser
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser() // Use the user hook

  useEffect(() => {
    if (!loading && user) {
      document.title = `real. | ${user.username}` // Set dynamic title
    } else if (!loading && !user) {
      document.title = "real. | Auth" // Default title for auth page
    } else {
      document.title = "real." // Loading state
    }
  }, [user, loading])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="data-theme" defaultTheme="monochrome" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
