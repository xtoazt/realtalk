"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Heart, Code, Users, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { ChangelogViewer } from "@/components/changelog-viewer"
import { ChangelogTester } from "@/components/changelog-tester"

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen p-4 relative z-10">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="hover-lift">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">About real.</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="glass-effect hover-lift animate-fadeIn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 hue-accent" />
                What is real.?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                real. is a modern, real-time chat application built for authentic conversations. Connect with friends,
                share ideas, and express yourself in a clean, distraction-free environment.
              </p>
              <p className="text-muted-foreground">plz don't be afraid to share, it actually wont get blocked (prob)</p>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift animate-fadeIn" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 hue-accent" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Real-time messaging with friends</li>
                <li>• Group chats and direct messages</li>
                <li>• Image sharing and emoji reactions</li>
                <li>• Customizable themes and colors</li>
                <li>• Polls and interactive features</li>
                <li>• Desktop notifications</li>
                <li>• Clean, modern interface</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 hue-accent" />
                Built With
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Next.js 14 with App Router</li>
                <li>• TypeScript for type safety</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Neon PostgreSQL database</li>
                <li>• Vercel for deployment</li>
                <li>• JWT authentication</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-effect hover-lift animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 hue-accent" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Join our growing community of users who value authentic, real-time communication.
              </p>
              <p className="text-muted-foreground">DM *rohan* for questions or concerns</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="hover-glow bg-transparent">
                  Join Community
                </Button>
                <Button variant="outline" size="sm" className="hover-glow bg-transparent">
                  Report Issues
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 lg:col-span-3">
            <div className="glass-effect hover-lift animate-fadeIn" style={{ animationDelay: "0.4s" }}>
              <ChangelogViewer />
            </div>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="md:col-span-2 lg:col-span-3">
              <div className="glass-effect hover-lift animate-fadeIn" style={{ animationDelay: "0.45s" }}>
                <ChangelogTester />
              </div>
            </div>
          )}
        </div>

        <Card className="glass-effect hover-lift animate-fadeIn mt-6" style={{ animationDelay: "0.5s" }}>
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Ready to get started?</h3>
            <p className="text-muted-foreground mb-6">Experience real-time communication like never before.</p>
            <Button onClick={() => router.push("/dashboard")} className="hover-glow hue-shadow">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
