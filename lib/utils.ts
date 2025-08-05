import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUsernameClassName(user: { has_gold_animation?: boolean; name_color?: string }) {
  if (user.has_gold_animation) {
    return "gold-username"
  }
  return "font-medium"
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
