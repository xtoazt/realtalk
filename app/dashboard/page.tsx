"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { DynamicIsland } from "@/components/dynamic-island"
import { ChatWindow } from "@/components/chat-window"
import { FriendsPage } from "@/components/friends-page"
import { DMsPage } from "@/components/dms-page"
import { PollsPage } from "@/components/polls-page"
import { ChannelsPage } from "@/components/channels-page"
import { CalendarPage } from "@/components/calendar-page"
import { ProfilePage } from "@/components/profile-page"
import { VoiceTab } from "@/components/voice/VoiceTab"
import MoviesPage from "@/app/movies/page"
import RadioPage from "@/app/radio/page"
import GamesPage from "../../components/games-page"
import { IncomingCallHandler } from "@/components/voice/IncomingCallHandler"
import { CreateGroupChat } from "@/components/create-group-chat"
import { JoinGroupChat } from "@/components/join-group-chat"
import { JoinRequests } from "@/components/join-requests"
import { OnlineUsers } from "@/components/online-users"
import { RecentPoll } from "@/components/recent-poll"
import { MessageSearch } from "@/components/message-search"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Globe, Trash2, Search, Hash, Clock, Sparkles, Zap, Star, Heart } from 'lucide-react'
import { useUser } from "@/hooks/use-user"
import { TimeDateDisplay } from "@/components/time-date-display"
import { BatteryStatus } from "@/components/BatteryStatus"
import { ModeGate } from "./mode-gate"
import { AI_USER_ID, AI_USERNAME } from "@/lib/constants"
import { GoldMemberPopup } from "@/components/gold-member-popup"

interface GroupChat {
  id: string
  name: string
  creator_username: string
  creator_id: string
}


export default function DashboardPage() {
  const { user, loading: userLoading, setUser: updateLocalUser } = useUser()
  const { theme, setTheme } = useTheme()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [groupChats, setGroupChats] = useState<GroupChat[]>([])
  const [activeChat, setActiveChat] = useState<{
    type: "global" | "group" | "dm" | "channel" | null
    id?: string
    name: string
  }>({ type: null, name: "" })
  const [showCreateGC, setShowCreateGC] = useState(false)
  const [showJoinGC, setShowJoinGC] = useState(false)
  const [showJoinRequests, setShowJoinRequests] = useState(false)
  const [showMessageSearch, setShowMessageSearch] = useState(false)
  const [profileUserId, setProfileUserId] = useState<string | null>(null)
  const [showGoldMemberPopup, setShowGoldMemberPopup] = useState(false)
  const router = useRouter()

  const fetchGroupChats = useCallback(async () => {
    if (!user) return
    try {
      const response = await fetch("/api/group-chats")
      if (response.ok) {
        const data = await response.json()
        setGroupChats(data.groupChats)
      } else {
        console.error("Failed to fetch group chats:", response.status, await response.text())
      }
    } catch (error) {
      console.error("Failed to fetch group chats:", error)
    }
  }, [user])

  useEffect(() => {
    if (!userLoading && user) {
      fetchGroupChats()
    }
  }, [userLoading, user, fetchGroupChats])

  // Handle navigation events from notifications
  useEffect(() => {
    const handleNavigateToChat = (event: CustomEvent) => {
      const { type, id, name } = event.detail
      setActiveChat({ type, id, name })
    }

    window.addEventListener('navigateToChat', handleNavigateToChat as EventListener)
    
    return () => {
      window.removeEventListener('navigateToChat', handleNavigateToChat as EventListener)
    }
  }, [])

  // Handle Gemini API key exhaustion for gold members
  useEffect(() => {
    const handleGeminiKeyExhausted = () => {
      if (user?.signup_code === 'qwea') {
        setShowGoldMemberPopup(true)
      }
    }

    window.addEventListener('geminiKeyExhausted', handleGeminiKeyExhausted)
    
    return () => {
      window.removeEventListener('geminiKeyExhausted', handleGeminiKeyExhausted)
    }
  }, [user])

  const handleCreateGC = async (name: string, memberIds: string[]) => {
    try {
      const response = await fetch("/api/group-chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, memberIds }),
      })

      if (response.ok) {
        const data = await response.json()
        setGroupChats((prev) => [data.groupChat, ...prev])
        setShowCreateGC(false)
        setActiveChat({
          type: "group",
          id: data.groupChat.id,
          name: data.groupChat.name,
        })
        setCurrentPage("dashboard")
        
        // Show the short code to the creator
        if (data.groupChat.short_code) {
          alert(`Group chat created! Share this code with others: ${data.groupChat.short_code}`)
        }
      } else {
        console.error("Failed to create group chat:", response.status, await response.text())
      }
    } catch (error) {
      console.error("Failed to create group chat:", error)
    }
  }

  const handleDeleteGroupChat = async (groupId: string) => {
    if (!user) return
    if (confirm("Are you sure you want to delete this group chat? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/group-chats/${groupId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          console.log(`Group chat ${groupId} deleted successfully.`)
          fetchGroupChats()
          if (activeChat.type === "group" && activeChat.id === groupId) {
            setActiveChat({ type: null, name: "" })
          }
        } else {
          const errorData = await response.json()
          console.error("Failed to delete group chat:", errorData.error || response.statusText)
          alert(`Failed to delete group chat: ${errorData.error || response.statusText}`)
        }
      } catch (error) {
        console.error("Failed to delete group chat:", error)
        alert("An unexpected error occurred while deleting the group chat.")
      }
    }
  }

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        updateLocalUser(null)
        window.location.href = "/auth"
      } else {
        console.error("Sign out failed:", response.status)
        window.location.href = "/auth"
      }
    } catch (error) {
      console.error("Failed to sign out:", error)
      window.location.href = "/auth"
    }
  }

  const handleStartDM = (friendId: string, friendUsername: string) => {
    setActiveChat({
      type: "dm",
      id: friendId,
      name: `@${friendUsername}`,
    })
    setCurrentPage("dashboard")
    setProfileUserId(null)
  }

  const handleShowProfile = (userId: string) => {
    setProfileUserId(userId)
    setCurrentPage("profile")
  }

  const handlePageChange = (page: string) => {
    if (page === "settings") {
      router.push("/settings")
    } else if (page === "about") {
      router.push("/about")
    } else if (page === "movies") {
      router.push("/movies")
      setActiveChat({ type: null, name: "" })
      setProfileUserId(null)
    } else if (page === "games") {
      router.push("/games")
      setActiveChat({ type: null, name: "" })
      setProfileUserId(null)
    } else if (page === "radio") {
      router.push("/radio")
      setActiveChat({ type: null, name: "" })
      setProfileUserId(null)
    } else {
      setCurrentPage(page)
      if (page !== "dashboard") {
        setActiveChat({ type: null, name: "" })
        setProfileUserId(null)
      }
    }
  }

  const handleGlobalChatClick = () => {
    setActiveChat({ type: "global", name: "Global Chat" })
    setCurrentPage("dashboard")
    setProfileUserId(null)
  }

  const handleAIChatClick = () => {
    setActiveChat({ type: "dm", id: AI_USER_ID, name: AI_USERNAME })
    setCurrentPage("dashboard")
    setProfileUserId(null)
  }

  const handleThemeCycle = async () => {
    // This function is now handled by the ThemeToggle component
    // Keeping it for backward compatibility but it's no longer used
  }

  const handleHueCycle = async () => {
    // Hue cycling disabled - simplified theming
  }

  const handleMessageSearchClick = (chatType: string, chatId?: string) => {
    if (chatType === "global") {
      setActiveChat({ type: "global", name: "Global Chat" })
    } else if (chatType === "dm") {
      setActiveChat({ type: "dm", id: chatId, name: "Direct Message" })
    } else if (chatType === "group") {
      const groupChat = groupChats.find((gc) => gc.id === chatId)
      setActiveChat({ type: "group", id: chatId, name: groupChat?.name || "Group Chat" })
    }
    setCurrentPage("dashboard")
    setProfileUserId(null)
  }

  const handleViewAllPolls = () => {
    setCurrentPage("polls")
    setProfileUserId(null)
  }

  const handleSelectChannel = (channelId: string, channelName: string) => {
    setActiveChat({ type: "channel", id: channelId, name: `# ${channelName}` })
    setCurrentPage("dashboard")
    setProfileUserId(null)
  }

  const handleSendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresseeId: userId }),
      })

      if (response.ok) {
        alert("Friend request sent!")
      } else {
        const errorData = await response.json()
        alert(`Failed to send friend request: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Failed to send friend request:", error)
      alert("An error occurred while sending friend request")
    }
  }

  const handleUserClick = (userId: string) => {
    console.log("[dashboard] User clicked:", userId)
    setProfileUserId(userId)
    setCurrentPage("profile")
    setActiveChat({ type: null, name: "" })
  }

  const handleJoinSuccess = (groupChat: any) => {
    alert(`Join request sent to ${groupChat.name}! The creator will be notified.`)
    fetchGroupChats()
  }

  const handleRequestProcessed = () => {
    fetchGroupChats()
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900">
        <div className="text-white animate-pulse text-2xl font-bold">Loading the future...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 dark:from-indigo-100 dark:via-purple-50 dark:to-pink-100 overflow-hidden">
      {/* Mega animated background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-96 -right-96 w-[800px] h-[800px] bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-96 -left-96 w-[800px] h-[800px] bg-gradient-to-br from-pink-400/20 to-rose-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/15 to-violet-500/15 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-emerald-400/15 to-teal-500/15 rounded-full blur-3xl animate-pulse delay-750" />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute animate-float top-20 left-20">
          <Sparkles className="h-8 w-8 text-cyan-300/40 animate-pulse" />
        </div>
        <div className="absolute animate-float delay-300 top-40 right-32">
          <Star className="h-6 w-6 text-pink-300/40 animate-pulse delay-200" />
        </div>
        <div className="absolute animate-float delay-700 bottom-32 left-40">
          <Zap className="h-7 w-7 text-yellow-300/40 animate-pulse delay-500" />
        </div>
        <div className="absolute animate-float delay-1000 bottom-20 right-20">
          <Heart className="h-5 w-5 text-rose-300/40 animate-pulse delay-700" />
        </div>
      </div>
           
      <ModeGate />
      <DynamicIsland
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onSignOut={handleSignOut}
        onGlobalChatClick={handleGlobalChatClick}
        onAIChatClick={handleAIChatClick}
        username={user.username}
        onThemeCycle={handleThemeCycle}
        onHueCycle={handleHueCycle}
      />

      <div className="relative z-10 pt-32 px-6 pb-8">
        {currentPage === 'dashboard' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1 xl:col-span-1 space-y-8">
                <Card className="bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/30 dark:via-gray-800/20 dark:to-gray-700/10 backdrop-blur-3xl border-2 border-white/30 dark:border-white/20 shadow-[0_16px_80px_rgba(0,0,0,0.25)] dark:shadow-[0_16px_80px_rgba(255,255,255,0.15)] rounded-3xl hover:shadow-[0_24px_120px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_24px_120px_rgba(255,255,255,0.25)] transition-all duration-700 hover:scale-105">
                  <CardHeader className="pb-8">
                    <CardTitle className="flex items-center justify-between text-2xl font-black text-white dark:text-gray-900">
                      <span className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-3xl bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-2xl">
                          <Users className="h-7 w-7 text-white drop-shadow-xl" />
                        </div>
                        <span className="bg-gradient-to-r from-white to-cyan-200 dark:from-gray-900 dark:to-purple-700 bg-clip-text text-transparent">Groups</span>
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-12 w-12 rounded-2xl bg-white/20 dark:bg-gray-900/30 hover:bg-white/30 dark:hover:bg-gray-900/40 transition-all duration-300 hover:scale-110 group backdrop-blur-xl border border-white/30 dark:border-white/20"
                          onClick={() => setShowMessageSearch(true)}
                          title="Search Messages"
                        >
                          <Search className="h-6 w-6 text-white dark:text-gray-700 group-hover:text-cyan-200 dark:group-hover:text-cyan-600 transition-colors drop-shadow-xl" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-12 w-12 rounded-2xl bg-white/20 dark:bg-gray-900/30 hover:bg-white/30 dark:hover:bg-gray-900/40 transition-all duration-300 hover:scale-110 group backdrop-blur-xl border border-white/30 dark:border-white/20"
                          onClick={() => setShowJoinGC(true)}
                          title="Join Group Chat"
                        >
                          <Hash className="h-6 w-6 text-white dark:text-gray-700 group-hover:text-blue-200 dark:group-hover:text-blue-600 transition-colors drop-shadow-xl" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-12 w-12 rounded-2xl bg-gradient-to-r from-emerald-400/30 to-teal-400/30 hover:from-emerald-400/50 hover:to-teal-400/50 transition-all duration-300 hover:scale-110 group backdrop-blur-xl border-2 border-emerald-300/40" 
                          onClick={() => setShowCreateGC(true)}
                          title="Create Group Chat"
                        >
                          <Plus className="h-6 w-6 text-white group-hover:text-emerald-100 transition-colors drop-shadow-xl" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {groupChats.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-white/20 to-white/10 dark:from-gray-900/30 dark:to-gray-800/20 flex items-center justify-center backdrop-blur-xl border border-white/30 dark:border-white/20 shadow-2xl">
                          <Users className="h-10 w-10 text-white/80 dark:text-gray-700/80 drop-shadow-xl" />
                        </div>
                        <p className="text-lg font-bold text-white dark:text-gray-900 mb-2">No group chats yet</p>
                        <p className="text-sm text-white/70 dark:text-gray-700/70 bg-white/10 dark:bg-gray-900/20 px-4 py-2 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 inline-block">Create one to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {groupChats.map((gc) => (
                          <div key={gc.id} className="group">
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                className={`flex-1 justify-start text-left h-auto p-4 rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-xl border ${
                                  activeChat.type === "group" && activeChat.id === gc.id 
                                    ? "bg-gradient-to-r from-blue-400/40 to-purple-400/40 border-blue-300/50 shadow-2xl shadow-blue-400/30" 
                                    : "bg-white/15 dark:bg-gray-900/25 hover:bg-white/25 dark:hover:bg-gray-900/35 border-white/30 dark:border-white/20 shadow-xl"
                                }`}
                                onClick={() => setActiveChat({ type: "group", id: gc.id, name: gc.name })}
                              >
                                <div className="flex items-center gap-4 w-full">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-2xl">
                                    <Users className="h-6 w-6 text-white drop-shadow-xl" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-lg font-bold truncate text-white dark:text-gray-900">{gc.name}</div>
                                    <div className="text-sm text-white/70 dark:text-gray-700/70 truncate">
                                      by {gc.creator_username}
                                    </div>
                                  </div>
                                </div>
                              </Button>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                {user.id === gc.creator_id && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setShowJoinRequests(true)}
                                      className="h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-400/30 to-cyan-400/30 hover:from-blue-400/50 hover:to-cyan-400/50 transition-all duration-300 hover:scale-110 backdrop-blur-xl border border-blue-300/40"
                                      title="View Join Requests"
                                    >
                                      <Clock className="h-6 w-6 text-white drop-shadow-xl" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteGroupChat(gc.id)}
                                      className="h-12 w-12 rounded-2xl bg-gradient-to-r from-red-400/30 to-pink-400/30 hover:from-red-400/50 hover:to-pink-400/50 transition-all duration-300 hover:scale-110 backdrop-blur-xl border border-red-300/40"
                                      title="Delete Group Chat"
                                    >
                                      <Trash2 className="h-6 w-6 text-white drop-shadow-xl" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/30 dark:via-gray-800/20 dark:to-gray-700/10 backdrop-blur-3xl border-2 border-white/30 dark:border-white/20 shadow-[0_16px_80px_rgba(0,0,0,0.25)] dark:shadow-[0_16px_80px_rgba(255,255,255,0.15)] rounded-3xl hover:shadow-[0_24px_120px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_24px_120px_rgba(255,255,255,0.25)] transition-all duration-700 hover:scale-105">
                  <OnlineUsers currentUserId={user.id} />
                </Card>
                
                <Card className="bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/30 dark:via-gray-800/20 dark:to-gray-700/10 backdrop-blur-3xl border-2 border-white/30 dark:border-white/20 shadow-[0_16px_80px_rgba(0,0,0,0.25)] dark:shadow-[0_16px_80px_rgba(255,255,255,0.15)] rounded-3xl hover:shadow-[0_24px_120px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_24px_120px_rgba(255,255,255,0.25)] transition-all duration-700 hover:scale-105">
                  <RecentPoll currentUserId={user.id} onViewAllPolls={handleViewAllPolls} />
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3 xl:col-span-4">
                {activeChat.type ? (
                  <div className="h-[calc(100vh-10rem)]">
                    <ChatWindow
                      chatType={activeChat.type}
                      chatId={activeChat.id}
                      chatName={activeChat.name}
                      currentUserId={user.id}
                      onUserClick={handleUserClick}
                    />
                  </div>
                ) : (
                  <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
                    <Card className="bg-gradient-to-br from-white/25 via-white/15 to-white/10 dark:from-gray-900/35 dark:via-gray-800/25 dark:to-gray-700/15 backdrop-blur-3xl border-2 border-white/40 dark:border-white/25 shadow-[0_24px_120px_rgba(0,0,0,0.3)] dark:shadow-[0_24px_120px_rgba(255,255,255,0.2)] rounded-3xl w-full max-w-5xl relative overflow-hidden hover:scale-105 transition-all duration-700">
                      
                      {/* Animated background elements */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-700" />
                      </div>

                      <CardContent className="text-center py-24 px-12 relative">
                        {/* Hero Section */}
                        <div className="mb-20 relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />
                          <div className="relative text-8xl md:text-9xl font-black tracking-tight mb-8">
                            <span className="bg-gradient-to-r from-white via-cyan-200 to-purple-200 dark:from-gray-900 dark:via-purple-700 dark:to-pink-600 bg-clip-text text-transparent drop-shadow-2xl">
                              real.
                            </span>
                          </div>
                          <div className="text-3xl md:text-4xl text-white/90 dark:text-gray-800/90 font-light mb-6">
                            Where conversations transcend reality
                          </div>
                          <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="w-32 h-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 rounded-full" />
                            <Sparkles className="h-8 w-8 text-cyan-300 animate-pulse" />
                            <div className="w-32 h-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full" />
                          </div>
                        </div>

                        {/* Status Section */}
                        <div className="mb-20 space-y-10">
                          <div className="flex justify-center">
                            <div className="bg-gradient-to-r from-white/30 to-white/20 dark:from-gray-900/40 dark:to-gray-800/30 backdrop-blur-2xl rounded-3xl px-8 py-4 text-2xl border-2 border-white/40 dark:border-white/20 shadow-2xl">
                              <span className="text-white/90 dark:text-gray-800/90">Welcome back, </span>
                              <span className="text-white dark:text-gray-900 font-black bg-gradient-to-r from-cyan-300 to-blue-300 dark:from-cyan-600 dark:to-blue-600 bg-clip-text text-transparent">@{user.username}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-8">
                            <div className="bg-gradient-to-r from-white/20 to-white/15 dark:from-gray-900/30 dark:to-gray-800/25 backdrop-blur-2xl rounded-3xl p-6 border-2 border-white/30 dark:border-white/20 shadow-2xl">
                              <TimeDateDisplay large />
                            </div>
                            <div className="bg-gradient-to-r from-white/20 to-white/15 dark:from-gray-900/30 dark:to-gray-800/25 backdrop-blur-2xl rounded-3xl p-6 border-2 border-white/30 dark:border-white/20 shadow-2xl">
                              <BatteryStatus />
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                          <h3 className="text-3xl font-black text-white dark:text-gray-900 mb-10 bg-gradient-to-r from-white via-cyan-100 to-white dark:from-gray-900 dark:via-purple-700 dark:to-gray-900 bg-clip-text text-transparent">Quick Start</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Button 
                              className="bg-gradient-to-r from-slate-700 to-black dark:from-gray-300 dark:to-white hover:from-slate-600 hover:to-gray-900 dark:hover:from-gray-200 dark:hover:to-gray-50 text-white dark:text-gray-900 h-24 flex-col gap-4 text-xl font-black shadow-[0_16px_64px_rgba(0,0,0,0.4)] hover:shadow-[0_24px_96px_rgba(0,0,0,0.5)] transition-all duration-500 hover:scale-110 rounded-3xl group relative overflow-hidden" 
                              onClick={handleGlobalChatClick}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <Globe className="w-8 h-8 group-hover:scale-110 transition-transform drop-shadow-xl relative z-10" />
                              <span className="relative z-10">Global Chat</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              className="bg-gradient-to-r from-white/25 to-white/20 dark:from-gray-900/35 dark:to-gray-800/30 border-2 border-white/40 dark:border-white/25 hover:from-white/35 hover:to-white/30 dark:hover:from-gray-900/45 dark:hover:to-gray-800/40 text-white dark:text-gray-900 h-24 flex-col gap-4 text-xl font-black shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 rounded-3xl backdrop-blur-2xl group relative overflow-hidden" 
                              onClick={() => setCurrentPage('friends')}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <Users className="w-8 h-8 group-hover:scale-110 transition-transform drop-shadow-xl relative z-10" />
                              <span className="relative z-10">Friends</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              className="bg-gradient-to-r from-white/25 to-white/20 dark:from-gray-900/35 dark:to-gray-800/30 border-2 border-white/40 dark:border-white/25 hover:from-white/35 hover:to-white/30 dark:hover:from-gray-900/45 dark:hover:to-gray-800/40 text-white dark:text-gray-900 h-24 flex-col gap-4 text-xl font-black shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 rounded-3xl backdrop-blur-2xl group relative overflow-hidden" 
                              onClick={() => setCurrentPage('channels')}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <Hash className="w-8 h-8 group-hover:scale-110 transition-transform drop-shadow-xl relative z-10" />
                              <span className="relative z-10">Channels</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentPage === "friends" && user && (
          <div className="max-w-4xl mx-auto animate-slideIn">
            <FriendsPage currentUserId={user.id} onStartDM={handleStartDM} onShowProfile={handleShowProfile} />
          </div>
        )}

        {currentPage === "dms" && (
          <div className="max-w-4xl mx-auto animate-slideIn">
            <DMsPage currentUserId={user.id} onSelectDM={handleStartDM} />
          </div>
        )}

        {currentPage === "polls" && (
          <div className="max-w-4xl mx-auto animate-slideIn">
            <PollsPage currentUserId={user.id} userSignupCode={user.signup_code} />
          </div>
        )}

        {currentPage === "channels" && (
          <div className="max-w-4xl mx-auto animate-slideIn">
            <ChannelsPage currentUserId={user.id} userSignupCode={user.signup_code} onSelectChannel={handleSelectChannel} />
          </div>
        )}

        {currentPage === "calendar" && (
          <div className="max-w-4xl mx-auto animate-slideIn">
            <CalendarPage currentUserId={user.id} />
          </div>
        )}

        {currentPage === "voice" && (
          <div className="max-w-4xl mx-auto animate-slideIn">
            <VoiceTab />
          </div>
        )}

        {currentPage === "movies" && (
          <div className="max-w-7xl mx-auto animate-fadeIn">
            <MoviesPage />
          </div>
        )}

        {currentPage === "games" && (
          <div className="max-w-7xl mx-auto animate-fadeIn">
            <GamesPage />
          </div>
        )}

        {currentPage === "radio" && (
          <div className="max-w-7xl mx-auto animate-fadeIn">
            <RadioPage />
          </div>
        )}

        {currentPage === "profile" && (
          <div className="max-w-4xl mx-auto animate-slideIn">
            <ProfilePage 
              userId={profileUserId ?? undefined} 
              onStartDM={handleStartDM} 
              onSendFriendRequest={handleSendFriendRequest} 
            />
          </div>
        )}
      </div>

      <IncomingCallHandler currentUserId={user.id} />

      {showCreateGC && user && <CreateGroupChat onClose={() => setShowCreateGC(false)} onCreate={handleCreateGC} />}

      {showJoinGC && <JoinGroupChat onClose={() => setShowJoinGC(false)} onJoinSuccess={handleJoinSuccess} />}

      {showJoinRequests && (
        <JoinRequests 
          groupChatId={groupChats.find(gc => gc.creator_id === user?.id)?.id || ""}
          groupChatName={groupChats.find(gc => gc.creator_id === user?.id)?.name || ""}
          onClose={() => setShowJoinRequests(false)}
          onRequestProcessed={handleRequestProcessed}
        />
      )}

      {showMessageSearch && (
        <MessageSearch onClose={() => setShowMessageSearch(false)} onMessageClick={handleMessageSearchClick} />
      )}

      <GoldMemberPopup 
        isOpen={showGoldMemberPopup} 
        onClose={() => setShowGoldMemberPopup(false)} 
      />
    </div>
  )
}