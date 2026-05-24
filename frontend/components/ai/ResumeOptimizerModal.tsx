'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  TrendingUp,
  Minus,
} from 'lucide-react'
import { cn, copyToClipboard } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { Job } from '@/types'
import { toast } from 'sonner'

interface ResumeOptimizerModalProps {
  isOpen: boolean
  onClose: () => void
  job: Job
}

interface Suggestion {
  section: string
  type: 'add' | 'improve' | 'remove' | 'reorder'
  priority: 'high' | 'medium' | 'low'
  current?: string
  recommended: string
  reason: string
  keywords?: string[]
}

interface OptimizationResult {
  atsScore: number
  matchScore: number
  suggestions: Suggestion[]
  keywordsToAdd: string[]
  keywordsPresent: string[]
  summaryRewrite: string
}

const TYPE_CONFIG = {
  add: { label: 'Add', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' },
  improve: { label: 'Improve', icon: <TrendingUp className="h-3.5 w-3.5" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
  remove: { label: 'Remove', icon: <Minus className="h-3.5 w-3.5" />, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800' },
  reorder: { label: 'Reorder', icon: <ArrowRight className="h-3.5 w-3.5" />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' },
}

const PRIORITY_CONFIG = {
  high: { dot: 'bg-red-500', label: 'High' },
  medium: { dot: 'bg-amber-500', label: 'Medium' },
  low: { dot: 'bg-blue-400', label: 'Low' },
}

function generateMockResult(job: Job): OptimizationResult {
  const matchedSkills = job.matchScore.matchedSkills || []
  const missingSkills = job.matchScore.missingSkills || []

  return {
    atsScore: 74,
    matchScore: job.matchScore.overall,
    keywordsPresent: matchedSkills,
    keywordsToAdd: missingSkills.length
      ? missingSkills
      : ['Results-Based Management', 'Theory of Change', 'Digital Public Infrastructure', 'Aide-Mémoire'],
    summaryRewrite: `Senior consulting professional with 14+ years driving digital transformation and e-governance programs for governments and multilateral organizations. Proven track record leading PMU/TSU operations for World Bank-funded projects, delivering health information systems at scale, and managing complex multi-stakeholder engagements. Expert in AI governance, public health IT, and program management — consistently delivering measurable outcomes in resource-constrained government settings.`,
    suggestions: [
      {
        section: 'Professional Summary',
        type: 'improve',
        priority: 'high',
        current: 'Senior consultant with extensive experience in government projects.',
        recommended: `Tailor your summary to explicitly mention: "${job.title}" at "${job.company.name}" context — e-governance, PMU leadership, digital health.`,
        reason: 'Your current summary is too generic. ATS systems and human reviewers are 60% more likely to shortlist when the summary mirrors the job title language.',
        keywords: matchedSkills.slice(0, 3),
      },
      {
        section: 'Work Experience',
        type: 'improve',
        priority: 'high',
        current: 'Led digital transformation projects for state government.',
        recommended: 'Quantify all achievements: "Led ₹150Cr digital transformation program for [State] Government, improving citizen service delivery by 40% and achieving 6 of 8 disbursement milestones 2 months ahead of schedule."',
        reason: 'Quantified achievements perform 3x better in ATS screening and resonate with senior hiring managers.',
        keywords: ['Digital Transformation', 'PMU', 'Donor Coordination'],
      },
      {
        section: 'Skills Section',
        type: 'add',
        priority: 'high',
        recommended: `Add missing keywords that appear in the job description: ${(missingSkills.length ? missingSkills : ['DHIS2', 'Digital Public Infrastructure', 'Results-Based Management']).join(', ')}.`,
        reason: 'These keywords appear in the job description but are absent from your resume. ATS will penalize missing keywords regardless of your actual experience.',
        keywords: missingSkills.length ? missingSkills : ['DHIS2', 'Digital Public Infrastructure'],
      },
      {
        section: 'Education',
        type: 'reorder',
        priority: 'medium',
        recommended: 'For this seniority level, move Education below Experience. Add your PMP certification as the first credential.',
        reason: 'At 14+ years, employers prioritize your accomplishments over degrees. Certifications like PMP are more relevant than degree year.',
      },
      {
        section: 'Achievements',
        type: 'add',
        priority: 'medium',
        recommended: 'Add a dedicated "Key Achievements" or "Impact" section with 4–5 bullet points at the top, below the summary.',
        reason: `Specific to ${job.company.name}: hiring managers spend 6 seconds on the first screen. A front-loaded achievements section dramatically increases callbacks.`,
      },
      {
        section: 'Keywords / ATS',
        type: 'improve',
        priority: 'medium',
        recommended: 'Use exact phrases from the job description: "Health Systems Strengthening", "Monitoring & Evaluation", "stakeholder engagement". Avoid synonyms — ATS matches exact strings.',
        reason: 'ATS systems often use exact keyword matching. Using "M&E" instead of "Monitoring & Evaluation" may cause misses.',
      },
    ],
  }
}

function ScoreCircle({ score, label, color }: { score: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 28
  const strokeDashoffset = circumference - (score / 100) * circumference
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-16 w-16">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="4" />
          <motion.circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-extrabold text-foreground">{score}</span>
        </div>
      </div>
      <p className="text-[11px] text-center text-muted-foreground font-medium">{label}</p>
    </div>
  )
}

export function ResumeOptimizerModal({ isOpen, onClose, job }: ResumeOptimizerModalProps) {
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [copiedSummary, setCopiedSummary] = useState(false)
  const [step, setStep] = useState<'input' | 'results'>('input')

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    await new Promise((r) => setTimeout(r, 2000))
    setResult(generateMockResult(job))
    setStep('results')
    setIsAnalyzing(false)
  }

  const handleCopySummary = async () => {
    if (!result) return
    await copyToClipboard(result.summaryRewrite)
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 2000)
    toast.success('Summary copied to clipboard!')
  }

  const handleReset = () => {
    setResult(null)
    setStep('input')
    setResumeText('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Resume Optimizer</h2>
                <p className="text-xs text-muted-foreground">{job.title} at {job.company.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {step === 'results' && (
                <Button variant="ghost" size="xs" leftIcon={<RefreshCw className="h-3 w-3" />} onClick={handleReset}>
                  Reset
                </Button>
              )}
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {step === 'input' && (
                <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-4">
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-xs font-semibold text-foreground mb-1">Analyzing for:</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{job.title}</span> at{' '}
                      <span className="font-medium text-foreground">{job.company.name}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(job.matchScore.matchedSkills || []).slice(0, 4).map((skill) => (
                        <span key={skill} className="rounded-full bg-gold-100 dark:bg-gold-900/30 px-2 py-0.5 text-[10px] font-medium text-gold-700 dark:text-gold-400">
                          {skill}
                        </span>
                      ))}
                      {(job.matchScore.missingSkills || []).length > 0 && (
                        <span className="rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-400">
                          Missing: {job.matchScore.missingSkills.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-2 block">
                      Paste Your Resume Text (optional — for deeper analysis)
                    </label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume content here for a personalized analysis, or leave blank for a general analysis based on your profile and the job description..."
                      rows={8}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 resize-none"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">Your resume text is processed locally and never stored.</p>
                  </div>

                  <div className="rounded-xl border border-dashed border-border p-4 text-center">
                    <Sparkles className="mx-auto mb-2 h-5 w-5 text-gold-500" />
                    <p className="text-xs font-semibold text-foreground">AI will analyze:</p>
                    <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground text-left max-w-xs mx-auto">
                      {['ATS keyword matching', 'Skills gap identification', 'Summary optimization', 'Achievement quantification', 'Section ordering', 'Keyword density'].map(item => (
                        <div key={item} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'results' && result && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-5">
                  {/* Scores */}
                  <div className="flex items-center justify-around py-4 border border-border rounded-xl bg-muted/20">
                    <ScoreCircle score={result.atsScore} label="ATS Score" color="#3B82F6" />
                    <div className="h-12 w-px bg-border" />
                    <ScoreCircle score={result.matchScore} label="Job Match" color="#10B981" />
                    <div className="h-12 w-px bg-border" />
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                        {result.suggestions.filter(s => s.priority === 'high').length}
                      </div>
                      <p className="text-[11px] text-center text-muted-foreground font-medium">High Priority<br />Changes</p>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-4">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Keywords Present
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywordsPresent.map((kw) => (
                          <span key={kw} className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4">
                      <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" /> Keywords to Add
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywordsToAdd.map((kw) => (
                          <span key={kw} className="rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-400">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <p className="text-xs font-bold text-foreground mb-3">Optimization Suggestions</p>
                    <div className="space-y-2.5">
                      {result.suggestions.map((s, i) => {
                        const typeConfig = TYPE_CONFIG[s.type]
                        const priorityConfig = PRIORITY_CONFIG[s.priority]
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="rounded-xl border border-border bg-card p-4"
                          >
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold', typeConfig.bg, typeConfig.color)}>
                                {typeConfig.icon}{typeConfig.label}
                              </span>
                              <span className="text-xs font-semibold text-foreground">{s.section}</span>
                              <div className="flex items-center gap-1 ml-auto">
                                <div className={cn('h-2 w-2 rounded-full', priorityConfig.dot)} />
                                <span className="text-[10px] text-muted-foreground">{priorityConfig.label}</span>
                              </div>
                            </div>
                            {s.current && (
                              <p className="text-[11px] text-muted-foreground line-through mb-1 bg-muted/50 rounded px-2 py-1">{s.current}</p>
                            )}
                            <p className="text-xs text-foreground leading-relaxed mb-1.5">{s.recommended}</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1">
                              <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5 text-gold-500" />
                              {s.reason}
                            </p>
                            {s.keywords && s.keywords.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {s.keywords.map(kw => (
                                  <span key={kw} className="rounded-full bg-gold-100 dark:bg-gold-900/30 px-2 py-0.5 text-[10px] text-gold-700 dark:text-gold-400">+{kw}</span>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Summary Rewrite */}
                  <div className="rounded-xl border border-gold-500/20 bg-gold-500/5 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                        AI-Optimized Summary
                      </p>
                      <Button variant="ghost" size="xs" leftIcon={copiedSummary ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} onClick={handleCopySummary}>
                        {copiedSummary ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed italic">{result.summaryRewrite}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            {step === 'input' && (
              <Button
                variant="primary"
                size="sm"
                loading={isAnalyzing}
                leftIcon={!isAnalyzing ? <Sparkles className="h-3.5 w-3.5" /> : undefined}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? 'Analyzing Resume...' : 'Analyze & Optimize'}
              </Button>
            )}
            {step === 'results' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FileText className="h-3.5 w-3.5" />}
                onClick={() => { toast.success('Optimization checklist saved!'); onClose() }}
              >
                Save Checklist
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ResumeOptimizerModal
