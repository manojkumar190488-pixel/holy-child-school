'use client'

import { cn, getScoreColor } from '@/lib/utils'
import { JOB_SOURCES, REMOTE_TYPES, SENIORITY_LEVELS } from '@/lib/constants'
import type { JobSource, RemoteType, SeniorityLevel } from '@/types'

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'gold'
  | 'purple'
  | 'cyan'
  | 'outline'
  | 'source'
  | 'remote'
  | 'seniority'
  | 'score'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  gold: 'bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  outline: 'border border-border text-foreground',
  source: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  remote: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  seniority: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  score: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

export function Badge({ children, variant = 'default', size = 'md', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'error' && 'bg-red-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'default' && 'bg-slate-500'
          )}
        />
      )}
      {children}
    </span>
  )
}

// ============================================================
// Specialized Badges
// ============================================================

export function SourceBadge({ source }: { source: JobSource }) {
  const info = JOB_SOURCES.find((s) => s.value === source) || JOB_SOURCES[JOB_SOURCES.length - 1]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        info.bgColor,
        info.textColor
      )}
    >
      {info.label}
    </span>
  )
}

export function RemoteBadge({ type }: { type: RemoteType }) {
  const info = REMOTE_TYPES.find((r) => r.value === type)
  if (!info) return null

  const colorClasses = {
    remote: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    hybrid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    onsite: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClasses[type]
      )}
    >
      <span>{info.icon}</span>
      {info.label}
    </span>
  )
}

export function SeniorityBadge({ level }: { level: SeniorityLevel }) {
  const info = SENIORITY_LEVELS.find((s) => s.value === level)
  return (
    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
      {info?.shortLabel || level}
    </span>
  )
}

export function ScoreBadge({ score }: { score: number }) {
  const color = getScoreColor(score)
  const bgClass =
    score >= 80
      ? 'bg-emerald-100 dark:bg-emerald-900/30'
      : score >= 60
      ? 'bg-amber-100 dark:bg-amber-900/30'
      : 'bg-red-100 dark:bg-red-900/30'
  const textClass =
    score >= 80
      ? 'text-emerald-700 dark:text-emerald-400'
      : score >= 60
      ? 'text-amber-700 dark:text-amber-400'
      : 'text-red-700 dark:text-red-400'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
        bgClass,
        textClass
      )}
    >
      {score}% match
    </span>
  )
}

export function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-semibold text-gold-700 dark:bg-gold-900/30 dark:text-gold-400">
      <span className="h-1.5 w-1.5 rounded-full bg-gold-500 animate-pulse" />
      New
    </span>
  )
}

export default Badge
