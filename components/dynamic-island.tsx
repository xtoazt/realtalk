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
  Palette,
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
        className={`glass text-foreground rounded-full transition-all duration-300 ease-out ${
          isExpanded
            ? "px-4 py-2 min-w-[700px]"
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
              className="h-8 w-8 btn-ghost rounded-full"
              title="Global"
            >
              <Globe className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageClick("ai-chat")}
              className="h-8 w-8 btn-ghost rounded-full"
              title="AI Chat"
            >
              <Bot className="h-3 w-3" />
            </Button>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Navigation Pages (explicit buttons to avoid mis-rendering) */}
            {pages.map((page) => {
              const Icon = page.icon
              const showLabel = page.id === 'channels' || page.id === 'dms' || page.id === 'polls'
              return (
                <Button
                  key={page.id}
                  variant={currentPage === page.id ? "secondary" : "ghost"}
                  size={showLabel ? 'sm' : 'icon'}
                  onClick={() => handlePageClick(page.id)}
                  className={`h-8 ${showLabel ? 'px-3' : 'w-8'} ${currentPage === page.id ? "btn-primary" : "btn-ghost"} rounded-full`}
                >
                  <Icon className="h-3 w-3" />
                  {showLabel && (
                    <span className="ml-1 text-xs hidden md:inline">{page.label}</span>
                  )}
                </Button>
              )
            })}

            {/* Entertainment Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={currentPage === 'movies' || currentPage === 'games' || currentPage === 'radio' ? 'secondary' : 'ghost'}
                  size='sm'
                  className={`h-8 px-3 ${currentPage === 'movies' || currentPage === 'games' || currentPage === 'radio' ? "btn-primary" : "btn-ghost"} rounded-full`}
                  title="Entertainment"
                >
                  <Clapperboard className="h-3 w-3" />
                  <span className="ml-1 text-xs hidden md:inline">Entertainment</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="center" avoidCollisions>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('movies')}
                    className="justify-start gap-2"
                  >
                    <Clapperboard className="h-3 w-3" />
                    <span className="text-xs">Movies</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('games')}
                    className="justify-start gap-2"
                  >
                    <Gamepad2 className="h-3 w-3" />
                    <span className="text-xs">Games</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('radio')}
                    className="justify-start gap-2"
                  >
                    <Radio className="h-3 w-3" />
                    <span className="text-xs">Radio</span>
                  </Button>
                  {/* Search removed */}
                </div>
              </PopoverContent>
            </Popover>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Theme Toggle Button */}
            <ThemeToggle
              size="sm"
              variant="ghost"
              className="h-8 w-8 btn-ghost rounded-full"
            />

            {/* Hue Cycle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onHueCycle}
              className="h-8 w-8 btn-ghost rounded-full"
              title="Cycle Color"
            >
              <Palette className="h-3 w-3" />
            </Button>

            {/* Simple Mode Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                try { localStorage.setItem('ui-mode','simple') } catch {}
                window.location.href = '/dashboard/simple'
              }}
              className="h-8 w-8 btn-ghost rounded-full"
              title="Simple Mode"
            >
              <MonitorSmartphone className="h-3 w-3" />
            </Button>

            {/* Sign Out */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSignOut}
              className="h-8 w-8 btn-ghost rounded-full text-red-500 hover:text-red-400"
              title="Sign out"
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
