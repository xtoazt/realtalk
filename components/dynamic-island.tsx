"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, UserPlus, Settings, LogOut, Home, Globe, Info } from "lucide-react"

interface DynamicIslandProps {
  currentPage: string
  onPageChange: (page: string) => void
  onSignOut: () => void
  onGlobalChatClick: () => void
  onAIChatClick: () => void
  username: string
}

export function DynamicIsland({
  currentPage,
  onPageChange,
  onSignOut,
  onGlobalChatClick,
  onAIChatClick,
  username,
}: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const pages = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "friends", label: "Friends", icon: UserPlus },
    { id: "dms", label: "DMs", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "about", label: "About", icon: Info },
  ]

  const handleExpansion = (expanded: boolean) => {
    if (isAnimating) return
    setIsAnimating(true)
    setIsExpanded(expanded)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handlePageClick = (pageId: string) => {
    if (pageId === "global") {
      onGlobalChatClick()
    } else if (pageId === "ai-chat") {
      onAIChatClick()
    } else {
      onPageChange(pageId)
    }
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`bg-black text-white rounded-full transition-all duration-300 ease-out cursor-pointer backdrop-blur-md ${
          isExpanded
            ? "px-4 py-2 min-w-[400px] shadow-2xl scale-105"
            : "px-6 py-3 w-fit shadow-lg hover:shadow-xl hover:scale-102"
        }`}
        onMouseEnter={() => handleExpansion(true)}
        onMouseLeave={() => handleExpansion(false)}
        style={{
          background: isExpanded
            ? "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,30,0.95) 100%)"
            : "rgba(0,0,0,0.9)",
        }}
      >
        {!isExpanded ? (
          <div className="flex items-center gap-3 transition-all duration-200">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30" />
            </div>
            <span className="text-sm font-semibold tracking-wide">real.</span>
            <span className="text-xs text-gray-300 opacity-80 font-medium">@{username}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1 py-1">
            {/* Global Chat Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageClick("global")}
              className="h-8 px-3 text-white hover:bg-gray-700 transition-all duration-200 hover:scale-105"
            >
              <Globe className="h-4 w-4 mr-1" />
              Global
            </Button>

            {/* Real AI Chat Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageClick("ai-chat")}
              className="h-8 px-3 text-white hover:bg-gray-700 transition-all duration-200 hover:scale-105"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              real.AI
            </Button>

            <div className="w-px h-6 bg-gray-600 mx-1" />

            {pages.map((page) => {
              const Icon = page.icon
              return (
                <Button
                  key={page.id}
                  variant={currentPage === page.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handlePageClick(page.id)}
                  className={`h-8 px-3 transition-all duration-200 hover:scale-105 ${
                    currentPage === page.id
                      ? "bg-white text-black hover:bg-gray-100 shadow-md" // Ensure text is black when selected
                      : "text-white hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {page.label}
                </Button>
              )
            })}

            <div className="w-px h-6 bg-gray-600 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="h-8 px-3 text-white hover:bg-red-700 transition-all duration-200 hover:scale-105"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
