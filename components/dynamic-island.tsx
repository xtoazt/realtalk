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
    setTimeout(() => setIsAnimating(false), 200)
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
    <div className="fixed z-50 transition-all duration-200 top-6 left-1/2 -translate-x-1/2">
      <div
        className={`bg-black/90 dark:bg-white/90 backdrop-blur-xl border border-white/10 dark:border-black/10 text-white dark:text-black rounded-2xl shadow-2xl transition-all duration-200 ease-out ${
          isExpanded
            ? "px-4 py-2 min-w-[600px]"
            : "px-6 py-3 w-fit"
        }`}
        onMouseEnter={() => handleExpansion(true)}
        onMouseLeave={() => handleExpansion(false)}
      >
        {!isExpanded ? (
          <div className="flex items-center gap-3 transition-all duration-150">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-lg font-semibold tracking-tight">
              real.
            </span>
            <span className="text-xs text-white/60 dark:text-black/60 font-medium">@{username}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1 py-1">
            {/* Quick Actions */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageClick("global")}
              className="h-8 w-8 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
              title="Global"
            >
              <Globe className="h-4 w-4 text-white/80 dark:text-black/80" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageClick("ai-chat")}
              className="h-8 w-8 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
              title="AI Chat"
            >
              <Bot className="h-4 w-4 text-white/80 dark:text-black/80" />
            </Button>

            <div className="w-px h-4 bg-white/20 dark:bg-black/20 mx-1" />

            {/* Navigation */}
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
                  className={`h-8 ${showLabel ? 'px-3' : 'w-8'} rounded-lg transition-colors ${
                    isActive 
                      ? "bg-white/20 dark:bg-black/20 text-white dark:text-black" 
                      : "hover:bg-white/10 dark:hover:bg-black/10 text-white/80 dark:text-black/80"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {showLabel && (
                    <span className="ml-2 text-xs hidden md:inline font-medium">
                      {page.label}
                    </span>
                  )}
                </Button>
              )
            })}

            {/* Entertainment */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size='sm'
                  className={`h-8 px-3 rounded-lg transition-colors ${
                    currentPage === 'movies' || currentPage === 'games' || currentPage === 'radio'
                      ? "bg-white/20 dark:bg-black/20 text-white dark:text-black"
                      : "hover:bg-white/10 dark:hover:bg-black/10 text-white/80 dark:text-black/80"
                  }`}
                  title="Entertainment"
                >
                  <Clapperboard className="h-4 w-4" />
                  <span className="ml-2 text-xs hidden md:inline font-medium">Entertainment</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 bg-black/90 dark:bg-white/90 backdrop-blur-xl border border-white/10 dark:border-black/10 rounded-xl shadow-2xl" align="center" avoidCollisions>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('movies')}
                    className="justify-start gap-3 h-9 hover:bg-white/10 dark:hover:bg-black/10 text-white/90 dark:text-black/90 rounded-lg transition-colors"
                  >
                    <Clapperboard className="h-4 w-4" />
                    <span className="text-sm font-medium">Movies</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('games')}
                    className="justify-start gap-3 h-9 hover:bg-white/10 dark:hover:bg-black/10 text-white/90 dark:text-black/90 rounded-lg transition-colors"
                  >
                    <Gamepad2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Games</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('radio')}
                    className="justify-start gap-3 h-9 hover:bg-white/10 dark:hover:bg-black/10 text-white/90 dark:text-black/90 rounded-lg transition-colors"
                  >
                    <Radio className="h-4 w-4" />
                    <span className="text-sm font-medium">Radio</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="w-px h-4 bg-white/20 dark:bg-black/20 mx-1" />

            {/* System Controls */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeCycle}
              className="h-8 w-8 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
              title="Toggle Theme"
            >
              <Moon className="h-4 w-4 text-white/80 dark:text-black/80" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                try { localStorage.setItem('ui-mode','simple') } catch {}
                window.location.href = '/dashboard/simple'
              }}
              className="h-8 w-8 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
              title="Simple Mode"
            >
              <MonitorSmartphone className="h-4 w-4 text-white/80 dark:text-black/80" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onSignOut}
              className="h-8 w-8 rounded-lg hover:bg-red-500/20 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 text-red-400" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}