import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CSSProperties } from "react" // Import React for CSSProperties type

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
 * Returns a string of Tailwind CSS classes for the gold animation effect.
 * @param hasGold Boolean indicating if the user has gold animation.
 * @returns A string of Tailwind classes or an empty string.
 */
export function getUsernameGoldClass(hasGold?: boolean): string {
  return hasGold
    ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse font-medium"
    : ""
}

/**
 * Returns a string of Tailwind CSS classes for the AI user's styling.
 * @returns A string of Tailwind classes.
 */
export function getAIUsernameClass(): string {
  return "text-blue-500 font-medium"
}
