"use client"

import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { UserProvider } from "@/hooks/use-user" // ✅ correct alias path

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
      <UserProvider>
        <body className={inter.className}>{children}</body>
      </UserProvider>
    </NextThemesProvider>
  )
}
