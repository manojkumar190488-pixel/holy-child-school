'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Rocket, Zap, Shield, CheckCircle2, XCircle, Clock, Settings2,
  Play, Pause, AlertTriangle, ChevronRight, Building2, MapPin,
  DollarSign, Star, RefreshCw, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatsCard } from '@/components/dashboard/StatsCard'

interface PendingApplication {
  id: string
  title: string
  company: string
  location: string
  salary: string
  matchScore: number
  source: string
  deadline: string
  reason: string
}

interface RecentApplication {
  id: string
  title: string
  company: string
  appliedAt: string
  status: 'submitted' | 'rejected' | 'pending' | 'interview'
  matchScore: number
  autoApplied: boolean
}

const PENDING_QUEUE: PendingApplication[] = [
  {
    id: 'p1',
    title: 'VP, Digital Transformation Programs',
    company: 'World Bank Group',
    location: 'Washington DC / Remote',
    salary: '$180,000 – $220,000',
    matchScore: 96,
    source: 'WorldBank.org',
    deadline: 'Jun 2, 2026',
    reason: 'Perfect match on PMU leadership, digital governance, and multilateral experience.',
  },
  {
    id: 'p2',
    title: 'Country Director – Digital Health',
    company: 'UNDP India',
    location: 'New Delhi, India',
    salary: '₹45L – ₹60L',
    matchScore: 93,
    source: 'UNDP Jobs',
    deadline: 'Jun 5, 2026',
    reason: 'Strong alignment with public health IT strategy and UN development mandate.',
  },
  {
    id: 'p3',
    title: 'Senior Advisor, E-Governance & Digital',
    company: 'Asian Development Bank',
    location: 'Manila / Hybrid',
    salary: '$150,000 – $190,000',
    matchScore: 91,
    source: 'ADB Careers',
    deadline: 'Jun 8, 2026',
    reason: 'Excellent fit for ADB digital infrastructure advisory and TSU programme management.',
  },
]

const RECENT_APPLICATIONS: RecentApplication[] = [
  { id: 'r1', title: 'Senior Consultant, E-Governance Practice', company: 'Deloitte Government', appliedAt: '2026-05-28', status: 'submitted', matchScore: 89, autoApplied: true },
  { id: 'r2', title: 'Digital Transformation Lead', company: 'GIZ India', appliedAt: '2026-05-27', status: 'submitted', matchScore: 88, autoApplied: true },
  { id: 'r3', title: 'National IT Advisor – Health', company: 'WHO India', appliedAt: '2026-05-26', status: 'interview', matchScore: 91, autoApplied: true },
  { id: 'r4', title: 'Program Manager, Digital Health Systems', company: 'UNICEF', appliedAt: '2026-05-24', status: 'rejected', matchScore: 82, autoApplied: true },
  { id: 'r5', title: 'Senior Advisor, Digital Health Strategy', company: 'Gates Foundation', appliedAt: '2026-05-22', status: 'pending', matchScore: 90, autoApplied: true },
]

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
  pending: { label: 'Under Review', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock },
  interview: { label: 'Interview', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', icon: Star },
}

export default function AutoApplyPage() {
  const [autonomousMode, setAutonomousMode] = useState<'off' | 'semi' | 'full'>('semi')
  const [isActive, setIsActive] = useState(true)
  const [scoreThreshold, setScoreThreshold] = useState(85)
  const [salaryMin, setSalaryMin] = useState(30)
  const [locationFilter, setLocationFilter] = useState<string[]>(['India', 'Remote', 'International'])
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set())
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set())

  const handleApprove = (id: string) => {
    setApprovedIds(prev => new Set([...prev, id]))
  }

  const handleReject = (id: string) => {
    setRejectedIds(prev => new Set([...prev, id]))
  }

  const pendingVisible = PENDING_QUEUE.filter(p => !approvedIds.has(p.id) && !rejectedIds.has(p.id))

  const toggleLocation = (loc: string) => {
    setLocationFilter(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    )
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Rocket className="h-4 w-4 text-purple-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Auto-Apply Engine</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Intelligent application automation — <span className="font-semibold text-gold-600 dark:text-gold-400">3 applications awaiting your approval</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsActive(p => !p)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all border',
              isActive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-muted text-muted-foreground border-border hover:bg-card'
            )}
          >
            {isActive ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {isActive ? 'Engine Active' : 'Engine Paused'}
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Settings2 className="h-3.5 w-3.5" />
            Configure
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="Auto-Applied This Week" value={23} change={15} changeLabel="vs last week" icon={<Rocket className="h-5 w-5" />} color="purple" index={0} />
        <StatsCard label="Interviews from Auto-Apply" value={4} change={33} changeLabel="3 pending review" icon={<Star className="h-5 w-5" />} color="gold" index={1} />
        <StatsCard label="Response Rate" value={68} suffix="%" change={12} changeLabel="vs manual 41%" icon={<Zap className="h-5 w-5" />} color="green" index={2} />
        <StatsCard label="Queue Pending Approval" value={pendingVisible.length} changeLabel="needs your review" icon={<Clock className="h-5 w-5" />} color="blue" index={3} />
      </div>

      {/* Autonomous Mode Card + Rules */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Mode Card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-gold-500" />
            <h3 className="text-sm font-bold text-foreground">Autonomous Mode</h3>
          </div>
          <div className="space-y-2">
            {([
              { key: 'off', label: 'Manual Mode', desc: 'You apply manually to every job', color: 'border-border' },
              { key: 'semi', label: 'Semi-Auto', desc: 'AI queues applications, you approve before send', color: 'border-gold-500' },
              { key: 'full', label: 'Full Auto', desc: 'AI applies autonomously above threshold', color: 'border-purple-500' },
            ] as const).map((mode) => (
              <button
                key={mode.key}
                onClick={() => setAutonomousMode(mode.key)}
                className={cn(
                  'w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                  autonomousMode === mode.key
                    ? cn('bg-gold-500/5', mode.color)
                    : 'border-border hover:bg-muted'
                )}
              >
                <div className={cn(
                  'mt-0.5 h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 transition-colors',
                  autonomousMode === mode.key ? 'border-gold-500 bg-gold-500' : 'border-muted-foreground'
                )} />
                <div>
                  <p className={cn('text-xs font-semibold', autonomousMode === mode.key ? 'text-foreground' : 'text-muted-foreground')}>{mode.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{mode.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              Currently: <span className="font-bold">Semi-Auto</span> — approve before send
            </p>
          </div>
        </div>

        {/* Rules Configuration */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Application Rules</h3>
            <span className="ml-auto text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Rules Active</span>
          </div>
          <div className="space-y-5">
            {/* Score Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-foreground">Minimum Match Score</label>
                <span className="text-sm font-bold text-gold-600 dark:text-gold-400">{scoreThreshold}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={98}
                value={scoreThreshold}
                onChange={e => setScoreThreshold(Number(e.target.value))}
                className="w-full h-1.5 rounded-full bg-muted accent-gold-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>60% (more volume)</span>
                <span>98% (perfect match only)</span>
              </div>
            </div>

            {/* Salary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-foreground">Minimum Salary (LPA / $K equivalent)</label>
                <span className="text-sm font-bold text-gold-600 dark:text-gold-400">₹{salaryMin}L+</span>
              </div>
              <input
                type="range"
                min={15}
                max={100}
                value={salaryMin}
                onChange={e => setSalaryMin(Number(e.target.value))}
                className="w-full h-1.5 rounded-full bg-muted accent-gold-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>₹15L</span>
                <span>₹1Cr+</span>
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">Location Preferences</label>
              <div className="flex flex-wrap gap-2">
                {['India', 'Remote', 'International', 'Delhi NCR', 'Mumbai', 'Bangalore', 'Southeast Asia'].map(loc => (
                  <button
                    key={loc}
                    onClick={() => toggleLocation(loc)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium border transition-all',
                      locationFilter.includes(loc)
                        ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border-gold-500/30'
                        : 'text-muted-foreground border-border hover:border-gold-500/30 hover:text-foreground'
                    )}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approval Queue */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Awaiting Your Approval</h3>
              {pendingVisible.length > 0 && (
                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-purple-500 px-1 text-[11px] font-bold text-white">
                  {pendingVisible.length}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">High-match opportunities queued by AI — review and approve to submit</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Queue
          </button>
        </div>

        {pendingVisible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-3" />
            <p className="text-sm font-semibold text-foreground">Queue cleared!</p>
            <p className="text-xs text-muted-foreground mt-1">All pending applications have been reviewed.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingVisible.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{app.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{app.company}</p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20 px-2.5 py-1">
                        <Zap className="h-3 w-3 text-gold-500" />
                        <span className="text-xs font-bold text-gold-600 dark:text-gold-400">{app.matchScore}%</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {app.location}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        {app.salary}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Deadline: {app.deadline}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded-lg px-3 py-2 border border-border">
                      <span className="font-semibold text-foreground">AI Reasoning:</span> {app.reason}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleApprove(app.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve & Send
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Skip
                      </button>
                      <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors ml-auto">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Job
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Auto-Applications */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold text-foreground">Recent Auto-Applications</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 5 applications submitted by the AI engine</p>
        </div>
        <div className="divide-y divide-border">
          {RECENT_APPLICATIONS.map((app, i) => {
            const config = STATUS_CONFIG[app.status]
            const StatusIcon = config.icon
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{app.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground">{app.company}</p>
                    <span className="text-muted-foreground">·</span>
                    <p className="text-xs text-muted-foreground">{app.appliedAt}</p>
                    {app.autoApplied && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <div className="flex items-center gap-1 text-[11px] text-purple-500">
                          <Rocket className="h-3 w-3" />
                          <span>Auto-Applied</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-bold text-muted-foreground">{app.matchScore}%</span>
                  <span className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', config.bg, config.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </span>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
