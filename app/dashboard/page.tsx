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
import { Plus, Users, Globe, Trash2, Search, Hash, Clock } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Subtle texture overlay */}
      <div className="fixed inset-0 opacity-[0.02] dark:opacity-[0.05]" 
           style={{
             backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
             backgroundSize: '24px 24px'
           }} />
           
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

      <div className="relative z-10 pt-20 px-4 pb-6">
        {currentPage === 'dashboard' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1 xl:col-span-1 space-y-6">
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 shadow-xl rounded-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between text-base font-medium text-gray-900 dark:text-gray-100">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        Groups
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-lg hover:bg-gray-100/60 dark:hover:bg-gray-700/60 transition-colors"
                          onClick={() => setShowMessageSearch(true)}
                          title="Search Messages"
                        >
                          <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-lg hover:bg-gray-100/60 dark:hover:bg-gray-700/60 transition-colors"
                          onClick={() => setShowJoinGC(true)}
                          title="Join Group Chat"
                        >
                          <Hash className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 rounded-lg hover:bg-gray-100/60 dark:hover:bg-gray-700/60 transition-colors" 
                          onClick={() => setShowCreateGC(true)}
                          title="Create Group Chat"
                        >
                          <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {groupChats.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Users className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">No group chats yet</p>
                        <p className="text-xs text-slate-400 mt-1">Create one to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {groupChats.map((gc) => (
                          <div key={gc.id} className="group">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                className={`flex-1 justify-start text-left h-auto p-3 rounded-lg transition-all ${
                                  activeChat.type === "group" && activeChat.id === gc.id 
                                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" 
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                                onClick={() => setActiveChat({ type: "group", id: gc.id, name: gc.name })}
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">{gc.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                      by {gc.creator_username}
                                    </div>
                                  </div>
                                </div>
                              </Button>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {user.id === gc.creator_id && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setShowJoinRequests(true)}
                                      className="h-8 w-8 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
                                      title="View Join Requests"
                                    >
                                      <Clock className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteGroupChat(gc.id)}
                                      className="h-8 w-8 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                                      title="Delete Group Chat"
                                    >
                                      <Trash2 className="h-4 w-4" />
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

                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 shadow-xl rounded-xl">
                  <OnlineUsers currentUserId={user.id} />
                </Card>
                
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 shadow-xl rounded-xl">
                  <RecentPoll currentUserId={user.id} onViewAllPolls={handleViewAllPolls} />
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3 xl:col-span-4">
                {activeChat.type ? (
                  <div className="h-[calc(100vh-7rem)]">
                    <ChatWindow
                      chatType={activeChat.type}
                      chatId={activeChat.id}
                      chatName={activeChat.name}
                      currentUserId={user.id}
                      onUserClick={handleUserClick}
                    />
                  </div>
                ) : (
                  <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
                    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 shadow-xl rounded-2xl w-full max-w-2xl">
                      <CardContent className="text-center py-16 px-8">
                        {/* Hero Section */}
                        <div className="mb-12">
                          <div className="text-6xl md:text-7xl font-black tracking-tight mb-4">
                            <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                              real.
                            </span>
                          </div>
                          <div className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light">
                            Where conversations come alive
                          </div>
                        </div>

                        {/* Status Section */}
                        <div className="mb-12 space-y-6">
                          <div className="flex justify-center">
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                              Welcome back, <span className="text-slate-900 dark:text-slate-100 font-semibold">@{user.username}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-4">
                            <TimeDateDisplay large />
                            <BatteryStatus />
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Quick Start</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button 
                              className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 h-16 flex-col gap-2 text-sm font-semibold shadow-lg" 
                              onClick={handleGlobalChatClick}
                            >
                              <Globe className="w-5 h-5" />
                              Global Chat
                            </Button>
                            <Button 
                              variant="outline" 
                              className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 h-16 flex-col gap-2 text-sm font-semibold" 
                              onClick={() => setCurrentPage('friends')}
                            >
                              <Users className="w-5 h-5" />
                              Friends
                            </Button>
                            <Button 
                              variant="outline" 
                              className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 h-16 flex-col gap-2 text-sm font-semibold" 
                              onClick={() => setCurrentPage('channels')}
                            >
                              <Hash className="w-5 h-5" />
                              Channels
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
