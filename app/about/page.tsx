"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Info } from "lucide-react"

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background p-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto pt-20">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">About real.</h1>
        </div>

        <Card className="animate-fadeIn">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              real. is designed to be a simple, fast, and reliable real-time chat application. Our goal is to provide a
              seamless communication experience for everyone.
            </p>
            <p>
              We believe in open and honest communication.
              <br />
              {"plz don't be afraid to share, it actually wont get blocked (prob)"}
            </p>
            <p>
              This project is continuously evolving, with new features and improvements being added regularly. We are
              committed to building a platform that prioritizes user experience and privacy.
            </p>
            <p className="font-semibold text-foreground">DM *rohan* for questions or concerns</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
