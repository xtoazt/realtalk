"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageCircle, Users, Settings, Calendar, Search, UserPlus, BarChart3, Loader2, AlertCircle, LogOut, User } from 'lucide-react'
import { ChatWindow } from "@/components/chat-window"
import { FriendsPage } from "@/components/friends-page"
import { DMsPage } from "@/components/dms-page"
import { CalendarPage } from "@/components/calendar-page"
import { PollsPage } from "@/components/polls-page"
import { MessageSearch } from "@/components/message-search"
import { ProfilePage } from "@/components/profile-page"
import { OnlineUsers } from "@/components/online-users"
import { TimeDateDisplay } from "@/components/time-date-display"

export default function DashboardPage() {
  const { user, loading, error, signOut } = useUser()
  const [activeTab, setActiveTab] = useState("chat")
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [selectedChatType, setSelectedChatType] = useState<"group" | "dm">("group")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md backdrop-blur-md bg-card/90">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md backdrop-blur-md bg-card/90">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-8 w-8 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
            <p className="text-muted-foreground text-center mb-4">
              Please log in to continue
            </p>
            <Button onClick={() => window.location.href = "/auth"}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleChatSelect = (chatId: string, type: "group" | "dm") => {
    setSelectedChatId(chatId)
    setSelectedChatType(type)
    setActiveTab("chat")
  }

  return (
    <div className="min-h-screen bg-background/50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                real.
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user.has_gold_animation ? (
                  <span className="gold-username">{user.username}</span>
                ) : (
                  <span style={{ color: user.name_color || "#ffffff" }}>{user.username}</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <TimeDateDisplay />
            <OnlineUsers />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("profile")}
              className="backdrop-blur-sm bg-background/50"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("settings")}
              className="backdrop-blur-sm bg-background/50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="backdrop-blur-sm bg-background/50 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6 backdrop-blur-sm bg-background/50">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Friends</span>
            </TabsTrigger>
            <TabsTrigger value="dms" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">DMs</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="polls" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Polls</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <ChatWindow 
              chatId={selectedChatId} 
              chatType={selectedChatType}
              onChatSelect={handleChatSelect}
            />
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            <FriendsPage onChatSelect={handleChatSelect} />
          </TabsContent>

          <TabsContent value="dms" className="space-y-4">
            <DMsPage onChatSelect={handleChatSelect} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <CalendarPage />
          </TabsContent>

          <TabsContent value="polls" className="space-y-4">
            <PollsPage />
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <MessageSearch />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <ProfilePage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
