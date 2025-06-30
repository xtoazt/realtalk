"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, UserPlus, Settings, LogOut, Home, Globe, Info, Bot, Palette } from "lucide-react" // Import Palette

interface DynamicIslandProps {
  currentPage: string
  onPageChange: (page: string) => void
  onSignOut: () => void
  onGlobalChatClick: () => void
  onAIChatClick: () => void
  username: string
  onThemeCycle: () => void // New prop for theme cycling
}

export function DynamicIsland({
  currentPage,
  onPageChange,
  onSignOut,
  onGlobalChatClick,
  onAIChatClick,
  username,
  onThemeCycle, // Destructure new prop
}: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  // Removed isDragging, dragStart, position, isCustomizing states

  const pages = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "friends", label: "Friends", icon: UserPlus },
    { id: "dms", label: "DMs", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "about", label: "About", icon: Info },
  ]

  const handleExpansion = (expanded: boolean) => {
    if (isAnimating) return // Prevent re-triggering animation
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

  // Removed all dragging and customization useEffects and handlers

  return (
    <div
      className={`fixed z-50 transition-all duration-300 top-4 left-1/2 -translate-x-1/2`} // Fixed position
      // Removed onMouseDown
    >
      <div
        className={`bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white rounded-full transition-all duration-300 ease-out backdrop-blur-md border border-gray-700 ${
          isExpanded
            ? "px-6 py-3 min-w-[500px] shadow-2xl scale-105"
            : "px-8 py-4 w-fit shadow-xl hover:shadow-2xl hover:scale-102"
        }`}
        onMouseEnter={() => handleExpansion(true)} // No longer checking isCustomizing
        onMouseLeave={() => handleExpansion(false)} // No longer checking isCustomizing
        style={{
          background: isExpanded
            ? "linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(0,0,0,0.98) 50%, rgba(17,24,39,0.95) 100%)"
            : "linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(17,24,39,0.95) 100%)",
          boxShadow: isExpanded
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)"
            : "0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        }}
      >
        {/* Removed customization indicator */}

        {!isExpanded ? (
          <div className="flex items-center gap-4 transition-all duration-200">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30" />
            </div>
            <span className="text-lg font-bold tracking-wide bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              real.
            </span>
            <span className="text-sm text-gray-300 opacity-90 font-medium">@{username}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1">
            {/* Quick Action Buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageClick("global")}
              className="h-9 px-4 text-white hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 rounded-full border border-gray-600/30"
            >
              <Globe className="h-4 w-4 mr-2" />
              Global
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageClick("ai-chat")}
              className="h-9 px-4 text-white hover:bg-blue-700/50 transition-all duration-200 hover:scale-105 rounded-full border border-blue-600/30"
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Chat
            </Button>

            <div className="w-px h-6 bg-gray-600 mx-2" />

            {/* Navigation Pages */}
            {pages.map((page) => {
              const Icon = page.icon
              return (
                <Button
                  key={page.id}
                  variant={currentPage === page.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handlePageClick(page.id)}
                  className={`h-9 px-4 transition-all duration-200 hover:scale-105 rounded-full ${
                    currentPage === page.id
                      ? "bg-white text-black hover:bg-gray-100 shadow-lg border border-gray-300"
                      : "text-white hover:bg-gray-700/50 border border-gray-600/30"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {page.label}
                </Button>
              )
            })}

            <div className="w-px h-6 bg-gray-600 mx-2" />

            {/* Theme Cycle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeCycle}
              className="h-9 px-4 text-white hover:bg-purple-700/50 transition-all duration-200 hover:scale-105 rounded-full border border-purple-600/30"
              title="Cycle Theme"
            >
              <Palette className="h-4 w-4" />
            </Button>

            {/* Sign Out */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="h-9 px-4 text-white hover:bg-red-700/50 transition-all duration-200 hover:scale-105 rounded-full border border-red-600/30"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Removed customization tooltip */}
    </div>
  )
}
