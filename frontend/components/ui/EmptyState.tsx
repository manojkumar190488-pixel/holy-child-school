'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'outline'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
  }

  const iconSizes = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
  }

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeClasses[size],
        className
      )}
    >
      {icon && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={cn(
            'mb-4 flex items-center justify-center rounded-2xl bg-muted text-muted-foreground',
            iconSizes[size]
          )}
        >
          {icon}
        </motion.div>
      )}

      <h3 className={cn('font-semibold text-foreground', titleSizes[size])}>{title}</h3>

      {subtitle && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-col items-center gap-2.5 sm:flex-row">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              size="sm"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick} size="sm">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default EmptyState
