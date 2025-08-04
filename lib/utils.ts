import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CSSProperties } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a CSSProperties object for inline color styling.
 * @param nameColor The hex color string (e.g., "#RRGGBB").
 * @returns A React.CSSProperties object or an empty object if no color is provided.
 */
export function getUsernameColorStyle(nameColor?: string): CSSProperties {
  return nameColor ? { color: nameColor } : {}
}

/**
 * Returns the appropriate className for username styling based on user properties.
 * @param isAI Whether this is an AI user
 * @param hasGold Whether the user has gold animation
 * @param hasCustomColor Whether the user has a custom name color
 * @returns A string of Tailwind classes
 */
export function getUsernameClassName(isAI?: boolean, hasGold?: boolean, hasCustomColor?: boolean): string {
  if (isAI) {
    return "text-blue-500 font-medium"
  }
  if (hasGold) {
    return "gold-username"
  }
  return "font-medium"
}

/**
 * Returns whether to apply custom color styling (for use with style prop).
 * @param hasGold Whether the user has gold animation
 * @param isAI Whether this is an AI user
 * @returns Boolean indicating if custom color should be applied
 */
export function shouldApplyCustomColor(hasGold?: boolean, isAI?: boolean): boolean {
  return !hasGold && !isAI
}
