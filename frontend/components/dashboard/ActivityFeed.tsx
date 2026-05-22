'use client'

import { motion } from 'framer-motion'
import {
  Search,
  BookmarkCheck,
  Send,
  Star,
  Bell,
  Database,
  Users,
  Briefcase,
  CheckCircle2,
} from 'lucide-react'
import { cn, formatRelativeDate } from '@/lib/utils'

export type ActivityType =
  | 'new_jobs'
  | 'digest_sent'
  | 'scrape_complete'
  | 'high_match'
  | 'application_update'
  | 'recruiter_found'
  | 'bookmark'
  | 'search'

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  subtitle?: string
  timestamp: string
  count?: number
  metadata?: Record<string, string | number | boolean>
}

const activityConfig: Record<
  ActivityType,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  new_jobs: {
    icon: <Briefcase className="h-3.5 w-3.5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  digest_sent: {
    icon: <Send className="h-3.5 w-3.5" />,
    color: 'text-gold-600 dark:text-gold-400',
    bgColor: 'bg-gold-100 dark:bg-gold-900/30',
  },
  scrape_complete: {
    icon: <Database className="h-3.5 w-3.5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  high_match: {
    icon: <Star className="h-3.5 w-3.5" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  application_update: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  recruiter_found: {
    icon: <Users className="h-3.5 w-3.5" />,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  bookmark: {
    icon: <BookmarkCheck className="h-3.5 w-3.5" />,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
  },
  search: {
    icon: <Search className="h-3.5 w-3.5" />,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
  },
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'scrape_complete',
    title: '44 new opportunities discovered',
    subtitle: 'LinkedIn, Naukri, DevNetJobs, ReliefWeb',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    count: 44,
  },
  {
    id: '2',
    type: 'high_match',
    title: '5 high-match jobs found (>85%)',
    subtitle: 'World Bank, ADB, UNDP, WHO, GIZ',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    count: 5,
  },
  {
    id: '3',
    type: 'digest_sent',
    title: 'Daily digest sent to your inbox',
    subtitle: '10 curated opportunities · 8AM IST',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'recruiter_found',
    title: '3 new recruiters identified',
    subtitle: 'Deloitte Gov, ADB, GIZ India',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    count: 3,
  },
  {
    id: '5',
    type: 'new_jobs',
    title: '16 jobs from LinkedIn',
    subtitle: 'Digital Transformation & E-Governance',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    count: 16,
  },
  {
    id: '6',
    type: 'application_update',
    title: 'Application status updated',
    subtitle: 'WHO India — interview confirmed May 30',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    type: 'new_jobs',
    title: '10 jobs from DevNetJobs',
    subtitle: 'Public Health IT & PMU/TSU roles',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    count: 10,
  },
]

interface ActivityFeedProps {
  activities?: ActivityItem[]
  isLoading?: boolean
  maxItems?: number
  className?: string
}

export function ActivityFeed({
  activities = MOCK_ACTIVITIES,
  isLoading = false,
  maxItems = 8,
  className,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems)

  return (
    <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Recent Activity</h2>
            <p className="text-xs text-muted-foreground">Live intelligence feed</p>
          </div>
        </div>
        <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="space-y-1">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg p-2">
                <div className="h-7 w-7 skeleton rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 skeleton rounded" />
                  <div className="h-3 w-1/2 skeleton rounded" />
                </div>
                <div className="h-3 w-12 skeleton rounded flex-shrink-0" />
              </div>
            ))
          : displayActivities.map((activity, index) => {
              const config = activityConfig[activity.type]
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted cursor-default"
                >
                  <div
                    className={cn(
                      'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg',
                      config.bgColor,
                      config.color
                    )}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">
                      {activity.title}
                    </p>
                    {activity.subtitle && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {activity.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="flex-shrink-0 text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatRelativeDate(activity.timestamp)}
                  </span>
                </motion.div>
              )
            })}
      </div>

      {displayActivities.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed
