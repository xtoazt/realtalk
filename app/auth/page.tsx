"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MessageCircle, AlertCircle } from 'lucide-react'

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
    const email = formData.get("email") as string
    const signupCode = formData.get("signupCode") as string

    console.log("[auth-page] Signup attempt:", { username, signupCode: signupCode ? "provided" : "none" })

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          username, 
          password, 
          email: email || undefined,
          signupCode: signupCode || undefined 
        }),
      })

      console.log("[auth-page] Signup response status:", response.status)
      const data = await response.json()

      if (response.ok) {
        console.log("[auth-page] Signup successful, redirecting...")
        router.push("/dashboard")
        router.refresh()
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
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      console.log("[auth-page] Signin response status:", response.status)
      const data = await response.json()

      if (response.ok) {
        console.log("[auth-page] Signin successful, redirecting...")
        router.push("/dashboard")
        router.refresh()
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Real Chat
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Connect with friends in real-time
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-4 border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      name="username"
                      type="text"
                      placeholder="Username"
                      required
                      disabled={isLoading}
                      className="bg-background/50 border-border/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                      disabled={isLoading}
                      className="bg-background/50 border-border/50 backdrop-blur-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      name="username"
                      type="text"
                      placeholder="Username (min 3 characters)"
                      required
                      disabled={isLoading}
                      minLength={3}
                      className="bg-background/50 border-border/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email (optional)"
                      disabled={isLoading}
                      className="bg-background/50 border-border/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password (min 6 characters)"
                      required
                      disabled={isLoading}
                      minLength={6}
                      className="bg-background/50 border-border/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      name="signupCode"
                      type="text"
                      placeholder="Signup code (optional)"
                      disabled={isLoading}
                      className="bg-background/50 border-border/50 backdrop-blur-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use "asdf" for special features or "qwea" for gold status
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
