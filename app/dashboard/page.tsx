"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DynamicIsland } from "@/components/dynamic-island"
import { ChatWindow } from "@/components/chat-window"
import { FriendsPage } from "@/components/friends-page"
import { DMsPage } from "@/components/dms-page"
import { CreateGroupChat } from "@/components/create-group-chat"
import { TimeDateDisplay } from "@/components/time-date-display" // New import
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Globe } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { AI_USER_ID, AI_USERNAME } from "@/lib/constants" // Import AI constants

interface GroupChat {
  id: string
  name: string
  creator_username: string
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [groupChats, setGroupChats] = useState<GroupChat[]>([])
  const [activeChat, setActiveChat] = useState<{
    type: "global" | "group" | "dm" | null
    id?: string
    name: string
  }>({ type: null, name: "" })
  const [showCreateGC, setShowCreateGC] = useState(false)
  const router = useRouter()

  const fetchGroupChats = useCallback(async () => {
    if (!user) return
    try {
      const response = await fetch("/api/group-chats")
      if (response.ok) {
        const data = await response.json()
        setGroupChats(data.groupChats)
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
      }
    } catch (error) {
      console.error("Failed to create group chat:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      router.push("/auth")
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }

  const handleStartDM = (friendId: string, friendUsername: string) => {
    setActiveChat({
      type: "dm",
      id: friendId,
      name: `@${friendUsername}`,
    })
    setCurrentPage("dashboard")
  }

  const handlePageChange = (page: string) => {
    if (page === "settings") {
      router.push("/settings")
    } else if (page === "about") {
      router.push("/about") // Navigate to About page
    } else {
      setCurrentPage(page)
      // Clear active chat when switching pages
      if (page !== "dashboard") {
        setActiveChat({ type: null, name: "" })
      }
    }
  }

  const handleGlobalChatClick = () => {
    setActiveChat({ type: "global", name: "Global Chat" })
    setCurrentPage("dashboard")
  }

  const handleAIChatClick = () => {
    setActiveChat({ type: "dm", id: AI_USER_ID, name: AI_USERNAME })
    setCurrentPage("dashboard")
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
    <div className="min-h-screen bg-background transition-colors duration-300">
      <DynamicIsland
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onSignOut={handleSignOut}
        onGlobalChatClick={handleGlobalChatClick}
        onAIChatClick={handleAIChatClick} // Pass new handler
        username={user.username}
      />

      <div className="pt-20 px-4 pb-4">
        {currentPage === "dashboard" && (
          <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto h-[calc(100vh-theme(spacing.20))]">
            {/* Sidebar for chat types - Only show group chats and DMs, NOT global */}
            <div className="w-full md:w-80 space-y-4 flex-shrink-0">
              <Card className="animate-fadeIn">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Group Chats</span>
                    <Button variant="ghost" size="sm" onClick={() => setShowCreateGC(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {groupChats.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No group chats yet</p>
                  ) : (
                    <div className="space-y-1">
                      {groupChats.map((gc) => (
                        <Button
                          key={gc.id}
                          variant={activeChat.type === "group" && activeChat.id === gc.id ? "default" : "ghost"}
                          className="w-full justify-start text-left transition-all duration-200 hover:scale-102"
                          onClick={() => setActiveChat({ type: "group", id: gc.id, name: gc.name })}
                        >
                          <Users className="h-4 w-4 mr-2 shrink-0" />
                          <span className="truncate">{gc.name}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 h-full">
              {activeChat.type ? (
                <div className="animate-fadeIn">
                  <ChatWindow
                    chatType={activeChat.type}
                    chatId={activeChat.id}
                    chatName={activeChat.name}
                    currentUserId={user.id}
                  />
                </div>
              ) : (
                <Card className="flex items-center justify-center h-full animate-fadeIn">
                  <CardContent className="text-center py-12">
                    <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-semibold text-foreground">Welcome to real.</h3>
                    <p className="text-muted-foreground mt-2 mb-4">
                      Click on "Global" or "real.AI" in the dynamic island above to start chatting,
                      <br />
                      or select a group chat from the sidebar.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>Ready to connect</span>
                    </div>
                    <div className="mt-6">
                      <TimeDateDisplay /> {/* Time and Date display */}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {currentPage === "friends" && (
          <div className="max-w-4xl mx-auto animate-slideIn">
            <FriendsPage currentUserId={user.id} onStartDM={handleStartDM} />
          </div>
        )}

        {currentPage === "dms" && (
          <div className="max-w-4xl mx-auto animate-slideIn">
            <DMsPage currentUserId={user.id} onSelectDM={handleStartDM} />
          </div>
        )}
      </div>

      {showCreateGC && user && <CreateGroupChat onClose={() => setShowCreateGC(false)} onCreate={handleCreateGC} />}
    </div>
  )
}
