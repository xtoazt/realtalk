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
        className={`bg-black/80 dark:bg-white/90 backdrop-blur-xl border-2 border-gray-300 dark:border-gray-700 text-white dark:text-black rounded-full shadow-2xl transition-all duration-300 ease-out ${
          isExpanded
            ? "px-6 py-3 min-w-[750px]"
            : "px-10 py-5 w-fit"
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
              className="h-10 w-10 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-white dark:text-black border border-blue-300 dark:border-blue-600"
              title="Global"
            >
              <Globe className="h-5 w-5 text-blue-400 dark:text-blue-600 font-bold" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageClick("ai-chat")}
              className="h-10 w-10 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-white dark:text-black border border-purple-300 dark:border-purple-600"
              title="AI Chat"
            >
              <Bot className="h-5 w-5 text-purple-400 dark:text-purple-600 font-bold" />
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
                  className={`h-10 ${showLabel ? 'px-4' : 'w-10'} rounded-full transition-all border ${
                    isActive 
                      ? "bg-green-500/30 border-green-400 text-green-300 dark:text-green-600 shadow-lg" 
                      : "bg-gray-500/10 hover:bg-gray-500/20 border-gray-400 dark:border-gray-600 text-white dark:text-black"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-green-300 dark:text-green-600' : 'text-white dark:text-black'} font-bold`} />
                  {showLabel && (
                    <span className={`ml-2 text-sm font-semibold ${isActive ? 'text-green-300 dark:text-green-600' : 'text-white dark:text-black'} hidden md:inline`}>
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
                  className={`h-10 px-4 rounded-full transition-all border ${
                    currentPage === 'movies' || currentPage === 'games' || currentPage === 'radio'
                      ? "bg-orange-500/30 border-orange-400 text-orange-300 dark:text-orange-600 shadow-lg"
                      : "bg-gray-500/10 hover:bg-gray-500/20 border-gray-400 dark:border-gray-600 text-white dark:text-black"
                  }`}
                  title="Entertainment"
                >
                  <Clapperboard className={`h-5 w-5 ${
                    currentPage === 'movies' || currentPage === 'games' || currentPage === 'radio'
                      ? 'text-orange-300 dark:text-orange-600'
                      : 'text-white dark:text-black'
                  } font-bold`} />
                  <span className={`ml-2 text-sm font-semibold ${
                    currentPage === 'movies' || currentPage === 'games' || currentPage === 'radio'
                      ? 'text-orange-300 dark:text-orange-600'
                      : 'text-white dark:text-black'
                  } hidden md:inline`}>Entertainment</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 bg-black/90 dark:bg-white/90 border-2 border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl" align="center" avoidCollisions>
                <div className="flex flex-col gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('movies')}
                    className="justify-start gap-3 h-12 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-400 dark:border-red-600 text-white dark:text-black rounded-xl"
                  >
                    <Clapperboard className="h-5 w-5 text-red-400 dark:text-red-600 font-bold" />
                    <span className="text-sm font-semibold text-white dark:text-black">Movies</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('games')}
                    className="justify-start gap-3 h-12 px-4 bg-green-500/20 hover:bg-green-500/30 border border-green-400 dark:border-green-600 text-white dark:text-black rounded-xl"
                  >
                    <Gamepad2 className="h-5 w-5 text-green-400 dark:text-green-600 font-bold" />
                    <span className="text-sm font-semibold text-white dark:text-black">Games</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('radio')}
                    className="justify-start gap-3 h-12 px-4 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400 dark:border-pink-600 text-white dark:text-black rounded-xl"
                  >
                    <Radio className="h-5 w-5 text-pink-400 dark:text-pink-600 font-bold" />
                    <span className="text-sm font-semibold text-white dark:text-black">Radio</span>
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
              className="h-10 w-10 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400 dark:border-yellow-600 text-white dark:text-black"
              title="Toggle Theme"
            >
              <Moon className="h-5 w-5 text-yellow-400 dark:text-yellow-600 font-bold" />
            </Button>

            {/* Simple Mode Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                try { localStorage.setItem('ui-mode','simple') } catch {}
                window.location.href = '/dashboard/simple'
              }}
              className="h-10 w-10 rounded-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400 dark:border-teal-600 text-white dark:text-black"
              title="Simple Mode"
            >
              <MonitorSmartphone className="h-5 w-5 text-teal-400 dark:text-teal-600 font-bold" />
            </Button>

            {/* Sign Out */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSignOut}
              className="h-10 w-10 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-400 dark:border-red-600 text-white dark:text-black"
              title="Sign out"
            >
              <LogOut className="h-5 w-5 text-red-400 dark:text-red-600 font-bold" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
