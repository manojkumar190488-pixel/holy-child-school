import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isAfter, subDays, parseISO } from 'date-fns'
import type { JobSource, MatchScoreRange } from '@/types'
import { JOB_SOURCES, SCORE_THRESHOLDS } from '@/lib/constants'

// ============================================================
// Class name merging utility
// ============================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// Date Utilities
// ============================================================

export function formatDate(dateString: string, fmt = 'MMM d, yyyy'): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    return format(date, fmt)
  } catch {
    return dateString
  }
}

export function formatRelativeDate(dateString: string): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    const sevenDaysAgo = subDays(new Date(), 7)
    if (isAfter(date, sevenDaysAgo)) {
      return formatDistanceToNow(date, { addSuffix: true })
    }
    return format(date, 'MMM d, yyyy')
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    return format(date, 'MMM d, yyyy h:mm a')
  } catch {
    return dateString
  }
}

export function isRecentDate(dateString: string, days = 1): boolean {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    const threshold = subDays(new Date(), days)
    return isAfter(date, threshold)
  } catch {
    return false
  }
}

// ============================================================
// Score Utilities
// ============================================================

export function getScoreRange(score: number): MatchScoreRange {
  if (score >= SCORE_THRESHOLDS.HIGH) return 'high'
  if (score >= SCORE_THRESHOLDS.MEDIUM) return 'medium'
  return 'low'
}

export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.HIGH) return '#10B981'
  if (score >= SCORE_THRESHOLDS.MEDIUM) return '#F59E0B'
  return '#EF4444'
}

export function getScoreTextColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.HIGH) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= SCORE_THRESHOLDS.MEDIUM) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

export function getScoreBgColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.HIGH) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
  if (score >= SCORE_THRESHOLDS.MEDIUM) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
  return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent Match'
  if (score >= 80) return 'Strong Match'
  if (score >= 70) return 'Good Match'
  if (score >= 60) return 'Fair Match'
  if (score >= 50) return 'Partial Match'
  return 'Low Match'
}

// ============================================================
// Source Utilities
// ============================================================

export function getSourceInfo(source: JobSource) {
  return JOB_SOURCES.find((s) => s.value === source) || JOB_SOURCES[JOB_SOURCES.length - 1]
}

export function getSourceColor(source: JobSource): string {
  const info = getSourceInfo(source)
  return info.color
}

export function getSourceLabel(source: JobSource): string {
  const info = getSourceInfo(source)
  return info.label
}

// ============================================================
// Salary Formatting
// ============================================================

export function formatSalary(
  min?: number,
  max?: number,
  currency = 'USD',
  period = 'annually'
): string {
  if (!min && !max) return 'Not disclosed'

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })

  const periodLabel = period === 'annually' ? '/yr' : period === 'monthly' ? '/mo' : '/hr'

  if (min && max) {
    return `${formatter.format(min)} – ${formatter.format(max)}${periodLabel}`
  }
  if (min) return `${formatter.format(min)}+${periodLabel}`
  if (max) return `Up to ${formatter.format(max)}${periodLabel}`
  return 'Not disclosed'
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

// ============================================================
// Text Utilities
// ============================================================

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function capitalizeFirst(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`
  return `${count} ${plural || singular + 's'}`
}

// ============================================================
// Color Generation
// ============================================================

export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#0A66C2', '#10B981', '#8B5CF6', '#EC4899',
    '#F59E0B', '#06B6D4', '#EF4444', '#14B8A6',
    '#F97316', '#6366F1',
  ]
  return colors[Math.abs(hash) % colors.length]
}

export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// ============================================================
// URL Utilities
// ============================================================

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function buildQueryString(params: Record<string, string | number | boolean | string[] | undefined>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v.toString()))
    } else {
      searchParams.set(key, value.toString())
    }
  }
  return searchParams.toString()
}

// ============================================================
// Validation
// ============================================================

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ============================================================
// Array Utilities
// ============================================================

export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const group = String(item[key])
    return { ...groups, [group]: [...(groups[group] || []), item] }
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

// ============================================================
// Download Utilities
// ============================================================

export function downloadAsFile(content: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

// ============================================================
// Local Storage
// ============================================================

export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore storage errors
  }
}
