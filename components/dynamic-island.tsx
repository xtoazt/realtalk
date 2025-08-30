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
  Sparkles,
  Zap,
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
    { id: "dashboard", label: "Dashboard", icon: Home, color: "from-emerald-400 to-teal-400" },
    { id: "friends", label: "Friends", icon: UserPlus, color: "from-blue-400 to-indigo-400" },
    { id: "dms", label: "DMs", icon: MessageSquare, color: "from-purple-400 to-violet-400" },
    { id: "channels", label: "Channels", icon: Hash, color: "from-orange-400 to-red-400" },
    { id: "polls", label: "Polls", icon: BarChart3, color: "from-pink-400 to-rose-400" },
    { id: "voice", label: "Voice", icon: Phone, color: "from-cyan-400 to-blue-400" },
    { id: "calendar", label: "Calendar", icon: Calendar, color: "from-yellow-400 to-orange-400" },
    { id: "profile", label: "Profile", icon: User, color: "from-indigo-400 to-purple-400" },
    { id: "settings", label: "Settings", icon: Settings, color: "from-gray-400 to-slate-400" },
    { id: "about", label: "About", icon: Info, color: "from-teal-400 to-cyan-400" },
  ]

  const handleExpansion = (expanded: boolean) => {
    if (isAnimating) return
    setIsAnimating(true)
    setIsExpanded(expanded)
    setTimeout(() => setIsAnimating(false), 500)
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
    <div className={`fixed z-50 transition-all duration-700 top-12 left-1/2 -translate-x-1/2`}>
      <div
        className={`bg-gradient-to-r from-violet-600/95 via-purple-600/95 to-fuchsia-600/95 backdrop-blur-3xl border-2 border-white/40 text-white rounded-[3rem] shadow-[0_0_100px_rgba(139,92,246,0.6)] transition-all duration-700 ease-out hover:shadow-[0_0_150px_rgba(139,92,246,0.8)] hover:scale-105 relative overflow-hidden ${
          isExpanded
            ? "px-16 py-8 min-w-[1000px] scale-110"
            : "px-16 py-8 w-fit hover:scale-110"
        }`}
        onMouseEnter={() => handleExpansion(true)}
        onMouseLeave={() => handleExpansion(false)}
      >
        {/* Animated sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          <Sparkles className="absolute top-2 right-4 h-4 w-4 text-white/40 animate-pulse" />
          <Sparkles className="absolute bottom-3 left-6 h-3 w-3 text-white/30 animate-pulse delay-300" />
          <Sparkles className="absolute top-4 left-1/3 h-2 w-2 text-white/50 animate-pulse delay-700" />
        </div>

        {!isExpanded ? (
          <div className="flex items-center gap-6 transition-all duration-500">
            <div className="relative">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-300 to-cyan-300 rounded-full animate-pulse shadow-2xl shadow-emerald-300/60" />
              <div className="absolute inset-0 w-6 h-6 bg-gradient-to-r from-emerald-200 to-cyan-200 rounded-full animate-ping opacity-50" />
              <div className="absolute -inset-2 w-10 h-10 bg-gradient-to-r from-emerald-400/40 to-cyan-400/40 rounded-full animate-pulse delay-200" />
              <Zap className="absolute inset-0 h-6 w-6 text-white animate-pulse delay-500" />
            </div>
            <span className="text-5xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              real.
            </span>
            <span className="text-xl text-white font-bold bg-gradient-to-r from-white/30 to-cyan-200/30 px-6 py-3 rounded-3xl backdrop-blur-2xl border-2 border-white/40 shadow-2xl">@{username}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 py-3">
            {/* Quick Action Buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageClick("global")}
              className="h-20 w-20 rounded-3xl bg-gradient-to-r from-cyan-400/30 to-blue-400/30 hover:from-cyan-400/50 hover:to-blue-400/50 transition-all duration-500 hover:scale-125 group shadow-2xl backdrop-blur-2xl border-2 border-cyan-300/40"
              title="Global"
            >
              <Globe className="h-10 w-10 text-white group-hover:text-cyan-100 transition-all duration-300 group-hover:scale-110 drop-shadow-2xl" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageClick("ai-chat")}
              className="h-20 w-20 rounded-3xl bg-gradient-to-r from-purple-400/40 to-pink-400/40 hover:from-purple-400/60 hover:to-pink-400/60 transition-all duration-500 hover:scale-125 group shadow-2xl backdrop-blur-2xl border-2 border-purple-300/50"
              title="AI Chat"
            >
              <Bot className="h-10 w-10 text-white group-hover:text-purple-100 transition-all duration-300 group-hover:scale-110 drop-shadow-2xl" />
            </Button>

            <div className="w-1 h-12 bg-gradient-to-b from-transparent via-white/40 to-transparent mx-4 rounded-full" />

            {/* Navigation Pages */}
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
                  className={`h-16 ${showLabel ? 'px-8' : 'w-16'} rounded-3xl transition-all duration-500 hover:scale-125 group shadow-xl backdrop-blur-2xl border-2 ${
                    isActive 
                      ? `bg-gradient-to-r ${page.color} border-white/50 shadow-2xl scale-110` 
                      : "bg-white/20 hover:bg-white/30 border-white/30 hover:border-white/50"
                  }`}
                >
                  <Icon className={`h-8 w-8 transition-all duration-300 group-hover:scale-110 drop-shadow-xl ${
                    isActive ? "text-white" : "text-white group-hover:text-white"
                  }`} />
                  {showLabel && (
                    <span className="ml-3 text-sm font-bold hidden md:inline">
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
                  className={`h-16 px-8 rounded-3xl transition-all duration-500 hover:scale-125 group shadow-xl backdrop-blur-2xl border-2 ${
                    currentPage === 'movies' || currentPage === 'games' || currentPage === 'radio'
                      ? "bg-gradient-to-r from-orange-400 to-red-400 border-white/50 shadow-2xl scale-110"
                      : "bg-white/20 hover:bg-white/30 border-white/30 hover:border-white/50"
                  }`}
                  title="Entertainment"
                >
                  <Clapperboard className={`h-8 w-8 transition-all duration-300 group-hover:scale-110 drop-shadow-xl ${
                    currentPage === 'movies' || currentPage === 'games' || currentPage === 'radio'
                      ? "text-white" : "text-white group-hover:text-white"
                  }`} />
                  <span className="ml-3 text-sm font-bold hidden md:inline">Entertainment</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 bg-gradient-to-br from-violet-600/98 via-purple-600/98 to-fuchsia-600/98 backdrop-blur-3xl border-2 border-white/40 rounded-3xl shadow-[0_0_60px_rgba(139,92,246,0.4)]" align="center" avoidCollisions>
                <div className="flex flex-col gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('movies')}
                    className="justify-start gap-6 h-16 bg-white/15 hover:bg-white/25 text-white rounded-2xl transition-all duration-300 hover:scale-105 group backdrop-blur-xl border border-white/30"
                  >
                    <Clapperboard className="h-8 w-8 text-orange-300 group-hover:text-orange-200 transition-colors drop-shadow-xl" />
                    <span className="text-lg font-bold">Movies</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('games')}
                    className="justify-start gap-6 h-16 bg-white/15 hover:bg-white/25 text-white rounded-2xl transition-all duration-300 hover:scale-105 group backdrop-blur-xl border border-white/30"
                  >
                    <Gamepad2 className="h-8 w-8 text-green-300 group-hover:text-green-200 transition-colors drop-shadow-xl" />
                    <span className="text-lg font-bold">Games</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageClick('radio')}
                    className="justify-start gap-6 h-16 bg-white/15 hover:bg-white/25 text-white rounded-2xl transition-all duration-300 hover:scale-105 group backdrop-blur-xl border border-white/30"
                  >
                    <Radio className="h-8 w-8 text-blue-300 group-hover:text-blue-200 transition-colors drop-shadow-xl" />
                    <span className="text-lg font-bold">Radio</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="w-1 h-12 bg-gradient-to-b from-transparent via-white/40 to-transparent mx-4 rounded-full" />

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeCycle}
              className="h-16 w-16 rounded-3xl bg-gradient-to-r from-yellow-400/30 to-orange-400/30 hover:from-yellow-400/50 hover:to-orange-400/50 transition-all duration-500 hover:scale-125 group shadow-xl backdrop-blur-2xl border-2 border-yellow-300/40"
              title="Toggle Theme"
            >
              <Moon className="h-8 w-8 text-white group-hover:text-yellow-100 transition-all duration-300 group-hover:scale-110 drop-shadow-xl" />
            </Button>

            {/* Simple Mode Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                try { localStorage.setItem('ui-mode','simple') } catch {}
                window.location.href = '/dashboard/simple'
              }}
              className="h-16 w-16 rounded-3xl bg-gradient-to-r from-indigo-400/30 to-blue-400/30 hover:from-indigo-400/50 hover:to-blue-400/50 transition-all duration-500 hover:scale-125 group shadow-xl backdrop-blur-2xl border-2 border-indigo-300/40"
              title="Simple Mode"
            >
              <MonitorSmartphone className="h-8 w-8 text-white group-hover:text-indigo-100 transition-all duration-300 group-hover:scale-110 drop-shadow-xl" />
            </Button>

            {/* Sign Out */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSignOut}
              className="h-16 w-16 rounded-3xl bg-gradient-to-r from-red-400/30 to-pink-400/30 hover:from-red-400/50 hover:to-pink-400/50 transition-all duration-500 hover:scale-125 group shadow-xl backdrop-blur-2xl border-2 border-red-300/40"
              title="Sign out"
            >
              <LogOut className="h-8 w-8 text-white group-hover:text-red-100 transition-all duration-300 group-hover:scale-110 drop-shadow-xl" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}