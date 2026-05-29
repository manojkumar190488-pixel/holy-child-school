'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Upload, Download, Star, Target, CheckCircle2,
  AlertCircle, Zap, RefreshCw, ExternalLink, Clock, TrendingUp,
  Award, ChevronRight, Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatsCard } from '@/components/dashboard/StatsCard'

interface ResumeVariant {
  id: string
  name: string
  description: string
  atsScore: number
  lastUpdated: string
  wordCount: number
  tags: string[]
  color: string
  isPrimary?: boolean
}

interface ATSIssue {
  type: 'error' | 'warning' | 'success'
  text: string
}

interface OptimizationLog {
  id: string
  resumeName: string
  action: string
  timestamp: string
  improvement: number
}

const RESUME_VARIANTS: ResumeVariant[] = [
  {
    id: 'r1',
    name: 'Master Resume',
    description: 'Comprehensive profile — all skills, projects and achievements',
    atsScore: 87,
    lastUpdated: '2026-05-28',
    wordCount: 1240,
    tags: ['Full Profile', 'Baseline'],
    color: 'from-gold-500/20 to-gold-400/10',
    isPrimary: true,
  },
  {
    id: 'r2',
    name: 'Government / Public Sector',
    description: 'Tailored for MeitY, NIC, NICSI, state IT departments',
    atsScore: 91,
    lastUpdated: '2026-05-26',
    wordCount: 980,
    tags: ['E-Governance', 'NHM', 'MeitY'],
    color: 'from-blue-500/20 to-blue-400/10',
  },
  {
    id: 'r3',
    name: 'Digital Transformation',
    description: 'MBB / Big 4 consulting and private sector digital advisory',
    atsScore: 84,
    lastUpdated: '2026-05-25',
    wordCount: 920,
    tags: ['Deloitte', 'EY', 'PwC', 'KPMG'],
    color: 'from-purple-500/20 to-purple-400/10',
  },
  {
    id: 'r4',
    name: 'Public Health IT',
    description: 'WHO, UNICEF, MoHFW, NHM, ABDM, state health missions',
    atsScore: 93,
    lastUpdated: '2026-05-27',
    wordCount: 1050,
    tags: ['ABDM', 'NHM', 'HIS', 'DHIS2'],
    color: 'from-emerald-500/20 to-emerald-400/10',
  },
  {
    id: 'r5',
    name: 'International Development / UN',
    description: 'World Bank, UNDP, ADB, GIZ, bilateral donor agencies',
    atsScore: 89,
    lastUpdated: '2026-05-24',
    wordCount: 1100,
    tags: ['World Bank', 'UNDP', 'ADB', 'GIZ'],
    color: 'from-cyan-500/20 to-cyan-400/10',
  },
  {
    id: 'r6',
    name: 'PMU / TSU Specialist',
    description: 'Project Management Unit / Technical Support Unit leadership roles',
    atsScore: 95,
    lastUpdated: '2026-05-28',
    wordCount: 890,
    tags: ['PMU', 'TSU', 'M&E', 'Donor Coordination'],
    color: 'from-amber-500/20 to-amber-400/10',
  },
]

const MISSING_KEYWORDS = ['ABDM Stack', 'DHIS2 Certification', 'GovStack', 'DPI Framework', 'PEPFAR', 'MIS Dashboard', 'GIS Mapping']
const PRESENT_KEYWORDS = ['PMU Director', 'TSU', 'NHM', 'Digital Health', 'E-Governance', 'Stakeholder Management', 'M&E Framework', 'Government Consulting', 'Health Information Systems']

const ATS_ISSUES: ATSIssue[] = [
  { type: 'success', text: 'Contact information is complete and well-formatted' },
  { type: 'success', text: 'Strong action verbs throughout ("led", "delivered", "transformed")' },
  { type: 'success', text: 'Quantified achievements in 8 of 12 bullet points' },
  { type: 'warning', text: 'Add a dedicated "Skills" section before experience for faster ATS parsing' },
  { type: 'warning', text: 'Summary too long — trim to 3–4 lines for optimal ATS performance' },
  { type: 'error', text: 'Missing 2 high-frequency keywords: "ABDM Stack" and "GovStack"' },
  { type: 'error', text: 'Dates inconsistent — use MM/YYYY format uniformly throughout' },
]

const OPTIMIZATION_LOG: OptimizationLog[] = [
  { id: 'l1', resumeName: 'Public Health IT', action: 'Added ABDM, NHM keywords; reordered skills section', timestamp: '2026-05-27 14:32', improvement: 6 },
  { id: 'l2', resumeName: 'PMU / TSU Specialist', action: 'Strengthened M&E bullet points with quantified outcomes', timestamp: '2026-05-26 10:15', improvement: 4 },
  { id: 'l3', resumeName: 'Master Resume', action: 'Summary rewritten to lead with digital transformation expertise', timestamp: '2026-05-25 16:48', improvement: 3 },
  { id: 'l4', resumeName: 'Government / Public Sector', action: 'Added NIC, NICSI, MeitY scheme references; fixed date formats', timestamp: '2026-05-24 09:20', improvement: 7 },
]

export default function ResumePage() {
  const [selectedResume, setSelectedResume] = useState<ResumeVariant>(RESUME_VARIANTS[0])
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleOptimize = async () => {
    setIsOptimizing(true)
    await new Promise(r => setTimeout(r, 1800))
    setIsOptimizing(false)
  }

  const scoreColor = (score: number) =>
    score >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
    score >= 80 ? 'text-gold-600 dark:text-gold-400' :
    'text-amber-500'

  const scoreBg = (score: number) =>
    score >= 90 ? 'bg-emerald-500' :
    score >= 80 ? 'bg-gold-500' :
    'bg-amber-500'

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 border border-gold-500/20">
              <FileText className="h-4 w-4 text-gold-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Resume Centre</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            6 targeted resume variants — <span className="font-semibold text-gold-600 dark:text-gold-400">avg ATS score 89.8%</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Upload className="h-3.5 w-3.5" />
            Upload Master Resume
            <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
          </label>
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
              isOptimizing
                ? 'bg-gold-500/50 text-navy-900 cursor-not-allowed'
                : 'bg-gold-500 text-navy-900 hover:bg-gold-400'
            )}
          >
            {isOptimizing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {isOptimizing ? 'Optimizing...' : 'AI Optimize Selected'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="Avg ATS Score" value={90} suffix="%" change={5} changeLabel="after last optimization" icon={<Target className="h-5 w-5" />} color="green" index={0} />
        <StatsCard label="Resume Variants" value={6} changeLabel="all domains covered" icon={<FileText className="h-5 w-5" />} color="gold" index={1} />
        <StatsCard label="Keyword Coverage" value={78} suffix="%" change={8} changeLabel="vs last month" icon={<TrendingUp className="h-5 w-5" />} color="blue" index={2} />
        <StatsCard label="Downloads (30d)" value={34} change={21} changeLabel="auto-applied resumes" icon={<Download className="h-5 w-5" />} color="purple" index={3} />
      </div>

      {/* Resume Variants Grid */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Resume Variants</h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {RESUME_VARIANTS.map((resume, i) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setSelectedResume(resume)}
              className={cn(
                'relative rounded-xl border bg-card p-4 cursor-pointer transition-all hover:shadow-card group',
                selectedResume.id === resume.id
                  ? 'border-gold-500/50 shadow-glow'
                  : 'border-border hover:border-gold-500/30'
              )}
            >
              {resume.isPrimary && (
                <div className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                  <Star className="h-2.5 w-2.5 fill-navy-900" />
                  Primary
                </div>
              )}
              <div className={cn('h-10 w-10 rounded-lg bg-gradient-to-br mb-3 flex items-center justify-center', resume.color)}>
                <FileText className="h-5 w-5 text-foreground/70" />
              </div>
              <h4 className="text-sm font-bold text-foreground mb-0.5">{resume.name}</h4>
              <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2">{resume.description}</p>

              {/* ATS Score Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">ATS Score</span>
                  <span className={cn('font-bold', scoreColor(resume.atsScore))}>{resume.atsScore}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', scoreBg(resume.atsScore))} style={{ width: `${resume.atsScore}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {resume.lastUpdated}
                </div>
                <span>{resume.wordCount.toLocaleString()} words</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {resume.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{tag}</span>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={e => { e.stopPropagation(); handleOptimize() }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20 py-1.5 text-xs font-semibold text-gold-600 dark:text-gold-400 hover:bg-gold-500/20 transition-colors"
                >
                  <Zap className="h-3 w-3" />
                  Optimize
                </button>
                <button
                  onClick={e => e.stopPropagation()}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <Eye className="h-3 w-3" />
                </button>
                <button
                  onClick={e => e.stopPropagation()}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <Download className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ATS Analysis + Keyword Gap */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* ATS Analysis Panel */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Target className="h-4 w-4 text-gold-500" />
            <div>
              <h3 className="text-sm font-bold text-foreground">ATS Analysis</h3>
              <p className="text-xs text-muted-foreground">{selectedResume.name}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-gold-500/10 border border-gold-500/20 px-2.5 py-1">
              <Award className="h-3.5 w-3.5 text-gold-500" />
              <span className="text-sm font-bold text-gold-600 dark:text-gold-400">{selectedResume.atsScore}%</span>
            </div>
          </div>
          <div className="p-5">
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Overall ATS Score</span>
                <span className={cn('font-bold', scoreColor(selectedResume.atsScore))}>{selectedResume.atsScore}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedResume.atsScore}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', scoreBg(selectedResume.atsScore))}
                />
              </div>
            </div>
            <div className="space-y-2">
              {ATS_ISSUES.map((issue, i) => {
                const Icon = issue.type === 'success' ? CheckCircle2 : issue.type === 'warning' ? AlertCircle : AlertCircle
                const color = issue.type === 'success' ? 'text-emerald-500' : issue.type === 'warning' ? 'text-amber-500' : 'text-red-500'
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2.5"
                  >
                    <Icon className={cn('h-3.5 w-3.5 mt-0.5 flex-shrink-0', color)} />
                    <p className="text-xs text-muted-foreground">{issue.text}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Keyword Gap Analysis */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Zap className="h-4 w-4 text-gold-500" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Keyword Gap Analysis</h3>
              <p className="text-xs text-muted-foreground">Based on top 50 job descriptions</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-foreground">Present Keywords ({PRESENT_KEYWORDS.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESENT_KEYWORDS.map(kw => (
                  <span key={kw} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                <span className="text-xs font-semibold text-foreground">Missing Keywords ({MISSING_KEYWORDS.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MISSING_KEYWORDS.map(kw => (
                  <span key={kw} className="rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-[11px] font-medium text-red-500">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold-500 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors disabled:opacity-50"
            >
              {isOptimizing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              {isOptimizing ? 'Adding missing keywords...' : 'Auto-Add Missing Keywords'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Optimizations Log */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold text-foreground">Recent Optimizations</h3>
          <p className="text-xs text-muted-foreground mt-0.5">AI-powered improvements applied to your resumes</p>
        </div>
        <div className="divide-y divide-border">
          {OPTIMIZATION_LOG.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors"
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-gold-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-foreground">{log.resumeName}</p>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">+{log.improvement}% ATS</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{log.action}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground flex-shrink-0">
                <Clock className="h-3 w-3" />
                {log.timestamp}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
