'use client'

import { useEffect, useRef, useState } from 'react'
import { cn, getScoreColor, getScoreLabel } from '@/lib/utils'
import { motion, useInView } from 'framer-motion'

interface MatchScoreCircleProps {
  score: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  animated?: boolean
  className?: string
  strokeWidth?: number
}

const sizeConfig = {
  xs: { container: 'h-9 w-9', radius: 14, fontSize: 'text-xs', labelSize: 'text-[9px]' },
  sm: { container: 'h-12 w-12', radius: 18, fontSize: 'text-sm', labelSize: 'text-[10px]' },
  md: { container: 'h-16 w-16', radius: 26, fontSize: 'text-base', labelSize: 'text-xs' },
  lg: { container: 'h-24 w-24', radius: 40, fontSize: 'text-xl', labelSize: 'text-xs' },
  xl: { container: 'h-32 w-32', radius: 56, fontSize: 'text-3xl', labelSize: 'text-sm' },
}

export function MatchScoreCircle({
  score,
  size = 'md',
  showLabel = false,
  animated = true,
  className,
  strokeWidth: strokeWidthProp,
}: MatchScoreCircleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)

  const config = sizeConfig[size]
  const diameter = config.radius * 2
  const svgSize = diameter + 12
  const center = svgSize / 2
  const strokeWidth = strokeWidthProp || (size === 'xl' ? 6 : size === 'lg' ? 5 : 3.5)
  const normalizedRadius = config.radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (displayScore / 100) * circumference
  const color = getScoreColor(score)

  useEffect(() => {
    if (!animated || !isInView) return
    let start = 0
    const duration = 1000
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * score)
      setDisplayScore(start)
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [score, animated, isInView])

  const trackColor = 'rgba(51, 65, 85, 0.3)'

  return (
    <div ref={ref} className={cn('relative flex items-center justify-center flex-col', className)}>
      <div className={cn('relative', config.container)}>
        <svg
          width={svgSize}
          height={svgSize}
          className="absolute inset-0 -rotate-90"
          style={{ width: '100%', height: '100%' }}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
        >
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={normalizedRadius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={center}
            cy={center}
            r={normalizedRadius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: animated ? 'stroke-dashoffset 0.05s ease' : 'none',
              filter: score >= 80 ? `drop-shadow(0 0 4px ${color}60)` : 'none',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn('font-bold leading-none tabular-nums', config.fontSize)}
            style={{ color }}
          >
            {displayScore}
          </span>
          {(size === 'lg' || size === 'xl') && (
            <span className="text-muted-foreground" style={{ fontSize: '10px' }}>
              /100
            </span>
          )}
        </div>
      </div>
      {showLabel && (
        <div className={cn('mt-1 font-medium text-center', config.labelSize)} style={{ color }}>
          {getScoreLabel(score)}
        </div>
      )}
    </div>
  )
}

export default MatchScoreCircle
