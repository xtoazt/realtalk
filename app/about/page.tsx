import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <Card className="animate-fadeIn">
          <CardHeader>
            <CardTitle>About real.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold text-foreground">Created by Rohan</p>
            <p className="text-muted-foreground">idk why I made this just so I could talk ig</p>
            <p className="text-muted-foreground">plz don't be afraid to share, it actually wont get blocked (prob)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
