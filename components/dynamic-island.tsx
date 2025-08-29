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
    <div className={`fixed z-50 transition-all duration-300 top-4 left-1/2 -translate-x-1/2 animate-float`}>
      <div
        className={`glass text-white rounded-full transition-all duration-300 ease-out hover-lift ${
          isExpanded
            ? "px-4 py-2 min-w-[750px] shadow-modern-xl animate-breathe"
            : "px-8 py-4 w-fit shadow-modern-lg hover:shadow-modern-xl hover-scale"
        }`}
        onMouseEnter={() => handleExpansion(true)}
        onMouseLeave={() => handleExpansion(false)}
        style={{
          background: isExpanded
            ? `linear-gradient(135deg, 
                hsla(var(--hue), 20%, 8%, 0.98) 0%, 
                hsla(var(--hue), 10%, 5%, 0.95) 50%, 
                hsla(var(--hue), 25%, 12%, 0.98) 100%),
               radial-gradient(circle at 30% 40%, hsla(var(--hue), 60%, 40%, 0.1), transparent 70%)`
            : `linear-gradient(135deg, 
                hsla(var(--hue), 15%, 10%, 0.95) 0%, 
                hsla(var(--hue), 8%, 6%, 0.92) 100%),
               radial-gradient(circle at 50% 50%, hsla(var(--hue), 50%, 30%, 0.08), transparent 60%)`,
          boxShadow: isExpanded
            ? `0 25px 50px -12px hsla(var(--hue), 40%, 20%, 0.6), 
               0 8px 32px hsla(var(--hue), 60%, 50%, 0.15),
               0 0 0 1px hsla(var(--hue), 50%, 60%, 0.2),
               inset 0 1px 0 hsla(var(--hue), 50%, 100%, 0.1)`
            : `0 20px 25px -5px hsla(var(--hue), 30%, 15%, 0.4), 
               0 4px 16px hsla(var(--hue), 50%, 40%, 0.1),
               0 0 0 1px hsla(var(--hue), 40%, 50%, 0.15),
               inset 0 1px 0 hsla(var(--hue), 40%, 90%, 0.05)`,
        }}
      >
         {!isExpanded ? (
          <div className="flex items-center gap-3 transition-all duration-200">
            <div className="relative">
              <div className="w-3 h-3 rounded-full animate-pulse-glow" 
                   style={{
                     background: `radial-gradient(circle, hsla(120, 70%, 60%, 1) 0%, hsla(120, 80%, 50%, 0.8) 100%)`,
                     boxShadow: `0 0 12px hsla(120, 70%, 50%, 0.6)`
                   }} />
              <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-40" 
                   style={{
                     background: `hsla(120, 70%, 60%, 1)`
                   }} />
            </div>
            <span className="text-lg font-bold tracking-wide text-hue-animated">
              real.
            </span>
            <span className="text-xs opacity-80 font-medium text-shadow-soft" 
                  style={{
                    color: `hsla(var(--hue), 40%, 80%, 0.9)`
                  }}>@{username}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1 py-1">
            {/* Quick Action Buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageClick("global")}
              className="h-8 w-8 text-white btn-ghost rounded-full border-modern hover-glow"
              title="Global"
              style={{
                background: `linear-gradient(135deg, 
                  hsla(var(--hue), 30%, 20%, 0.3) 0%, 
                  hsla(var(--hue), 20%, 15%, 0.5) 100%)`,
                borderColor: `hsla(var(--hue), 50%, 50%, 0.3)`,
                color: 'white'
              }}
            >
              <Globe className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageClick("ai-chat")}
              className="h-8 w-8 text-white btn-ghost rounded-full border-modern hover-glow"
              title="AI Chat"
              style={{
                background: `linear-gradient(135deg, 
                  hsla(220, 60%, 25%, 0.3) 0%, 
                  hsla(220, 50%, 20%, 0.5) 100%)`,
                borderColor: `hsla(220, 70%, 60%, 0.3)`,
                color: 'white'
              }}
            >
              <Bot className="h-3 w-3" />
            </Button>

            <div className="w-px h-5 mx-1" 
                 style={{
                   background: `linear-gradient(180deg, 
                     transparent 0%, 
                     hsla(var(--hue), 40%, 50%, 0.4) 50%, 
                     transparent 100%)`
                 }} />

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
                  className={`h-8 ${showLabel ? 'px-3' : 'w-8'} btn-ghost rounded-full border-modern hover-glow ${
                    currentPage === page.id
                      ? "animate-pulse-glow"
                      : ""
                  }`}
                  style={currentPage === page.id ? {
                    background: `linear-gradient(135deg, 
                      hsla(var(--hue), 80%, 90%, 0.95) 0%, 
                      hsla(var(--hue), 70%, 85%, 0.9) 100%)`,
                    color: `hsla(var(--hue), 60%, 20%, 1)`,
                    borderColor: `hsla(var(--hue), 60%, 70%, 0.6)`,
                    boxShadow: `0 4px 16px hsla(var(--hue), 60%, 50%, 0.3)`
                  } : {
                    background: `linear-gradient(135deg, 
                      hsla(var(--hue), 30%, 20%, 0.4) 0%, 
                      hsla(var(--hue), 20%, 15%, 0.6) 100%)`,
                    color: 'rgba(255, 255, 255, 0.9)',
                    borderColor: `hsla(var(--hue), 40%, 50%, 0.3)`
                  }}
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
                  className={`h-8 px-3 btn-ghost rounded-full border-modern hover-glow ${
                    currentPage === 'movies' || currentPage === 'games' || currentPage === 'radio'
                      ? 'animate-pulse-glow'
                      : ''
                  }`}
                  style={currentPage === 'movies' || currentPage === 'games' || currentPage === 'radio' ? {
                    background: `linear-gradient(135deg, 
                      hsla(var(--hue), 80%, 90%, 0.95) 0%, 
                      hsla(var(--hue), 70%, 85%, 0.9) 100%)`,
                    color: `hsla(var(--hue), 60%, 20%, 1)`,
                    borderColor: `hsla(var(--hue), 60%, 70%, 0.6)`,
                    boxShadow: `0 4px 16px hsla(var(--hue), 60%, 50%, 0.3)`
                  } : {
                    background: `linear-gradient(135deg, 
                      hsla(var(--hue), 30%, 20%, 0.4) 0%, 
                      hsla(var(--hue), 20%, 15%, 0.6) 100%)`,
                    color: 'rgba(255, 255, 255, 0.9)',
                    borderColor: `hsla(var(--hue), 40%, 50%, 0.3)`
                  }}
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

            <div className="w-px h-5 mx-1" 
                 style={{
                   background: `linear-gradient(180deg, 
                     transparent 0%, 
                     hsla(var(--hue), 40%, 50%, 0.4) 50%, 
                     transparent 100%)`
                 }} />

            {/* Theme Toggle Button */}
            <ThemeToggle
              size="sm"
              variant="ghost"
              className="h-8 w-8 text-white btn-ghost rounded-full border-modern hover-glow"
              style={{
                background: `linear-gradient(135deg, 
                  hsla(270, 60%, 25%, 0.3) 0%, 
                  hsla(270, 50%, 20%, 0.5) 100%)`,
                borderColor: `hsla(270, 70%, 60%, 0.3)`,
                color: 'white'
              }}
            />

            {/* Hue Cycle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onHueCycle}
              className="h-8 w-8 text-white btn-ghost rounded-full border-modern hover-glow"
              title="Cycle Color"
              style={{
                background: `linear-gradient(135deg, 
                  hsla(var(--hue), 60%, 25%, 0.3) 0%, 
                  hsla(var(--hue), 50%, 20%, 0.5) 100%)`,
                borderColor: `hsla(var(--hue), 70%, 60%, 0.3)`,
                color: 'white'
              }}
            >
              <Palette className="h-3 w-3" />
            </Button>

            {/* Sign Out */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSignOut}
              className="h-8 w-8 text-white btn-ghost rounded-full border-modern hover-glow"
              title="Sign out"
              style={{
                background: `linear-gradient(135deg, 
                  hsla(0, 60%, 25%, 0.3) 0%, 
                  hsla(0, 50%, 20%, 0.5) 100%)`,
                borderColor: `hsla(0, 70%, 60%, 0.3)`,
                color: 'white'
              }}
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
