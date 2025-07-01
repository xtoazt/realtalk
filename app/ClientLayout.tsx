"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { UserProvider } from "@/hooks/use-user"

export default function ClientLayout({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
      <UserProvider>{children}</UserProvider>
    </NextThemesProvider>
  )
}
