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

const hues = [
  { id: "blue", name: "Blue" },
  { id: "purple", name: "Purple" },
  { id: "pink", name: "Pink" },
  { id: "red", name: "Red" },
  { id: "orange", name: "Orange" },
  { id: "yellow", name: "Yellow" },
  { id: "green", name: "Green" },
  { id: "teal", name: "Teal" },
]

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
    if (!user) return

    const currentHueIndex = hues.findIndex((h) => h.id === user.hue)
    const nextHueIndex = (currentHueIndex + 1) % hues.length
    const nextHue = hues[nextHueIndex].id

    console.log("[dashboard] Cycling hue from", user.hue, "to", nextHue)

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hue: nextHue }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[dashboard] Hue update successful:", data.user.hue)
        updateLocalUser(data.user)
      } else {
        const errorData = await response.json()
        console.error("[dashboard] Failed to update hue:", errorData.error || response.statusText)
        alert(`Failed to change hue: ${errorData.error || response.statusText}`)
      }
    } catch (error: any) {
      console.error("[dashboard] Failed to update hue:", error)
      alert(`An unexpected error occurred while changing hue: ${error.message}`)
    }
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
    <div className="relative min-h-screen bg-background">
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

      <div className="relative z-10 pt-20 px-4 pb-4 animate-fadeIn">
        {currentPage === 'dashboard' && (
          <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
            <div className="w-full md:w-80 space-y-4 flex-shrink-0">
              <Card className="animate-fadeIn glass">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Group Chats</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMessageSearch(true)}
                        title="Search Messages"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowJoinGC(true)}
                        title="Join Group Chat"
                      >
                        <Hash className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateGC(true)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {groupChats.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No group chats yet</p>
                  ) : (
                    <div className="space-y-1">
                      {groupChats.map((gc) => (
                        <div key={gc.id} className="flex items-center justify-between">
                          <Button
                            variant={activeChat.type === "group" && activeChat.id === gc.id ? "default" : "ghost"}
                            className="flex-1 justify-start text-left transition-all duration-200 hover:scale-102"
                            onClick={() => setActiveChat({ type: "group", id: gc.id, name: gc.name })}
                          >
                            <Users className="h-4 w-4 mr-2 shrink-0" />
                            <span className="truncate">{gc.name}</span>
                          </Button>
                          <div className="flex items-center gap-1">
                            {user.id === gc.creator_id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowJoinRequests(true)}
                                  className="text-blue-500 hover:bg-blue-500/10"
                                  title="View Join Requests"
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteGroupChat(gc.id)}
                                  className="text-red-500 hover:bg-red-500/10"
                                  title="Delete Group Chat"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass">
                <OnlineUsers currentUserId={user.id} />
              </Card>
              <Card className="glass">
                <RecentPoll currentUserId={user.id} onViewAllPolls={handleViewAllPolls} />
              </Card>
            </div>

            <div className="flex-1 h-full">
              {activeChat.type ? (
                <div className="animate-fadeIn">
                  <ChatWindow
                    chatType={activeChat.type}
                    chatId={activeChat.id}
                    chatName={activeChat.name}
                    currentUserId={user.id}
                    onUserClick={handleUserClick}
                  />
                </div>
              ) : (
                <Card className="h-full flex items-center justify-center glass">
                  <CardContent className="text-center py-12">
                    <div className="text-5xl md:text-7xl font-black tracking-tighter text-gradient">real.</div>
                    <div className="mt-6 flex flex-col items-center gap-2">
                      <TimeDateDisplay large />
                      <BatteryStatus />
                    </div>
                    <div className="mt-6 text-sm text-muted-foreground">
                      Welcome back @{user.username}
                    </div>
                    <div className="mt-4 flex gap-2 justify-center">
                      <Button variant="modern" onClick={handleGlobalChatClick}>Global Chat</Button>
                      <Button variant="outline" onClick={() => setCurrentPage('friends')}>Friends</Button>
                      <Button variant="outline" onClick={() => setCurrentPage('channels')}>Channels</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
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
