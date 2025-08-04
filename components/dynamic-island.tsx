"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  UserPlus,
  Settings,
  LogOut,
  Home,
  Globe,
  Info,
  Bot,
  Palette,
  BarChart3,
  Calendar,
  Moon,
  User,
} from "lucide-react"

interface DynamicIslandProps {
  currentPage: string
  onPageChange: (page: string) => void
  onSignOut: () => void
  onGlobalChatClick: () => void
  onAIChatClick: () => void
  username: string
  onThemeCycle: () => void
  onHueCycle: () => void
}

export function DynamicIsland({
  currentPage,
  onPageChange,
  onSignOut,
  onGlobalChatClick,
  onAIChatClick,
  username,
  onThemeCycle,
  onHueCycle,
}: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const pages = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "friends", label: "Friends", icon: UserPlus },
    { id: "dms", label: "DMs", icon: MessageSquare },
    { id: "polls", label: "Polls", icon: BarChart3 },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "profile", label: "Profile", icon: User },
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
    <div className={`fixed z-50 transition-all duration-300 top-4 left-1/2 -translate-x-1/2`}>
      <div
        className={`bg-gradient-to-r from-gray-900 via-black to-gray-900 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 text-white rounded-full transition-all duration-300 ease-out backdrop-blur-md border border-gray-700 dark:border-gray-600 ${
          isExpanded
            ? "px-4 py-2 min-w-[750px] shadow-2xl scale-105"
            : "px-8 py-4 w-fit shadow-xl hover:shadow-2xl hover:scale-102"
        }`}
        onMouseEnter={() => handleExpansion(true)}
        onMouseLeave={() => handleExpansion(false)}
        style={{
          background: isExpanded
            ? "linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(0,0,0,0.98) 50%, rgba(17,24,39,0.95) 100%)"
            : "linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(17,24,39,0.95) 100%)",
          boxShadow: isExpanded
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)"
            : "0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        }}
      >
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
          <div className="flex items-center justify-center gap-1 py-1">
            {/* Quick Action Buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageClick("global")}
              className="h-8 px-3 text-white hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 rounded-full border border-gray-600/30 text-xs"
            >
              <Globe className="h-3 w-3 mr-1" />
              Global
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageClick("ai-chat")}
              className="h-8 px-3 text-white hover:bg-blue-700/50 transition-all duration-200 hover:scale-105 rounded-full border border-blue-600/30 text-xs"
            >
              <Bot className="h-3 w-3 mr-1" />
              AI
            </Button>

            <div className="w-px h-5 bg-gray-600 mx-1" />

            {/* Navigation Pages */}
            {pages.map((page) => {
              const Icon = page.icon
              return (
                <Button
                  key={page.id}
                  variant={currentPage === page.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handlePageClick(page.id)}
                  className={`h-8 px-3 transition-all duration-200 hover:scale-105 rounded-full text-xs ${
                    currentPage === page.id
                      ? "bg-white text-black hover:bg-gray-100 shadow-lg border border-gray-300"
                      : "text-white hover:bg-gray-700/50 border border-gray-600/30"
                  }`}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {page.label}
                </Button>
              )
            })}

            <div className="w-px h-5 bg-gray-600 mx-1" />

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeCycle}
              className="h-8 px-3 text-white hover:bg-purple-700/50 transition-all duration-200 hover:scale-105 rounded-full border border-purple-600/30"
              title="Toggle Theme"
            >
              <Moon className="h-3 w-3" />
            </Button>

            {/* Hue Cycle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onHueCycle}
              className="h-8 px-3 text-white hover:bg-purple-700/50 transition-all duration-200 hover:scale-105 rounded-full border border-purple-600/30"
              title="Cycle Color"
            >
              <Palette className="h-3 w-3" />
            </Button>

            {/* Sign Out */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="h-8 px-3 text-white hover:bg-red-700/50 transition-all duration-200 hover:scale-105 rounded-full border border-red-600/30"
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
