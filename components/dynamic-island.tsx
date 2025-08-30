"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  MessageSquare,
  UserPlus,
  Settings,
  LogOut,
  Home,
  Globe,
  Info,
  Bot,
  BarChart3,
  Calendar,
  Moon,
  User,
  Users,
  Phone,
  Hash,
  Clapperboard,
  Gamepad2,
  Radio,
  MonitorSmartphone,
  Search as SearchIcon,
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
    { id: "channels", label: "Channels", icon: Hash },
    { id: "polls", label: "Polls", icon: BarChart3 },
    // Movies and Games grouped under Entertainment dropdown
    { id: "voice", label: "Voice", icon: Phone },
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
        className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/60 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 rounded-full shadow-2xl transition-all duration-300 ease-out ${
          isExpanded
            ? "px-6 py-3 min-w-[700px]"
            : "px-8 py-4 w-fit"
        }`}
        onMouseEnter={() => handleExpansion(true)}
        onMouseLeave={() => handleExpansion(false)}
      >
         {!isExpanded ? (
          <div className="flex items-center gap-3 transition-all duration-200">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30" />
            </div>
            <span className="text-lg font-bold tracking-wide">
              real.
            </span>
            <span className="text-xs text-subtle font-medium">@{username}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1 py-1">
            {/* Quick Action Buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageClick("global")}
              className="h-9 w-9 rounded-xl hover:bg-gray-100/60 dark:hover:bg-gray-700/60 transition-colors"
              title="Global"
            >
              <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageClick("ai-chat")}
              className="h-9 w-9 rounded-xl hover:bg-gray-100/60 dark:hover:bg-gray-700/60 transition-colors"
              title="AI Chat"
            >
              <Bot className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Navigation Pages (explicit buttons to avoid mis-rendering) */}
            {pages.map((page) => {
              const Icon = page.icon
              const showLabel = page.id === 'channels' || page.id === 'dms' || page.id === 'polls'
              const isActive = currentPage === page.id
              return (
                <Button
                  key={page.id}
                  variant="ghost"
                  size={showLabel ? 'sm' : 'icon'}
                  onClick={() => handlePageClick(page.id)}
                  className={`h-9 ${showLabel ? 'px-4' : 'w-9'} rounded-xl transition-colors ${
                    isActive 
                      ? "bg-gray-200/70 dark:bg-gray-600/70 text-gray-900 dark:text-gray-100" 
                      : "hover:bg-gray-100/60 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {showLabel && (
                    <span className="ml-2 text-xs hidden md:inline">
                      {page.label}
                    </span>
                  )}
                </Button>
              )
            })}

            {/* Entertainment Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size='sm'
                  className={`h-9 px-4 rounded-xl transition-colors ${
                    currentPage === 'movies' || currentPage === 'games' || currentPage === 'radio'
                      ? "bg-gray-200/70 dark:bg-gray-600/70 text-gray-900 dark:text-gray-100"
                      : "hover:bg-gray-100/60 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-400"
                  }`}
                  title="Entertainment"
                >
                  <Clapperboard className="h-4 w-4" />
                  <span className="ml-2 text-xs hidden md:inline">Entertainment</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/60 dark:border-gray-600/60 rounded-xl shadow-xl" align="center" avoidCollisions>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('movies')}
                    className="justify-start gap-3 h-10 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    <Clapperboard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm">Movies</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('games')}
                    className="justify-start gap-3 h-10 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    <Gamepad2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm">Games</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('radio')}
                    className="justify-start gap-3 h-10 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    <Radio className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm">Radio</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeCycle}
              className="h-9 w-9 rounded-xl hover:bg-gray-100/60 dark:hover:bg-gray-700/60 transition-colors"
              title="Toggle Theme"
            >
              <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>

            {/* Simple Mode Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                try { localStorage.setItem('ui-mode','simple') } catch {}
                window.location.href = '/dashboard/simple'
              }}
              className="h-9 w-9 rounded-xl hover:bg-gray-100/60 dark:hover:bg-gray-700/60 transition-colors"
              title="Simple Mode"
            >
              <MonitorSmartphone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>

            {/* Sign Out */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSignOut}
              className="h-9 w-9 rounded-xl hover:bg-red-100/60 dark:hover:bg-red-900/60 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 text-red-500 dark:text-red-400" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
