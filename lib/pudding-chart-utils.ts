import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Pudding-style color palettes
export const puddingPalettes = {
  main: ["#ff4e50", "#fc913a", "#f9d62e", "#eae374", "#e2f4c7"],
  cool: ["#69d2e7", "#a7dbd8", "#e0e4cc", "#f38630", "#fa6900"],
  pastel: ["#fe4365", "#fc9d9a", "#f9cdad", "#c8c8a9", "#83af9b"],
  vibrant: ["#fe4365", "#fc9d9a", "#f9cdad", "#c8c8a9", "#83af9b"],
  muted: ["#594f4f", "#547980", "#45ada8", "#9de0ad", "#e5fcc2"],
  dark: ["#2d2d29", "#215a6d", "#3ca2a2", "#92c7a3", "#dfece6"],
  contrast: ["#1b1b25", "#373f51", "#58a4b0", "#a9bcd0", "#d8dbe2"],
  // Monochromatic palettes
  reds: ["#ffd6d6", "#ffadad", "#ff8585", "#ff5c5c", "#ff3333"],
  blues: ["#d6e4ff", "#adc8ff", "#85adff", "#5c91ff", "#3375ff"],
  greens: ["#d6ffd6", "#adffad", "#85ff85", "#5cff5c", "#33ff33"],
  purples: ["#e4d6ff", "#c8adff", "#ad85ff", "#915cff", "#7633ff"],
  oranges: ["#ffecd6", "#ffd9ad", "#ffc785", "#ffb45c", "#ffa233"],
}

// Animation timing functions
export const animationTimings = {
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  bounce: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  elastic: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
}

// Format numbers with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}

// Format currency
export function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num)
}

// Format percentage
export function formatPercent(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(num / 100)
}

// Format time (minutes to hours and minutes)
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)

  if (hours === 0) {
    return `${mins} min`
  } else if (mins === 0) {
    return `${hours} hr`
  } else {
    return `${hours} hr ${mins} min`
  }
}

// Generate a staggered animation delay
export function staggerDelay(index: number, baseDelay = 50): string {
  return `${index * baseDelay}ms`
}

// Generate a random number within a range
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// Lighten or darken a color
export function adjustColor(color: string, amount: number): string {
  // Simple implementation - for production use a proper color library
  return color // Placeholder
}

// Truncate text with ellipsis
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

// Get contrasting text color (black or white) based on background
export function getContrastText(backgroundColor: string): string {
  // Simple implementation - for production use a proper color contrast library
  return "#ffffff" // Placeholder
}

// Generate a unique ID
export function generateId(prefix = "pudding"): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
}
