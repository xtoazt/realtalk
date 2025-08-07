"use client"

import type React from "react"
import "./globals.css"
import { Inter } from 'next/font/google'
import { ThemeProvider } from "next-themes"
import { UserProvider } from "@/hooks/use-user"
import { ParticleBackground } from "@/components/particle-background"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <UserProvider>
            <ParticleBackground />
            {children}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
