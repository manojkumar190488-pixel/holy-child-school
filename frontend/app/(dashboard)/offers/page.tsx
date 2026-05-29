'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy, TrendingUp, FileText, CheckCircle2, XCircle, Clock,
  Sparkles, Scale, ArrowRight, Building2, DollarSign, AlertCircle,
  ChevronDown, ChevronUp, Copy, ExternalLink, Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTIVE_OFFER = {
  id: '1',
  company: 'Gates Foundation India',
  role: 'Senior Advisor, Digital Health Strategy',
  type: 'Foundation',
  deadline: 'June 5, 2026',
  daysLeft: 13,
  ctc: 85,
  base: 68,
  variable: 12,
  benefits: 8,
  esop: 0,
  location: 'New Delhi, India',
  matchScore: 90,
  status: 'evaluating',
  aiSuggestion: '₹92L',
  aiReason: 'Market median for Senior Advisor roles at foundations of similar scale is ₹88–96L. Your 15+ years in digital health and WHO India interview pipeline strengthens your leverage.',
  highlights: [
    'Global foundation with €500M India portfolio',
    'Direct access to Govt of India ministries',
    'Bill & Melinda Gates Family Office backing',
    'Flexible remote work policy',
  ],
}

const BENCHMARKS = [
  { label: 'P25 — Entry Director', value: 55, color: 'bg-slate-400' },
  { label: 'P50 — Market Median', value: 78, color: 'bg-blue-500' },
  { label: 'Your Offer', value: 85, color: 'bg-gold-500' },
  { label: 'P75 — Top Quartile', value: 105, color: 'bg-emerald-500' },
  { label: 'P90 — Elite Band', value: 140, color: 'bg-purple-500' },
]

const PAST_OFFERS = [
  {
    company: 'USAID India Mission',
    role: 'Chief Technology Advisor – Governance',
    ctc: 72,
    outcome: 'declined',
    reason: 'PEPFAR experience required — misaligned with profile',
    date: 'April 2026',
  },
]

const NEGOTIATION_TEMPLATES = [
  {
    label: 'Counter-Offer Email',
    subject: 'Re: Offer — Senior Advisor, Digital Health Strategy',
    body: `Dear [Hiring Manager],

Thank you sincerely for the offer for the Senior Advisor, Digital Health Strategy role. I am genuinely excited about the opportunity to contribute to Gates Foundation India's mission.

After careful consideration and benchmarking against the current market, I would like to respectfully propose a CTC of ₹92L, reflecting my 15+ years of domain experience, active pipeline with WHO India, and the unique value I bring to your digital health programmes.

I remain highly enthusiastic about joining the team and am confident we can find a mutually rewarding arrangement.

Warm regards,
Manoj Kumar`,
  },
  {
    label: 'Benefits Negotiation',
    subject: 'Re: Offer — Additional Benefits Discussion',
    body: `Dear [Hiring Manager],

Thank you for the offer. While I am aligned on the base compensation, I'd like to explore whether the following could be accommodated:

1. Remote flexibility — 3 days WFH per week
2. Learning & development budget — ₹3L annually for executive programmes
3. International travel allocation for WHO/World Bank coordination
4. ESOP/retention bonus after 24 months

These would greatly support my effectiveness in the role.

Best,
Manoj Kumar`,
  },
  {
    label: 'Deadline Extension Request',
    subject: 'Request for Brief Extension — Decision Deadline',
    body: `Dear [Hiring Manager],

I am very enthusiastic about the Senior Advisor opportunity and am close to a decision. I have a competing process at WHO India reaching its final stage in the next 5–7 days.

Could you kindly extend my decision window to June 12, 2026? This would allow me to give your offer the full consideration it deserves and make a fully informed commitment.

Thank you for your understanding.

Best,
Manoj Kumar`,
  },
]

const COMPARISON = [
  { field: 'Organisation', gates: 'Gates Foundation India', undp: 'UNDP India (Expected)' },
  { field: 'Role', gates: 'Sr Advisor, Digital Health', undp: 'Country Programme Specialist' },
  { field: 'CTC', gates: '₹85L', undp: '₹78–88L (est.)' },
  { field: 'Base Salary', gates: '₹68L', undp: '₹70L (est.)' },
  { field: 'Location', gates: 'New Delhi', undp: 'New Delhi' },
  { field: 'Contract Type', gates: 'Permanent', undp: 'Fixed-term (3 yr)' },
  { field: 'Remote Policy', gates: 'Hybrid 3+2', undp: 'On-site primary' },
  { field: 'Travel', gates: '20% international', undp: '40% international' },
  { field: 'Brand Equity', gates: 'Global Foundation', undp: 'UN Agency' },
  { field: 'Career Upside', gates: 'Director track (2 yr)', undp: 'P5/D1 track (3–4 yr)' },
]

export default function OffersPage() {
  const [activeTemplate, setActiveTemplate] = useState(0)
  const [copiedTemplate, setCopiedTemplate] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const copyTemplate = () => {
    navigator.clipboard.writeText(NEGOTIATION_TEMPLATES[activeTemplate].body)
    setCopiedTemplate(true)
    setTimeout(() => setCopiedTemplate(false), 2000)
  }

  const maxBenchmark = 160

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Offers & Negotiations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-powered offer analysis and negotiation support</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gold-500/20 bg-gold-500/10 px-4 py-2">
          <Trophy className="h-4 w-4 text-gold-500" />
          <span className="text-sm font-semibold text-gold-600 dark:text-gold-400">1 Active Offer</span>
        </div>
      </div>

      {/* Active Offer Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border-2 border-gold-500/30 bg-gradient-to-br from-gold-500/5 to-transparent p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{ACTIVE_OFFER.company}</h2>
                <span className="rounded-full bg-gold-500/10 px-2 py-0.5 text-[10px] font-bold text-gold-600 dark:text-gold-400 border border-gold-500/20">ACTIVE OFFER</span>
              </div>
              <p className="text-sm text-muted-foreground">{ACTIVE_OFFER.role}</p>
              <p className="text-xs text-muted-foreground">{ACTIVE_OFFER.location}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">₹{ACTIVE_OFFER.ctc}L</div>
            <div className="text-xs text-muted-foreground">Total CTC</div>
            <div className={cn('mt-1 text-xs font-semibold', ACTIVE_OFFER.daysLeft <= 7 ? 'text-red-500' : 'text-amber-500')}>
              {ACTIVE_OFFER.daysLeft} days left — {ACTIVE_OFFER.deadline}
            </div>
          </div>
        </div>

        {/* CTC Breakdown */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Base Salary', value: `₹${ACTIVE_OFFER.base}L`, color: 'border-blue-500/20 bg-blue-500/5' },
            { label: 'Variable (15%)', value: `₹${ACTIVE_OFFER.variable}L`, color: 'border-purple-500/20 bg-purple-500/5' },
            { label: 'Benefits', value: `₹${ACTIVE_OFFER.benefits}L`, color: 'border-emerald-500/20 bg-emerald-500/5' },
            { label: 'Match Score', value: `${ACTIVE_OFFER.matchScore}%`, color: 'border-gold-500/20 bg-gold-500/5' },
          ].map((item) => (
            <div key={item.label} className={cn('rounded-lg border p-3', item.color)}>
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="text-base font-bold text-foreground mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-muted-foreground mb-2">OFFER HIGHLIGHTS</div>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVE_OFFER.highlights.map((h) => (
              <div key={h} className="flex items-center gap-2 text-xs text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                {h}
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestion */}
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">AI Negotiation Insight</span>
          </div>
          <p className="text-sm text-foreground font-medium">Suggested counter-offer: <span className="text-gold-500 font-bold">{ACTIVE_OFFER.aiSuggestion} CTC</span></p>
          <p className="text-xs text-muted-foreground mt-1">{ACTIVE_OFFER.aiReason}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors">
            <CheckCircle2 className="h-4 w-4" />
            Accept Offer
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors">
            <Scale className="h-4 w-4" />
            Negotiate
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
            <Clock className="h-4 w-4" />
            Request Extension
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-red-500/20 px-5 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors">
            <XCircle className="h-4 w-4" />
            Decline
          </button>
        </div>
      </motion.div>

      {/* Salary Benchmarking + Negotiation Scripts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Salary Benchmarking */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Salary Benchmarking</h3>
              <p className="text-xs text-muted-foreground">VP/Director level · Development sector · India</p>
            </div>
          </div>
          <div className="space-y-3">
            {BENCHMARKS.map((b) => (
              <div key={b.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-xs font-medium', b.value === ACTIVE_OFFER.ctc ? 'text-gold-500 font-bold' : 'text-muted-foreground')}>{b.label}</span>
                  <span className={cn('text-xs font-bold', b.value === ACTIVE_OFFER.ctc ? 'text-gold-500' : 'text-foreground')}>₹{b.value}L</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.value / maxBenchmark) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={cn('h-full rounded-full', b.color)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-gold-500/10 border border-gold-500/20 px-3 py-2">
            <p className="text-xs text-gold-600 dark:text-gold-400 font-medium">
              Your offer of ₹85L sits above market median (₹78L) but below P75 (₹105L). Strong negotiation position.
            </p>
          </div>
        </motion.div>

        {/* Negotiation Scripts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-foreground">AI Negotiation Scripts</h3>
          </div>
          <div className="flex gap-2 mb-3">
            {NEGOTIATION_TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => setActiveTemplate(i)}
                className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap', activeTemplate === i ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20' : 'text-muted-foreground hover:bg-muted border border-transparent')}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-foreground font-mono leading-relaxed max-h-48 overflow-y-auto scrollbar-thin whitespace-pre-wrap">
            {NEGOTIATION_TEMPLATES[activeTemplate].body}
          </div>
          <button
            onClick={copyTemplate}
            className="mt-3 flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            {copiedTemplate ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedTemplate ? 'Copied!' : 'Copy to clipboard'}
          </button>
        </motion.div>
      </div>

      {/* Offer Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
              <Scale className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground text-left">Offer Comparison</h3>
              <p className="text-xs text-muted-foreground">Gates Foundation vs Expected UNDP Offer</p>
            </div>
          </div>
          {showComparison ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {showComparison && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground pb-2 w-40">Factor</th>
                    <th className="text-left text-xs font-semibold text-gold-500 pb-2">Gates Foundation</th>
                    <th className="text-left text-xs font-semibold text-blue-500 pb-2">UNDP India (est.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {COMPARISON.map((row) => (
                    <tr key={row.field}>
                      <td className="py-2 text-xs text-muted-foreground font-medium">{row.field}</td>
                      <td className="py-2 text-xs text-foreground">{row.gates}</td>
                      <td className="py-2 text-xs text-foreground">{row.undp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                AI Recommendation: Gates Foundation offer is stronger on permanency, flexibility, and brand equity. UNDP offers better international travel exposure and UN career track. Negotiate Gates to ₹92L before deciding.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Past Offers */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <h3 className="text-sm font-bold text-foreground mb-4">Past Offers</h3>
        <div className="space-y-3">
          {PAST_OFFERS.map((offer, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{offer.role}</div>
                  <div className="text-xs text-muted-foreground">{offer.company} · {offer.date}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 italic">{offer.reason}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">₹{offer.ctc}L</div>
                <span className="rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">DECLINED</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
