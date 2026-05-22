'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  EyeOff,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { cn, formatRelativeDate, getInitials, stringToColor, truncateText } from '@/lib/utils'
import { MatchScoreCircle } from '@/components/jobs/MatchScoreCircle'
import { SkillTags } from '@/components/jobs/SkillTags'
import { SourceBadge, RemoteBadge, SeniorityBadge, NewBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Job } from '@/types'

interface JobCardProps {
  job: Job
  onBookmark?: (job: Job) => void
  onHide?: (job: Job) => void
  onApply?: (job: Job) => void
  variant?: 'card' | 'list' | 'compact'
  className?: string
  highlighted?: boolean
}

export function JobCard({
  job,
  onBookmark,
  onHide,
  onApply,
  variant = 'card',
  className,
  highlighted = false,
}: JobCardProps) {
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(job.isBookmarked)
  const [showActions, setShowActions] = useState(false)

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsBookmarked((prev) => !prev)
    onBookmark?.(job)
  }

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation()
    onHide?.(job)
  }

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation()
    onApply?.(job)
  }

  const handleCardClick = () => {
    router.push(`/jobs/${job.id}`)
  }

  const initials = getInitials(job.company.name)
  const bgColor = stringToColor(job.company.name)
  const isNew = new Date(job.postedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  const topSkills = job.matchScore.matchedSkills.slice(0, 3)

  if (variant === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        whileHover={{ x: 2 }}
        className={cn(
          'group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 cursor-pointer',
          'hover:border-gold-500/30 hover:shadow-md hover:bg-card',
          highlighted && 'border-gold-500/40 bg-gold-50/30 dark:bg-gold-900/10',
          className
        )}
        onClick={handleCardClick}
      >
        {/* Company Logo */}
        <div
          className="h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: bgColor }}
        >
          {job.company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.company.logoUrl}
              alt={job.company.name}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors truncate">
              {job.title}
            </h3>
            {isNew && <NewBadge />}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground/80">{job.company.name}</span>
            <span>·</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeDate(job.postedAt)}
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <SourceBadge source={job.source} />
            <RemoteBadge type={job.remoteType} />
            <SeniorityBadge level={job.seniorityLevel} />
          </div>
        </div>

        {/* Top Skills */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {topSkills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Score */}
        <div className="flex-shrink-0">
          <MatchScoreCircle score={job.matchScore.overall} size="sm" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleBookmark}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-gold-500" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleHide}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <EyeOff className="h-4 w-4" />
          </button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </motion.div>
    )
  }

  // Default card variant
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      className={cn(
        'group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 cursor-pointer overflow-hidden',
        'hover:border-gold-500/30 hover:shadow-card-hover',
        highlighted && 'border-gold-500/40 bg-gold-50/20 dark:bg-gold-900/10',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Shimmer overlay on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-gold-500/5 to-transparent rounded-xl" />

      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        {/* Company Logo */}
        <div className="flex items-start gap-3">
          <div
            className="h-11 w-11 flex-shrink-0 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm"
            style={{ backgroundColor: bgColor }}
          >
            {job.company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.company.logoUrl}
                alt={job.company.name}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                {truncateText(job.title, 45)}
              </h3>
              {isNew && <NewBadge />}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{job.company.name}</p>
          </div>
        </div>

        {/* Score */}
        <div className="flex-shrink-0">
          <MatchScoreCircle score={job.matchScore.overall} size="sm" />
        </div>
      </div>

      {/* Meta Row */}
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatRelativeDate(job.postedAt)}</span>
        </div>
      </div>

      {/* Badges Row */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <SourceBadge source={job.source} />
        <RemoteBadge type={job.remoteType} />
        <SeniorityBadge level={job.seniorityLevel} />
      </div>

      {/* Why Relevant */}
      {job.whyRelevant && (
        <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-gold-50 dark:bg-gold-900/10 border border-gold-200 dark:border-gold-800 px-2.5 py-2">
          <Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-gold-600 dark:text-gold-400" />
          <p className="text-xs text-gold-700 dark:text-gold-400 line-clamp-2">
            {job.whyRelevant}
          </p>
        </div>
      )}

      {/* Skills */}
      {topSkills.length > 0 && (
        <div className="mt-3">
          <SkillTags
            skills={topSkills}
            matchedSkills={job.matchScore.matchedSkills}
            maxVisible={3}
            size="sm"
          />
        </div>
      )}

      {/* Actions */}
      <div
        className={cn(
          'mt-4 flex items-center gap-2 pt-3 border-t border-border transition-all duration-200',
          showActions ? 'opacity-100' : 'opacity-70'
        )}
      >
        <Button
          variant="primary"
          size="xs"
          onClick={handleApply}
          leftIcon={<ExternalLink className="h-3 w-3" />}
          className="flex-1"
        >
          Apply
        </Button>
        <button
          onClick={handleBookmark}
          className={cn(
            'rounded-lg p-1.5 transition-all duration-200',
            isBookmarked
              ? 'bg-gold-100 text-gold-600 dark:bg-gold-900/30 dark:text-gold-400'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
        <button
          onClick={handleHide}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          title="Hide this job"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default JobCard
