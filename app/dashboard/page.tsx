"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DynamicIsland } from "@/components/dynamic-island"
import { ChatWindow } from "@/components/chat-window"
import { FriendsPage } from "@/components/friends-page"
import { DMsPage } from "@/components/dms-page"
import { CreateGroupChat } from "@/components/create-group-chat"
import { OnlineUsers } from "@/components/online-users"
import { TimeDateDisplay } from "@/components/time-date-display"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Globe, Trash2 } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { AI_USER_ID, AI_USERNAME } from "@/lib/constants"

interface GroupChat {
  id: string
  name: string
  creator_username: string
  creator_id: string
}

const themes = [
  { id: "monochrome", name: "Monochrome" },
  { id: "sunset", name: "Sunset" },
  { id: "sunrise", name: "Sunrise" },
  { id: "forest", name: "Forest" },
  { id: "ocean", name: "Ocean" },
]

export default function DashboardPage() {
  const { user, loading: userLoading, setUser: updateLocalUser } = useUser()
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
          fetchGroupChats() // Refresh the list
          if (activeChat.type === "group" && activeChat.id === groupId) {
            setActiveChat({ type: null, name: "" }) // Clear active chat if deleted
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
      router.push("/about")
    } else {
      setCurrentPage(page)
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

  const handleThemeCycle = async () => {
    if (!user) {
      console.warn("[dashboard] handleThemeCycle called but user is null.")
      return
    }
    const currentIndex = themes.findIndex((t) => t.id === user.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    const nextThemeId = themes[nextIndex].id

    console.log("[dashboard] Cycling theme from", user.theme, "to", nextThemeId)

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: nextThemeId }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[dashboard] Theme update successful:", data.user.theme)
        updateLocalUser(data.user) // Update user context, which will apply the theme
      } else {
        const errorData = await response.json()
        console.error("[dashboard] Failed to update theme:", errorData.error || response.statusText)
        alert(`Failed to change theme: ${errorData.error || response.statusText}`)
      }
    } catch (error: any) {
      console.error("[dashboard] Failed to update theme:", error)
      alert(`An unexpected error occurred while changing theme: ${error.message}`)
    }
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
        onAIChatClick={handleAIChatClick}
        username={user.username}
        onThemeCycle={handleThemeCycle}
      />

      <div className="pt-20 px-4 pb-4">
        {currentPage === "dashboard" && (
          <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto h-[calc(100vh-theme(spacing.20))]">
            {/* Sidebar for chat types */}
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
                        <div key={gc.id} className="flex items-center justify-between">
                          <Button
                            variant={activeChat.type === "group" && activeChat.id === gc.id ? "default" : "ghost"}
                            className="flex-1 justify-start text-left transition-all duration-200 hover:scale-102"
                            onClick={() => setActiveChat({ type: "group", id: gc.id, name: gc.name })}
                          >
                            <Users className="h-4 w-4 mr-2 shrink-0" />
                            <span className="truncate">{gc.name}</span>
                          </Button>
                          {user.id === gc.creator_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGroupChat(gc.id)}
                              className="ml-2 text-red-500 hover:bg-red-500/10"
                              title="Delete Group Chat"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Online Users Component */}
              <OnlineUsers currentUserId={user.id} />
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
                      Click on "Global" or "AI Chat" in the dynamic island above to start chatting,
                      <br />
                      or select a group chat from the sidebar.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>Ready to connect</span>
                    </div>
                    <div className="mt-6">
                      <TimeDateDisplay />
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
