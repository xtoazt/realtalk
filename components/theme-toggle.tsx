"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"

interface ThemeToggleProps {
  className?: string
  size?: "sm" | "lg" | "default" | "icon"
  variant?: "default" | "ghost" | "outline"
}

export function ThemeToggle({ 
  className, 
  size = "default", 
  variant = "ghost" 
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const { user, setUser } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = async () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)

    // Save theme preference to server
    if (user) {
      try {
        const response = await fetch("/api/user/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: newTheme }),
        })

        if (response.ok) {
          // Update local user state
          setUser({ ...user, theme: newTheme })
        } else {
          console.error("Failed to save theme preference")
        }
      } catch (error) {
        console.error("Error saving theme preference:", error)
      }
    }
  }

  if (!mounted) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={cn("animate-pulse", className)}
        disabled
      >
        <div className="h-4 w-4" />
      </Button>
    )
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10", 
    lg: "h-12 w-12",
    icon: "h-8 w-8"
  }

  const iconSize = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
    icon: "h-4 w-4"
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={cn(
        "transition-all duration-300 ease-in-out hover:scale-105",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        sizeClasses[size],
        className
      )}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "dark" ? (
        <Sun className={cn("transition-transform duration-300", iconSize[size])} />
      ) : (
        <Moon className={cn("transition-transform duration-300", iconSize[size])} />
      )}
      <span className="sr-only">
        {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      </span>
    </Button>
  )
}
