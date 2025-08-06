import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { UserProvider } from "@/hooks/use-user"
import { AnimatedBackground } from "@/components/animated-background"
import { ThemeProvider } from "@/components/theme-provider" // Import ThemeProvider
import { Toaster } from "@/components/ui/toaster" // Import Toaster
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Real Chat - Modern Communication",
  description: "A modern real-time chat application with advanced features",
  icons: {
    icon: "/favicon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Default theme
          enableSystem // Enable system theme detection
          disableTransitionOnChange // Prevent flash of unstyled content
        >
          <AnimatedBackground />
          <UserProvider>
            <div className="relative z-10">
              {children}
            </div>
          </UserProvider>
          <Toaster /> {/* Add Toaster for notifications */}
        </ThemeProvider>
      </body>
    </html>
  )
}
