"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, UserPlus, Settings, LogOut, Home, Globe, Info, Bot, GripHorizontal } from "lucide-react"

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
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isCustomizing, setIsCustomizing] = useState(false)
  const islandRef = useRef<HTMLDivElement>(null)

  const pages = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "friends", label: "Friends", icon: UserPlus },
    { id: "dms", label: "DMs", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "about", label: "About", icon: Info },
  ]

  const handleExpansion = (expanded: boolean) => {
    if (isAnimating || isDragging) return
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCustomizing) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isCustomizing) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging])

  // Toggle customization mode with long press
  useEffect(() => {
    let longPressTimer: NodeJS.Timeout

    const handleTouchStart = () => {
      longPressTimer = setTimeout(() => {
        setIsCustomizing(!isCustomizing)
      }, 800)
    }

    const handleTouchEnd = () => {
      clearTimeout(longPressTimer)
    }

    const element = islandRef.current
    if (element) {
      element.addEventListener("touchstart", handleTouchStart)
      element.addEventListener("touchend", handleTouchEnd)
      element.addEventListener("mousedown", (e) => {
        if (e.button === 0) {
          // Left click
          longPressTimer = setTimeout(() => {
            setIsCustomizing(!isCustomizing)
          }, 800)
        }
      })
      element.addEventListener("mouseup", () => {
        clearTimeout(longPressTimer)
      })

      return () => {
        element.removeEventListener("touchstart", handleTouchStart)
        element.removeEventListener("touchend", handleTouchEnd)
        clearTimeout(longPressTimer)
      }
    }
  }, [isCustomizing])

  return (
    <div
      ref={islandRef}
      className={`fixed z-50 transition-all duration-300 ${
        isCustomizing ? "ring-2 ring-blue-400 ring-opacity-50" : ""
      }`}
      style={{
        top: `${16 + position.y}px`,
        left: `calc(50% + ${position.x}px)`,
        transform: "translateX(-50%)",
        cursor: isCustomizing ? (isDragging ? "grabbing" : "grab") : "default",
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white rounded-full transition-all duration-300 ease-out backdrop-blur-md border border-gray-700 ${
          isExpanded
            ? "px-6 py-3 min-w-[500px] shadow-2xl scale-105"
            : "px-8 py-4 w-fit shadow-xl hover:shadow-2xl hover:scale-102"
        } ${isCustomizing ? "animate-pulse" : ""}`}
        onMouseEnter={() => !isCustomizing && handleExpansion(true)}
        onMouseLeave={() => !isCustomizing && handleExpansion(false)}
        style={{
          background: isExpanded
            ? "linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(0,0,0,0.98) 50%, rgba(17,24,39,0.95) 100%)"
            : "linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(17,24,39,0.95) 100%)",
          boxShadow: isExpanded
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)"
            : "0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        }}
      >
        {isCustomizing && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
            <GripHorizontal className="h-3 w-3" />
          </div>
        )}

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

      {isCustomizing && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-full">
          Drag to move • Long press to exit
        </div>
      )}
    </div>
  )
}
