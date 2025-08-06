import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { UserProvider } from "@/hooks/use-user"
import { AnimatedBackground } from "@/components/animated-background"
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
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AnimatedBackground />
        <UserProvider>
          <div className="relative z-10">
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  )
}
