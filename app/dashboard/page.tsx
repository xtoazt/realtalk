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

  const handleThemeCycle = async () => {}
  const handleHueCycle = async () => {}

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
        <div className="text-foreground text-sm font-medium">Loading...</div>
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

      <div className="relative z-10 pt-20 px-4 pb-6">
        {currentPage === 'dashboard' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              <div className="lg:col-span-1 xl:col-span-1 space-y-6">
                <Card className="glass-effect rounded-modern-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between text-base font-medium text-foreground">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Groups
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-lg hover:bg-zinc-800/50 dark:hover:bg-zinc-200/50 transition-colors"
                          onClick={() => setShowMessageSearch(true)}
                          title="Search Messages"
                        >
                          <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-lg hover:bg-zinc-800/50 dark:hover:bg-zinc-200/50 transition-colors"
                          onClick={() => setShowJoinGC(true)}
                          title="Join Group Chat"
                        >
                          <Hash className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 rounded-lg hover:bg-zinc-800/50 dark:hover:bg-zinc-200/50 transition-colors" 
                          onClick={() => setShowCreateGC(true)}
                          title="Create Group Chat"
                        >
                          <Plus className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {groupChats.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-zinc-800 dark:bg-zinc-200 flex items-center justify-center">
                          <Users className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
                        </div>
                        <p className="text-sm text-zinc-400 dark:text-zinc-600">No group chats yet</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Create one to get started</p>
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
                                    ? "bg-zinc-800 dark:bg-zinc-200 border border-zinc-700 dark:border-zinc-300" 
                                    : "hover:bg-zinc-800/50 dark:hover:bg-zinc-200/50"
                                }`}
                                onClick={() => setActiveChat({ type: "group", id: gc.id, name: gc.name })}
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <div className="w-8 h-8 rounded-lg bg-zinc-700 dark:bg-zinc-300 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate text-zinc-100 dark:text-zinc-900">{gc.name}</div>
                                    <div className="text-xs text-zinc-400 dark:text-zinc-600 truncate">
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
                                      className="h-8 w-8 rounded-lg text-zinc-400 dark:text-zinc-600 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                                      title="View Join Requests"
                                    >
                                      <Clock className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteGroupChat(gc.id)}
                                      className="h-8 w-8 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
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

                <Card className="glass-effect rounded-modern-lg">
                  <OnlineUsers currentUserId={user.id} />
                </Card>
                
                <Card className="glass-effect rounded-modern-lg">
                  <RecentPoll currentUserId={user.id} onViewAllPolls={handleViewAllPolls} />
                </Card>
              </div>

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
                    <Card className="bg-zinc-900/50 dark:bg-zinc-100/50 backdrop-blur-xl border border-zinc-800 dark:border-zinc-200 shadow-2xl rounded-xl w-full max-w-2xl">
                      <CardContent className="text-center py-16 px-8">
                        <div className="mb-12">
                          <div className="text-6xl md:text-7xl font-light tracking-tight mb-4">
                            <span className="text-zinc-100 dark:text-zinc-900">
                              real.
                            </span>
                          </div>
                          <div className="text-lg md:text-xl text-zinc-400 dark:text-zinc-600 font-light">
                            Minimal. Focused. Professional.
                          </div>
                        </div>

                        <div className="mb-12 space-y-6">
                          <div className="flex justify-center">
                            <div className="bg-zinc-800 dark:bg-zinc-200 rounded-lg px-4 py-2 text-sm text-zinc-300 dark:text-zinc-700 border border-zinc-700 dark:border-zinc-300">
                              <span className="text-zinc-100 dark:text-zinc-900 font-medium">@{user.username}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-4">
                            <div className="bg-zinc-800/50 dark:bg-zinc-200/50 backdrop-blur-xl rounded-lg p-4 border border-zinc-700 dark:border-zinc-300">
                              <TimeDateDisplay large />
                            </div>
                            <div className="bg-zinc-800/50 dark:bg-zinc-200/50 backdrop-blur-xl rounded-lg p-4 border border-zinc-700 dark:border-zinc-300">
                              <BatteryStatus />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-zinc-100 dark:text-zinc-900 mb-6">Quick Actions</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button 
                              className="bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-zinc-100 dark:text-zinc-900 h-14 flex-col gap-2 text-sm font-medium shadow-lg rounded-lg border border-zinc-700 dark:border-zinc-300" 
                              onClick={handleGlobalChatClick}
                            >
                              <Globe className="w-5 h-5" />
                              Global Chat
                            </Button>
                            <Button 
                              variant="outline" 
                              className="bg-zinc-900/30 dark:bg-zinc-100/30 border-zinc-700 dark:border-zinc-300 hover:bg-zinc-800/50 dark:hover:bg-zinc-200/50 text-zinc-100 dark:text-zinc-900 h-14 flex-col gap-2 text-sm font-medium rounded-lg" 
                              onClick={() => setCurrentPage('friends')}
                            >
                              <Users className="w-5 h-5" />
                              Friends
                            </Button>
                            <Button 
                              variant="outline" 
                              className="bg-zinc-900/30 dark:bg-zinc-100/30 border-zinc-700 dark:border-zinc-300 hover:bg-zinc-800/50 dark:hover:bg-zinc-200/50 text-zinc-100 dark:text-zinc-900 h-14 flex-col gap-2 text-sm font-medium rounded-lg" 
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
          <div className="max-w-4xl mx-auto">
            <FriendsPage currentUserId={user.id} onStartDM={handleStartDM} onShowProfile={handleShowProfile} />
          </div>
        )}

        {currentPage === "dms" && (
          <div className="max-w-4xl mx-auto">
            <DMsPage currentUserId={user.id} onSelectDM={handleStartDM} />
          </div>
        )}

        {currentPage === "polls" && (
          <div className="max-w-4xl mx-auto">
            <PollsPage currentUserId={user.id} userSignupCode={user.signup_code} />
          </div>
        )}

        {currentPage === "channels" && (
          <div className="max-w-4xl mx-auto">
            <ChannelsPage currentUserId={user.id} userSignupCode={user.signup_code} onSelectChannel={handleSelectChannel} />
          </div>
        )}

        {currentPage === "calendar" && (
          <div className="max-w-4xl mx-auto">
            <CalendarPage currentUserId={user.id} />
          </div>
        )}

        {currentPage === "voice" && (
          <div className="max-w-4xl mx-auto">
            <VoiceTab />
          </div>
        )}

        {currentPage === "movies" && (
          <div className="max-w-7xl mx-auto">
            <MoviesPage />
          </div>
        )}

        {currentPage === "games" && (
          <div className="max-w-7xl mx-auto">
            <GamesPage />
          </div>
        )}

        {currentPage === "radio" && (
          <div className="max-w-7xl mx-auto">
            <RadioPage />
          </div>
        )}

        {currentPage === "profile" && (
          <div className="max-w-4xl mx-auto">
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