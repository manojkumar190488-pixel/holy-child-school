'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, formatCompactNumber } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: number | string
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color?: 'gold' | 'green' | 'blue' | 'purple' | 'red' | 'cyan'
  loading?: boolean
  className?: string
  index?: number
  suffix?: string
  prefix?: string
  description?: string
}

const colorConfig = {
  gold: {
    bg: 'from-gold-500/10 to-gold-500/5 dark:from-gold-500/15 dark:to-gold-500/5',
    iconBg: 'bg-gold-100 text-gold-600 dark:bg-gold-900/30 dark:text-gold-400',
    border: 'border-gold-500/20',
    dot: 'bg-gold-500',
  },
  green: {
    bg: 'from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/15 dark:to-emerald-500/5',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  blue: {
    bg: 'from-blue-500/10 to-blue-500/5 dark:from-blue-500/15 dark:to-blue-500/5',
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-500/5 dark:from-purple-500/15 dark:to-purple-500/5',
    iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    border: 'border-purple-500/20',
    dot: 'bg-purple-500',
  },
  red: {
    bg: 'from-red-500/10 to-red-500/5 dark:from-red-500/15 dark:to-red-500/5',
    iconBg: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    border: 'border-red-500/20',
    dot: 'bg-red-500',
  },
  cyan: {
    bg: 'from-cyan-500/10 to-cyan-500/5 dark:from-cyan-500/15 dark:to-cyan-500/5',
    iconBg: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    border: 'border-cyan-500/20',
    dot: 'bg-cyan-500',
  },
}

export function StatsCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  color = 'gold',
  loading = false,
  className,
  index = 0,
  suffix,
  prefix,
  description,
}: StatsCardProps) {
  const config = colorConfig[color]
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  const displayValue = typeof value === 'number' ? formatCompactNumber(value) : value

  if (loading) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-xl skeleton" />
          <div className="h-4 w-16 rounded skeleton" />
        </div>
        <div className="h-8 w-24 rounded skeleton mb-1" />
        <div className="h-4 w-32 rounded skeleton" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300',
        'hover:shadow-md hover:-translate-y-0.5',
        config.border,
        className
      )}
    >
      {/* Gradient background */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-50',
          config.bg
        )}
      />

      <div className="relative">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', config.iconBg)}>
            {icon}
          </div>

          {/* Trend badge */}
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
                isPositive &&
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                isNegative &&
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                !isPositive &&
                  !isNegative &&
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : isNegative ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {isPositive && '+'}
              {change}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mt-4">
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {prefix && <span className="text-xl text-muted-foreground mr-0.5">{prefix}</span>}
            {displayValue}
            {suffix && <span className="text-xl text-muted-foreground ml-0.5">{suffix}</span>}
          </p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
          {changeLabel && (
            <p className="mt-0.5 text-xs text-muted-foreground">{changeLabel}</p>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Bottom accent dot */}
        <div
          className={cn('absolute bottom-0 right-0 h-1 w-1 rounded-full opacity-60', config.dot)}
        />
      </div>
    </motion.div>
  )
}

export default StatsCard
