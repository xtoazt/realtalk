import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUsernameClassName(user: { has_gold_animation?: boolean; name_color?: string }) {
  if (user.has_gold_animation) {
    return "gold-username"
  }
  return "font-medium text-foreground"
}

export function getUsernameColorStyle(user: { has_gold_animation?: boolean; name_color?: string }) {
  if (user.has_gold_animation) {
    return {}
  }
  if (user.name_color) {
    return { color: user.name_color }
  }
  return {}
}

export function shouldApplyCustomColor(user: { has_gold_animation?: boolean; name_color?: string }) {
  return !user.has_gold_animation && !!user.name_color
}

export function formatTime(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function formatDate(date: Date | string) {
  const d = new Date(date)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return "Today"
  } else if (diffInDays === 1) {
    return "Yesterday"
  } else if (diffInDays < 7) {
    return d.toLocaleDateString([], { weekday: "long" })
  } else {
    return d.toLocaleDateString([], { month: "short", day: "numeric" })
  }
}

export function formatDateTime(date: Date | string) {
  const d = new Date(date)
  return `${formatDate(d)} at ${formatTime(d)}`
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function generateId() {
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

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidHexColor(color: string) {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/
  return hexRegex.test(color)
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
