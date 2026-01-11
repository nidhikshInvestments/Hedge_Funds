import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined, compact = false): string {
  const numValue = Number(value) || 0

  if (compact) {
    // For stat cards - compact format
    if (numValue >= 1_000_000_000) {
      return `$${(numValue / 1_000_000_000).toFixed(2)}B`
    } else if (numValue >= 1_000_000) {
      return `$${(numValue / 1_000_000).toFixed(2)}M`
    } else if (numValue >= 1_000) {
      return `$${(numValue / 1_000).toFixed(2)}K`
    } else {
      return `$${numValue.toFixed(2)}`
    }
  } else {
    // For tables - full format with commas
    return `$${numValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
}

export function formatAxisValue(value: number | null | undefined): string {
  const numValue = Number(value) || 0

  // For chart Y-axis - compact format
  if (numValue >= 1_000_000_000) {
    return `$${(numValue / 1_000_000_000).toFixed(1)}B`
  } else if (numValue >= 1_000_000) {
    return `$${(numValue / 1_000_000).toFixed(1)}M`
  } else if (numValue >= 1_000) {
    return `$${(numValue / 1_000).toFixed(0)}K`
  } else {
    return `$${numValue.toFixed(0)}`
  }
}

export function formatPercentage(value: number | null | undefined): string {
  const numValue = Number(value) || 0
  const sign = numValue >= 0 ? "+" : ""
  return `${sign}${numValue.toFixed(2)}%`
}
