"use client"

import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Settings, MessageCircle, Users, Calendar, Search, Bell } from 'lucide-react'
import { useRouter } from "next/navigation"
import { getUsernameClassName, getUsernameColorStyle } from "@/lib/utils"

export default function DashboardPage() {
  const { user, loading, error } = useUser()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xl text-foreground">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4">{error || "Please log in to continue"}</p>
            <Button onClick={() => router.push("/auth")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Real Chat</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Beta
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push("/settings")}>
                <Settings className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span
                  className={getUsernameClassName(user)}
                  style={getUsernameColorStyle(user)}
                >
                  {user.username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <span>Welcome back, {user.username}!</span>
              </CardTitle>
              <CardDescription>
                Ready to connect with your friends and colleagues? Choose an option below to get started.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Chat Features */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <span>Direct Messages</span>
              </CardTitle>
              <CardDescription>
                Start private conversations with your contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Open DMs
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <span>Group Chats</span>
              </CardTitle>
              <CardDescription>
                Join or create group conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Browse Groups
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-purple-500" />
                <span>Search Messages</span>
              </CardTitle>
              <CardDescription>
                Find messages across all your conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Search
              </Button>
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className={getUsernameClassName(user)} style={getUsernameColorStyle(user)}>
                    {user.username}
                  </p>
                  {user.custom_title && (
                    <p className="text-sm text-muted-foreground">{user.custom_title}</p>
                  )}
                </div>
              </div>

              {user.bio && (
                <div>
                  <p className="text-sm font-medium text-foreground">Bio</p>
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Badge variant={user.theme === "dark" ? "default" : "secondary"}>
                  {user.theme === "dark" ? "Dark Mode" : "Light Mode"}
                </Badge>
                {user.has_gold_animation && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
                    Gold Member
                  </Badge>
                )}
              </div>

              <Button 
                onClick={() => router.push("/settings")} 
                className="w-full"
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Calendar</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Friends</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <MessageCircle className="h-6 w-6 mb-2" />
                  <span>New Chat</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  <span>Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
