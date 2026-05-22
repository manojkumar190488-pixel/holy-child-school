'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn, getInitials, stringToColor, truncateText, formatRelativeDate } from '@/lib/utils'
import { MatchScoreCircle } from '@/components/jobs/MatchScoreCircle'
import { SourceBadge, RemoteBadge } from '@/components/ui/Badge'
import { SkillTags } from '@/components/jobs/SkillTags'
import type { Job } from '@/types'
import { useRouter } from 'next/navigation'

interface AIRecommendationsProps {
  jobs: Job[]
  isLoading?: boolean
}

function RecommendationCard({ job, index }: { job: Job; index: number }) {
  const router = useRouter()
  const initials = getInitials(job.company.name)
  const bgColor = stringToColor(job.company.name)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="group flex-shrink-0 w-72 cursor-pointer rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-gold-500/40 hover:shadow-md hover:-translate-y-1"
    >
      {/* Rank badge */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 rounded-full bg-gold-100 px-2.5 py-1 dark:bg-gold-900/30">
          <Sparkles className="h-3 w-3 text-gold-600 dark:text-gold-400" />
          <span className="text-xs font-semibold text-gold-700 dark:text-gold-400">
            #{index + 1} Match
          </span>
        </div>
        <MatchScoreCircle score={job.matchScore.overall} size="xs" />
      </div>

      {/* Company + Title */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="h-9 w-9 flex-shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors line-clamp-2">
            {job.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{job.company.name}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <SourceBadge source={job.source} />
        <RemoteBadge type={job.remoteType} />
      </div>

      {/* Why relevant */}
      {job.whyRelevant && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {job.whyRelevant}
        </p>
      )}

      {/* Top matched skills */}
      <SkillTags
        skills={job.matchScore.matchedSkills.slice(0, 3)}
        matchedSkills={job.matchScore.matchedSkills}
        maxVisible={3}
        size="sm"
      />

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatRelativeDate(job.postedAt)}</span>
        <span>{job.location}</span>
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-72 rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex justify-between">
        <div className="h-6 w-20 skeleton rounded-full" />
        <div className="h-9 w-9 skeleton rounded-full" />
      </div>
      <div className="flex gap-3 mb-3">
        <div className="h-9 w-9 skeleton rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-3 w-24 skeleton rounded" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 w-16 skeleton rounded-full" />
        <div className="h-5 w-14 skeleton rounded-full" />
      </div>
      <div className="space-y-1.5 mb-3">
        <div className="h-3 w-full skeleton rounded" />
        <div className="h-3 w-4/5 skeleton rounded" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-16 skeleton rounded-full" />
        <div className="h-5 w-14 skeleton rounded-full" />
        <div className="h-5 w-16 skeleton rounded-full" />
      </div>
    </div>
  )
}

export function AIRecommendations({ jobs, isLoading = false }: AIRecommendationsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 300
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-100 dark:bg-gold-900/30">
            <Sparkles className="h-4 w-4 text-gold-600 dark:text-gold-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">AI Recommendations</h2>
            <p className="text-xs text-muted-foreground">Your top matches today</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-none pb-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : jobs.map((job, i) => (
              <RecommendationCard key={job.id} job={job} index={i} />
            ))}

        {!isLoading && jobs.length === 0 && (
          <div className="flex h-40 w-full items-center justify-center text-sm text-muted-foreground">
            No recommendations yet. Update your profile to get personalized matches.
          </div>
        )}
      </div>
    </div>
  )
}

export default AIRecommendations
