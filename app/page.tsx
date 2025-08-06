export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function HomePage() {
  console.log("[HomePage] Checking user authentication...")
  
  const user = await getCurrentUser()

  if (user) {
    console.log("[HomePage] User authenticated, redirecting to dashboard:", user.username)
    redirect("/dashboard")
  } else {
    console.log("[HomePage] No user authenticated, redirecting to auth")
    redirect("/auth")
  }
}
