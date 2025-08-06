"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const signupCode = formData.get("signupCode") as string

    console.log("[auth-page] Signup attempt:", { username, signupCode: signupCode ? "provided" : "none" })

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, signupCode: signupCode || undefined }),
      })

      console.log("[auth-page] Signup response status:", response.status)
      const data = await response.json()

      if (response.ok) {
        console.log("[auth-page] Signup successful, redirecting...")
        router.push("/dashboard")
      } else {
        console.log("[auth-page] Signup failed:", data.error)
        setError(data.error)
      }
    } catch (error: any) {
      console.error("[auth-page] Signup error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    console.log("[auth-page] Signin attempt:", { username })

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      console.log("[auth-page] Signin response status:", response.status)
      const data = await response.json()

      if (response.ok) {
        console.log("[auth-page] Signin successful, redirecting...")
        router.push("/dashboard")
      } else {
        console.log("[auth-page] Signin failed:", data.error)
        setError(data.error)
      }
    } catch (error: any) {
      console.error("[auth-page] Signin error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors duration-300">
      <Card className="w-full max-w-md animate-fadeIn">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">real.</CardTitle>
          <CardDescription>connect fr</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Input
                    name="username"
                    type="text"
                    placeholder="Username"
                    required
                    disabled={isLoading}
                    className="transition-all duration-200 focus:scale-102"
                  />
                </div>
                <div>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    disabled={isLoading}
                    className="transition-all duration-200 focus:scale-102"
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md animate-fadeIn">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Input
                    name="username"
                    type="text"
                    placeholder="Username (min 3 characters)"
                    required
                    disabled={isLoading}
                    minLength={3}
                    className="transition-all duration-200 focus:scale-102"
                  />
                </div>
                <div>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password (min 6 characters)"
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="transition-all duration-200 focus:scale-102"
                  />
                </div>
                <div>
                  <Input
                    name="signupCode"
                    type="text"
                    placeholder="Signup code (optional)"
                    disabled={isLoading}
                    className="transition-all duration-200 focus:scale-102"
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md animate-fadeIn">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
