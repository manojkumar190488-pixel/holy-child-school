'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Cpu,
  Search,
  FileText,
  Send,
  Users,
  Network,
  Brain,
  GitBranch,
  TrendingUp,
  Play,
  Pause,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AgentStatus = 'RUNNING' | 'IDLE' | 'QUEUED'

interface Agent {
  id: number
  name: string
  description: string
  status: AgentStatus
  lastActivity: string
  metric: string
  metricLabel: string
  icon: React.ElementType
  color: string
  bgColor: string
}

const AGENTS: Agent[] = [
  {
    id: 1,
    name: 'Discovery Agent',
    description: 'Scans 45 platforms for new opportunities matching your profile',
    status: 'RUNNING',
    lastActivity: '2 min ago',
    metric: '44',
    metricLabel: 'jobs found today',
    icon: Search,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 2,
    name: 'Verification Agent',
    description: 'Cross-checks duplicates and validates job data quality',
    status: 'RUNNING',
    lastActivity: '4 min ago',
    metric: '847',
    metricLabel: 'jobs verified',
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 3,
    name: 'Scoring Agent',
    description: 'AI-powered match scoring against your profile and preferences',
    status: 'RUNNING',
    lastActivity: '1 min ago',
    metric: '124',
    metricLabel: 'scored today',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 4,
    name: 'Resume Agent',
    description: 'Tailors resume bullets and keywords for each application',
    status: 'IDLE',
    lastActivity: '20 min ago',
    metric: '18',
    metricLabel: 'optimisations done',
    icon: FileText,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 5,
    name: 'Application Agent',
    description: 'Submits applications and tracks submission confirmations',
    status: 'RUNNING',
    lastActivity: '8 min ago',
    metric: '3',
    metricLabel: 'submitted today',
    icon: Send,
    color: 'text-gold-500',
    bgColor: 'bg-gold-500/10',
  },
  {
    id: 6,
    name: 'Recruiter Intel Agent',
    description: 'Profiles recruiters, hiring managers, and decision-makers',
    status: 'RUNNING',
    lastActivity: '6 min ago',
    metric: '28',
    metricLabel: 'recruiters profiled',
    icon: Users,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
  {
    id: 7,
    name: 'Networking Agent',
    description: 'Generates personalised outreach messages for target contacts',
    status: 'IDLE',
    lastActivity: '35 min ago',
    metric: '12',
    metricLabel: 'messages drafted',
    icon: Network,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    id: 8,
    name: 'Interview Coach Agent',
    description: 'Generates interview prep kits and mock Q&A for active pipelines',
    status: 'IDLE',
    lastActivity: '2 hrs ago',
    metric: '3',
    metricLabel: 'sessions ready',
    icon: Bot,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    id: 9,
    name: 'Strategy Agent',
    description: 'Analyses market data and generates personalised career roadmap insights',
    status: 'RUNNING',
    lastActivity: '12 min ago',
    metric: '7',
    metricLabel: 'new insights',
    icon: GitBranch,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  {
    id: 10,
    name: 'Market Intel Agent',
    description: 'Tracks salary trends, competitor moves, and sector demand signals',
    status: 'RUNNING',
    lastActivity: '18 min ago',
    metric: '2',
    metricLabel: 'reports generated',
    icon: TrendingUp,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
  },
]

const ACTIVITY_LOG = [
  { time: '10:42 AM', agent: 'Discovery Agent', action: 'Found 3 new VP-level roles on UN Careers portal', type: 'success' },
  { time: '10:39 AM', agent: 'Scoring Agent', action: 'Scored World Bank Digital Advisor role at 96% match', type: 'success' },
  { time: '10:35 AM', agent: 'Application Agent', action: 'Submitted application to GIZ India — Programme Manager Digital', type: 'success' },
  { time: '10:28 AM', agent: 'Recruiter Intel Agent', action: 'Profiled 4 new Deloitte Gov Practice hiring managers', type: 'info' },
  { time: '10:21 AM', agent: 'Strategy Agent', action: 'Identified high-probability window at UNDP DPPA — apply by June 3', type: 'warning' },
  { time: '10:15 AM', agent: 'Verification Agent', action: 'Removed 6 duplicate listings from naukri.com feed', type: 'info' },
  { time: '10:08 AM', agent: 'Market Intel Agent', action: 'VP Digital Transformation avg salary updated to ₹57L median', type: 'info' },
  { time: '09:55 AM', agent: 'Discovery Agent', action: 'Scanned LinkedIn Jobs — 12 new matches in e-governance category', type: 'success' },
  { time: '09:40 AM', agent: 'Resume Agent', action: 'Optimised resume for WHO India National IT Advisor — keywords updated', type: 'success' },
  { time: '09:30 AM', agent: 'Networking Agent', action: 'Drafted outreach message to Priya Sharma (Deloitte) — awaiting review', type: 'info' },
]

function StatusBadge({ status }: { status: AgentStatus }) {
  const cfg = {
    RUNNING: {
      label: 'Running',
      class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-500 animate-pulse',
    },
    IDLE: {
      label: 'Idle',
      class: 'bg-muted text-muted-foreground',
      dot: 'bg-muted-foreground',
    },
    QUEUED: {
      label: 'Queued',
      class: 'bg-gold-500/10 text-gold-600 dark:text-gold-400',
      dot: 'bg-gold-500 animate-pulse',
    },
  }[status]

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold', cfg.class)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const [localStatus, setLocalStatus] = useState<AgentStatus>(agent.status)
  const Icon = agent.icon

  const toggle = () => {
    setLocalStatus((s) => (s === 'RUNNING' ? 'IDLE' : 'RUNNING'))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-border bg-card p-4 hover:border-border/80 transition-all hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className={cn('rounded-lg p-2 flex-shrink-0', agent.bgColor)}>
            <Icon className={cn('h-4 w-4', agent.color)} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">{agent.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {agent.description}
            </p>
          </div>
        </div>
        <StatusBadge status={localStatus} />
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-xl font-extrabold text-foreground">{agent.metric}</p>
          <p className="text-[10px] text-muted-foreground">{agent.metricLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {agent.lastActivity}
          </span>
          <button
            onClick={toggle}
            className={cn(
              'rounded-full p-1.5 transition-colors',
              localStatus === 'RUNNING'
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
            )}
          >
            {localStatus === 'RUNNING' ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function AgentsPage() {
  const [allPaused, setAllPaused] = useState(false)

  const runningCount = AGENTS.filter((a) => a.status === 'RUNNING').length

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">AI Agent Command Centre</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{runningCount} agents active</span>
            {' '}· Operating autonomously on your behalf
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAllPaused(false)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Play className="h-3.5 w-3.5 text-emerald-500" />
            Resume All
          </button>
          <button
            onClick={() => setAllPaused(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Pause className="h-3.5 w-3.5 text-orange-500" />
            Pause All
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-gold-400 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            Run All Now
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center gap-6 rounded-xl border border-border bg-card px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-foreground">{runningCount} Running</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            {AGENTS.filter((a) => a.status === 'IDLE').length} Idle
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Cpu className="h-3.5 w-3.5" />
          System load: <span className="font-semibold text-foreground">Normal</span>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {AGENTS.map((agent, i) => (
          <AgentCard key={agent.id} agent={agent} index={i} />
        ))}
      </div>

      {/* Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Live Activity Log</h3>
            <p className="text-xs text-muted-foreground">Real-time agent actions — last 10 events</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
        <div className="divide-y divide-border">
          {ACTIVITY_LOG.map((log, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3">
              <div className="mt-0.5 flex-shrink-0">
                {log.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : log.type === 'warning' ? (
                  <AlertCircle className="h-4 w-4 text-gold-500" />
                ) : (
                  <Cpu className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{log.agent}</span>
                  <span className="text-[10px] text-muted-foreground">{log.time}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{log.action}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
