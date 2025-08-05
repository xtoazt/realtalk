import type React from "react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUsernameClassName(user: any): string {
  console.log("[getUsernameClassName] User data:", user)
  console.log("[getUsernameClassName] has_gold_animation:", user?.has_gold_animation)

  if (user?.has_gold_animation) {
    console.log("[getUsernameClassName] Applying gold-username class")
    return "gold-username"
  }

  return "font-medium"
}

export function getUsernameColorStyle(user: any): React.CSSProperties {
  // Only apply custom color if user doesn't have gold animation
  if (user?.has_gold_animation) {
    return {}
  }

  if (user?.name_color) {
    return { color: user.name_color }
  }

  return {}
}

export function shouldApplyCustomColor(user: any): boolean {
  // Don't apply custom color if user has gold animation
  return !user?.has_gold_animation && !!user?.name_color
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function formatDate(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return "Today"
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  } else {
    return date.toLocaleDateString()
  }
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
