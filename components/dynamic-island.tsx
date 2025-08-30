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
        className={`bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-black/95 dark:from-gray-100/95 dark:via-gray-50/95 dark:to-white/95 backdrop-blur-2xl border border-white/20 dark:border-black/20 text-white dark:text-gray-900 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.3)] dark:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-500 ease-out hover:shadow-[0_0_60px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] ${
          isExpanded
            ? "px-8 py-4 min-w-[800px] scale-105"
            : "px-10 py-5 w-fit hover:scale-105"
        }`}
        onMouseEnter={() => handleExpansion(true)}
        onMouseLeave={() => handleExpansion(false)}
      >
         {!isExpanded ? (
          <div className="flex items-center gap-4 transition-all duration-300">
            <div className="relative">
              <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
              <div className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-emerald-300 to-cyan-300 rounded-full animate-ping opacity-40" />
              <div className="absolute -inset-1 w-6 h-6 bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 rounded-full animate-pulse" />
            </div>
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-white to-gray-300 dark:from-gray-900 dark:to-gray-700 bg-clip-text text-transparent">
              real.
            </span>
            <span className="text-sm text-white/80 dark:text-gray-700/80 font-semibold bg-white/10 dark:bg-gray-900/10 px-3 py-1 rounded-full">@{username}</span>
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

            <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/30 dark:via-gray-700/30 to-transparent mx-3" />

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

            <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/30 dark:via-gray-700/30 to-transparent mx-3" />

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
