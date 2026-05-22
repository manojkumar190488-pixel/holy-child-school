'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  GripVertical,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
  ArrowRight,
  ClipboardList,
} from 'lucide-react'
import { cn, formatRelativeDate, getInitials, stringToColor } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { MatchScoreCircle } from '@/components/jobs/MatchScoreCircle'
import { EmptyState } from '@/components/ui/EmptyState'
import { createMockJob } from '@/lib/api'
import { APPLICATION_STATUSES } from '@/lib/constants'
import type { ApplicationStatus, Application } from '@/types'
import { toast } from 'sonner'

// Mock application data
const makeMockApp = (
  id: string,
  status: ApplicationStatus,
  jobOverrides = {},
  notes = '',
  nextAction = '',
  appliedAt?: string
): Application => ({
  id,
  jobId: id,
  job: createMockJob({ id, ...jobOverrides }),
  status,
  appliedAt: appliedAt || new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
  notes,
  nextAction,
  nextActionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  contacts: [],
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const INITIAL_APPLICATIONS: Application[] = [
  makeMockApp('a1', 'interested', { title: 'Senior Digital Transformation Advisor', company: { name: 'World Bank Group' } }, 'Strong profile match — 96% AI score. Research team leads before applying.', 'Research key decision-makers on LinkedIn'),
  makeMockApp('a2', 'interested', { title: 'Director, Health Information Systems', company: { name: 'UNDP India' } }, 'Spotted via ReliefWeb. Aligns perfectly with public health IT background.', 'Tailor cover letter to UNDP procurement context'),
  makeMockApp('a3', 'applied', { title: 'PMU Director – Digital Health', company: { name: 'Asian Development Bank' } }, 'Applied via ADB career portal. AI cover letter generated and customized. Referenced Manila-based role.', 'Follow up with HR in 2 weeks'),
  makeMockApp('a4', 'applied', { title: 'Senior Consultant, E-Governance', company: { name: 'Deloitte Government' } }, 'LinkedIn Easy Apply + custom cover letter. Recruiter Priya Sharma connected.', 'Follow up with recruiter by May 28'),
  makeMockApp('a5', 'interviewing', { title: 'National IT Advisor – Health', company: { name: 'WHO India' } }, 'Cleared technical screening. Panel interview with Dr. Anand (Regional Director) on May 30.', 'Prepare WHO-style competency answers + SMART examples'),
  makeMockApp('a6', 'interviewing', { title: 'Digital Transformation Lead', company: { name: 'GIZ India' } }, '2 rounds complete. Technical assessment submitted. Final HR interview June 3.', 'Send thank you email to interviewers'),
  makeMockApp('a7', 'offered', { title: 'Senior Advisor, Digital Health Strategy', company: { name: 'Gates Foundation' } }, 'Offer received: ₹85L + benefits. Remote-first. Deadline June 5.', 'Negotiate to ₹92L + relocation allowance'),
  makeMockApp('a8', 'rejected', { title: 'Chief Technology Advisor', company: { name: 'USAID India Mission' } }, 'Not selected. Feedback: required prior PEPFAR project experience. Filed for future reference.', 'Pursue USAID partner network for next opportunity'),
]

interface KanbanCardProps {
  application: Application
  onMove: (id: string, newStatus: ApplicationStatus) => void
}

function KanbanCard({ application, onMove }: KanbanCardProps) {
  const { job, status, notes, nextAction, nextActionDate, appliedAt } = application
  const initials = getInitials(job.company.name)
  const bgColor = stringToColor(job.company.name)
  const statusInfo = APPLICATION_STATUSES.find((s) => s.value === status)

  const nextStatuses = APPLICATION_STATUSES.filter(
    (s) => s.value !== status && s.value !== 'rejected'
  )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl border border-border bg-card p-4 cursor-default shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">
            {job.title}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{job.company.name}</p>
        </div>
        <MatchScoreCircle score={job.matchScore.overall} size="xs" />
      </div>

      {/* Notes */}
      {notes && (
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-2.5 bg-muted/50 rounded-lg px-2.5 py-1.5">
          {notes}
        </p>
      )}

      {/* Next Action */}
      {nextAction && (
        <div className="flex items-center gap-1.5 mb-2.5 text-[11px]">
          <ArrowRight className="h-3 w-3 flex-shrink-0 text-gold-500" />
          <span className="text-foreground font-medium">{nextAction}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {appliedAt ? formatRelativeDate(appliedAt) : 'Not applied yet'}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={`/jobs/${job.id}`}
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Move Buttons */}
      <div className="mt-2.5 flex gap-1 flex-wrap">
        {status === 'interested' && (
          <button
            onClick={() => onMove(application.id, 'applied')}
            className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 transition-colors"
          >
            Mark Applied <ChevronRight className="h-2.5 w-2.5" />
          </button>
        )}
        {status === 'applied' && (
          <button
            onClick={() => onMove(application.id, 'interviewing')}
            className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 transition-colors"
          >
            Interviewing <ChevronRight className="h-2.5 w-2.5" />
          </button>
        )}
        {status === 'interviewing' && (
          <>
            <button
              onClick={() => onMove(application.id, 'offered')}
              className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 transition-colors"
            >
              Got Offer <ChevronRight className="h-2.5 w-2.5" />
            </button>
            <button
              onClick={() => onMove(application.id, 'rejected')}
              className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 transition-colors"
            >
              Rejected
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS)

  const moveApplication = (id: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    )
    const statusLabel = APPLICATION_STATUSES.find((s) => s.value === newStatus)?.label
    toast.success(`Moved to ${statusLabel}`)
  }

  const totalCount = applications.length
  const offerCount = applications.filter((a) => a.status === 'offered').length
  const interviewCount = applications.filter((a) => a.status === 'interviewing').length

  return (
    <div className="animate-in space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-extrabold text-foreground">Application Pipeline</h2>
            {offerCount > 0 && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                🎉 {offerCount} Offer{offerCount > 1 ? 's' : ''}!
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount} applications · {interviewCount} in interview stage
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => toast.info('Go to Jobs page to track a new application')}
        >
          Add Application
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-2">
        {APPLICATION_STATUSES.map((status) => {
          const count = applications.filter((a) => a.status === status.value).length
          return (
            <div
              key={status.value}
              className={cn(
                'rounded-xl border p-3 text-center transition-colors',
                status.bgColor,
                status.borderColor
              )}
            >
              <p className={cn('text-xl font-bold', status.textColor)}>{count}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{status.label}</p>
            </div>
          )
        })}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {APPLICATION_STATUSES.map((status) => {
          const columnApps = applications.filter((a) => a.status === status.value)
          return (
            <div
              key={status.value}
              className="flex-shrink-0 w-72"
            >
              {/* Column Header */}
              <div
                className={cn(
                  'flex items-center justify-between rounded-xl border px-4 py-3 mb-3',
                  status.bgColor,
                  status.borderColor
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className={cn('text-sm font-bold', status.textColor)}>
                    {status.label}
                  </span>
                </div>
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                    status.textColor,
                    'bg-white dark:bg-card'
                  )}
                >
                  {columnApps.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-[100px]">
                <AnimatePresence>
                  {columnApps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-8 text-center">
                      <ClipboardList className="h-6 w-6 text-muted-foreground/50 mb-2" />
                      <p className="text-xs text-muted-foreground">No applications</p>
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <KanbanCard key={app.id} application={app} onMove={moveApplication} />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
