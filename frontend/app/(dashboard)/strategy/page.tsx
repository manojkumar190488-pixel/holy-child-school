'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  GitBranch,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Lightbulb,
  Award,
  ArrowRight,
  AlertTriangle,
  Zap,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const GAPS = [
  {
    area: 'International Exposure',
    gap: 'Limited bilateral/multilateral project leadership as principal',
    action: 'Target World Bank / ADB / GIZ assignments as consultant-of-record; apply for consultant positions with ICB procurement',
    priority: 'High',
    timeline: '3 months',
    icon: '🌍',
  },
  {
    area: 'P&L Ownership',
    gap: 'No direct P&L or practice revenue responsibility on record',
    action: 'Seek Practice Lead / Business Unit Head roles in consulting; target Associate Partner track at Big 4',
    priority: 'High',
    timeline: '6 months',
    icon: '📊',
  },
  {
    area: 'AI/ML Credentials',
    gap: 'No formal AI governance or ML certification despite domain experience',
    action: 'Complete Google Cloud Professional AI Practitioner or Stanford Online AI in Healthcare within 3 months',
    priority: 'Medium',
    timeline: '3 months',
    icon: '🤖',
  },
  {
    area: 'Board / CXO Network',
    gap: 'Limited access to C-suite and Board-level principals in the ecosystem',
    action: 'Join CII Digital India committee, NASSCOM Public Sector Council, or ORF Health Policy Forum as contributing member',
    priority: 'Medium',
    timeline: '2 months',
    icon: '🤝',
  },
]

const PHASES = [
  {
    phase: 1,
    title: 'Active Search & Pipeline Build',
    timeline: 'Now – 2 months',
    status: 'active',
    color: 'border-l-gold-500',
    dotColor: 'bg-gold-500',
    tasks: [
      'Apply to 50+ high-match opportunities (score ≥80%) across all platforms',
      'Connect with 30 target recruiters at priority organisations',
      'Optimise LinkedIn profile for VP/Director/Partner positioning',
      'Attend 2 industry events (CII, PHD Chamber, NASSCOM)',
      'Complete AI/ML certification from target provider',
    ],
    kpi: '50 applications submitted, 15+ recruiter connections',
  },
  {
    phase: 2,
    title: 'Interview Pipeline Activation',
    timeline: '2–4 months',
    status: 'upcoming',
    color: 'border-l-blue-500',
    dotColor: 'bg-blue-500',
    tasks: [
      'Target 10+ first-round interviews across 5+ organisations',
      'Narrow to 3 strong-pipeline organisations (World Bank, UNDP, Deloitte)',
      'Complete at least 2 case study mock sessions per organisation',
      'Request informational interviews with 5 target decision-makers',
      'Build salary negotiation strategy with market benchmarks',
    ],
    kpi: '10 first rounds, 3 strong pipeline orgs confirmed',
  },
  {
    phase: 3,
    title: 'Offer Generation & Negotiation',
    timeline: '4–6 months',
    status: 'upcoming',
    color: 'border-l-emerald-500',
    dotColor: 'bg-emerald-500',
    tasks: [
      '2–3 final-round interviews in parallel',
      'Prepare counter-offer strategy targeting ₹90L+ CTC',
      'Evaluate offers on total value: compensation, role scope, growth trajectory',
      'Negotiate start dates, benefits, and remote flexibility',
      'Secure written offer and perform due diligence',
    ],
    kpi: '1-2 written offers received, negotiation complete',
  },
  {
    phase: 4,
    title: 'Onboarding & Credibility Building',
    timeline: '6–12 months',
    status: 'future',
    color: 'border-l-purple-500',
    dotColor: 'bg-purple-500',
    tasks: [
      '90-day onboarding plan: listen, learn, map stakeholders',
      'Deliver 1 visible early win within first 6 months',
      'Establish executive presence in the new organisation',
      'Build internal coalition and cross-functional relationships',
    ],
    kpi: 'On track, positive 6-month review',
  },
  {
    phase: 5,
    title: 'Domain Authority & Executive Presence',
    timeline: '12–24 months',
    status: 'future',
    color: 'border-l-teal-500',
    dotColor: 'bg-teal-400',
    tasks: [
      'Publish 3 thought leadership pieces (HBR India, WHO blog, LinkedIn long-form)',
      'Speak at 2 major conferences (PHD Chamber, World Bank DevTalks)',
      'Mentor 2 junior professionals in the digital gov space',
      'Expand CXO network to 50+ direct connections',
    ],
    kpi: 'Recognised domain voice, speaking invitations received',
  },
  {
    phase: 6,
    title: 'Partnership / CDO Track Progression',
    timeline: '24+ months',
    status: 'future',
    color: 'border-l-rose-500',
    dotColor: 'bg-rose-400',
    tasks: [
      'Pursue Partnership track at consulting firm or CDO appointment in a government/multilateral context',
      'Lead a signature programme with multi-country or national impact',
      'Build a personal advisory board of 5 senior sponsors',
    ],
    kpi: 'Partner/CDO designation or equivalent executive appointment',
  },
]

const AI_INSIGHTS = [
  {
    icon: Zap,
    color: 'text-gold-500',
    bg: 'bg-gold-500/10',
    title: 'Optimal Application Window Open Now',
    body: 'Analysis of your target organisations shows World Bank, UNDP, and ADB have a 68% higher response rate for VP-level candidates who apply in May–July. 3 high-confidence roles close within 14 days. Act now.',
  },
  {
    icon: TrendingUp,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    title: 'Salary Negotiation Leverage',
    body: 'Your 15+ years profile + digital transformation specialisation puts you in the top 12th percentile of candidates for Director/VP roles in development consulting. Market data supports a ₹85L–₹100L target CTC for your next move.',
  },
  {
    icon: Lightbulb,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    title: 'Underexplored Channel: Bilateral Agencies',
    body: 'GIZ, JICA, AFD, and KfW India offices are significantly underutilised by candidates with your profile. These agencies are currently scaling digital governance programmes and often skip public job boards — direct outreach has a 3x response rate.',
  },
]

const PRIORITY_COLORS = {
  High: 'bg-red-500/10 text-red-600 dark:text-red-400',
  Medium: 'bg-gold-500/10 text-gold-600 dark:text-gold-400',
  Low: 'bg-muted text-muted-foreground',
}

export default function StrategyPage() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1)

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">AI Career Strategy</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your personalised executive roadmap — updated{' '}
            <span className="font-semibold text-gold-500">today</span>
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-600 dark:text-gold-400">
          <GitBranch className="h-3.5 w-3.5" />
          Phase 1 Active
        </span>
      </div>

      {/* Current + Target State */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-muted p-2">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Current Position</p>
              <p className="text-[10px] text-muted-foreground">Where you are today</p>
            </div>
          </div>
          <p className="text-lg font-extrabold text-foreground">Senior Consulting Professional</p>
          <p className="mt-1 text-sm text-muted-foreground">15+ years experience</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['Digital Transformation', 'e-Governance', 'Public Health IT', 'PMU/TSU', 'Donor Coordination'].map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-gold-500/30 bg-card p-5 ring-1 ring-gold-500/20"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-gold-500/10 p-2">
              <Target className="h-4 w-4 text-gold-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Target State</p>
              <p className="text-[10px] text-muted-foreground">Where you want to be by Dec 2026</p>
            </div>
          </div>
          <p className="text-lg font-extrabold text-foreground">VP / Associate Partner / CDO</p>
          <p className="mt-1 text-sm text-muted-foreground">or Practice Head · ₹85L+ CTC</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['World Bank', 'Deloitte Gov', 'UNDP', 'Gates Foundation', 'WHO'].map((tag) => (
              <span key={tag} className="rounded-full bg-gold-500/10 px-2.5 py-0.5 text-[10px] font-bold text-gold-600 dark:text-gold-400">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Gap Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-card"
      >
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <AlertTriangle className="h-4 w-4 text-gold-500" />
          <h3 className="text-sm font-bold text-foreground">Strategic Gap Analysis</h3>
          <span className="ml-auto text-xs text-muted-foreground">{GAPS.length} gaps identified</span>
        </div>
        <div className="divide-y divide-border">
          {GAPS.map((gap, i) => (
            <div key={i} className="px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{gap.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-bold text-foreground">{gap.area}</p>
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold', PRIORITY_COLORS[gap.priority as keyof typeof PRIORITY_COLORS])}>
                      {gap.priority} Priority
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {gap.timeline}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    <span className="font-semibold text-foreground">Gap: </span>
                    {gap.gap}
                  </p>
                  <div className="flex items-start gap-1.5 rounded-lg bg-gold-500/5 border border-gold-500/20 px-3 py-2">
                    <ArrowRight className="h-3.5 w-3.5 text-gold-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground">{gap.action}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 6-Phase Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-border bg-card"
      >
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <GitBranch className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-bold text-foreground">6-Phase Execution Roadmap</h3>
        </div>
        <div className="divide-y divide-border">
          {PHASES.map((phase) => (
            <div key={phase.phase} className={cn('border-l-4 transition-colors', phase.color, phase.status === 'active' ? 'bg-muted/20' : '')}>
              <button
                onClick={() => setExpandedPhase(expandedPhase === phase.phase ? null : phase.phase)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors text-left"
              >
                <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0', phase.dotColor)}>
                  {phase.phase}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{phase.title}</p>
                    {phase.status === 'active' && (
                      <span className="rounded-full bg-gold-500/10 px-2 py-0.5 text-[9px] font-bold text-gold-600 dark:text-gold-400">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{phase.timeline}</p>
                </div>
                <div className="flex-shrink-0 text-xs font-semibold text-muted-foreground mr-2 hidden sm:block">
                  {phase.kpi}
                </div>
                <svg
                  className={cn('h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform', expandedPhase === phase.phase ? 'rotate-180' : '')}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedPhase === phase.phase && (
                <div className="px-5 pb-4">
                  <ul className="space-y-2 mb-3">
                    {phase.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle2 className={cn('mt-0.5 h-3.5 w-3.5 flex-shrink-0', phase.status === 'active' ? 'text-gold-500' : 'text-muted-foreground/50')} />
                        <span className="text-xs text-muted-foreground">{task}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs">
                    <Award className="h-3.5 w-3.5 text-gold-500" />
                    <span className="font-semibold text-foreground">KPI:</span>
                    <span className="text-muted-foreground">{phase.kpi}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-gold-500" />
          <h3 className="text-sm font-bold text-foreground">AI Strategic Insights</h3>
          <span className="ml-auto text-xs text-muted-foreground">Personalised · Updated today</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {AI_INSIGHTS.map((insight, i) => {
            const Icon = insight.icon
            return (
              <div key={i} className="rounded-xl border border-border bg-background p-4">
                <div className={cn('inline-flex rounded-lg p-2 mb-3', insight.bg)}>
                  <Icon className={cn('h-4 w-4', insight.color)} />
                </div>
                <p className="text-sm font-bold text-foreground mb-2">{insight.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.body}</p>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
