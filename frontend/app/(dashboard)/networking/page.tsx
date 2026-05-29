'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Network,
  MessageSquare,
  Send,
  Copy,
  Edit3,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STAT_CARDS = [
  { label: 'Connections Sent', value: '156', icon: Send, color: 'text-blue-500', bg: 'bg-blue-500/10', change: '+12 this week' },
  { label: 'Replies Received', value: '43', sub: '28% reply rate', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10', change: 'Above avg' },
  { label: 'Meetings Arranged', value: '12', icon: User, color: 'text-gold-500', bg: 'bg-gold-500/10', change: '+3 this month' },
  { label: 'AI-Drafted Messages', value: '89', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10', change: '+22 this week' },
]

const TEMPLATES = [
  {
    category: 'LinkedIn Connection Request',
    categoryColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    preview: 'Hi [Name], Your work in digital governance and e-government transformation caught my attention. As a senior consulting professional with 15+ years in public sector digital initiatives, I\'d value connecting with you to exchange insights on the evolving landscape.',
    useCount: 34,
  },
  {
    category: 'Recruiter Cold Outreach',
    categoryColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    preview: 'Dear [Recruiter], I noticed you\'re hiring for a VP/Director-level digital transformation role in the government consulting space. With 15+ years leading large-scale e-governance and public health IT programmes across multilaterals and Big 4 firms, I believe I\'d be a strong fit.',
    useCount: 28,
  },
  {
    category: 'Referral Request',
    categoryColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    preview: 'Hi [Name], I hope this message finds you well. I\'ve been following the exciting work happening at [Organisation] in the digital health/governance space. Given our shared background in [domain], I was hoping you might be able to refer me for the [Role] opening or connect me with the relevant hiring team.',
    useCount: 15,
  },
  {
    category: 'Interview Thank You',
    categoryColor: 'bg-gold-500/10 text-gold-600 dark:text-gold-400',
    preview: 'Dear [Hiring Manager], Thank you for the insightful conversation about the [Role] opportunity at [Organisation]. I was particularly energised by our discussion on [specific topic]. It reinforced my enthusiasm for contributing to your mission of [goal]. I look forward to the next steps.',
    useCount: 8,
  },
  {
    category: 'Follow-up After Application',
    categoryColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    preview: 'Hi [Name], I wanted to follow up on my application for the [Role] position submitted on [Date]. Having led similar transformation programmes for [comparable org], I\'m confident in my ability to deliver immediate impact. Happy to share specific examples if helpful.',
    useCount: 12,
  },
]

type OutreachStatus = 'Replied' | 'Opened' | 'Pending'

const OUTREACH_ACTIVITY: {
  name: string
  company: string
  role: string
  type: string
  date: string
  status: OutreachStatus
}[] = [
  { name: 'Priya Sharma', company: 'Deloitte', role: 'Director, Gov Practice', type: 'LinkedIn Connection', date: 'May 27', status: 'Replied' },
  { name: 'Anjali Verma', company: 'UNDP India', role: 'Talent Acquisition Lead', type: 'Recruiter Outreach', date: 'May 26', status: 'Opened' },
  { name: 'Ravi Nair', company: 'Asian Dev Bank', role: 'Senior HRO', type: 'Referral Request', date: 'May 25', status: 'Replied' },
  { name: 'David Kimani', company: 'GIZ India', role: 'Programme Coordinator', type: 'LinkedIn Connection', date: 'May 24', status: 'Pending' },
  { name: 'Sonal Mehta', company: 'Spencer Stuart', role: 'Executive Search Partner', type: 'Recruiter Outreach', date: 'May 23', status: 'Replied' },
  { name: 'Vikram Sood', company: 'World Bank', role: 'Senior Talent Officer', type: 'Follow-up', date: 'May 22', status: 'Opened' },
  { name: 'Marie Dupont', company: 'WHO India', role: 'HR Manager', type: 'Recruiter Outreach', date: 'May 21', status: 'Pending' },
  { name: 'Rahul Kapoor', company: 'EY India', role: 'Partner, Gov Advisory', type: 'LinkedIn Connection', date: 'May 20', status: 'Replied' },
]

function StatusChip({ status }: { status: OutreachStatus }) {
  const cfg = {
    Replied: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    Opened: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    Pending: 'bg-muted text-muted-foreground',
  }[status]
  const Icon = status === 'Replied' ? CheckCircle2 : Clock
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold', cfg)}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  )
}

export default function NetworkingPage() {
  const [generateInput, setGenerateInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedMsg, setGeneratedMsg] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!generateInput.trim()) return
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 1800))
    setGeneratedMsg(
      `Subject: Exploring the ${generateInput} opportunity\n\nDear Hiring Team,\n\nI'm writing to express my strong interest in the ${generateInput} role. With 15+ years delivering digital transformation and e-governance programmes across the World Bank, UNDP, and Big 4 consulting environments, I offer a rare blend of technical depth, stakeholder management, and strategic leadership that directly aligns with your requirements.\n\nI'd welcome the opportunity to discuss how my experience in [specific domain] can accelerate your programme objectives.\n\nWarm regards,\nManoj Kumar`
    )
    setGenerating(false)
  }

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Networking Hub</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-powered executive outreach · Personalised at scale
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
          <Sparkles className="h-3.5 w-3.5" />
          AI Active
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className={cn('inline-flex rounded-lg p-2', card.bg)}>
                <Icon className={cn('h-4 w-4', card.color)} />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-foreground">{card.value}</p>
              <p className="text-xs font-medium text-foreground">{card.label}</p>
              {'sub' in card && card.sub && (
                <p className="text-[10px] text-gold-500 font-semibold">{card.sub}</p>
              )}
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowUp className="h-2.5 w-2.5" />
                {card.change}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* AI Message Generator */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-bold text-foreground">AI Message Generator</h3>
          <span className="ml-auto text-xs text-muted-foreground">Personalised for your profile</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder='e.g. "VP Digital Transformation at World Bank" or "Programme Director at UNDP"'
            value={generateInput}
            onChange={(e) => setGenerateInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !generateInput.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate
              </>
            )}
          </button>
        </div>
        {generatedMsg && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4"
          >
            <pre className="whitespace-pre-wrap text-xs text-foreground font-sans leading-relaxed">
              {generatedMsg}
            </pre>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => handleCopy(-1, generatedMsg)}
                className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
              >
                <Copy className="h-3 w-3" />
                {copiedIndex === -1 ? 'Copied!' : 'Copy'}
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors">
                <Edit3 className="h-3 w-3" />
                Edit
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-400 transition-colors">
                <Send className="h-3 w-3" />
                Use Template
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Message Templates */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-border bg-card"
      >
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold text-foreground">Message Templates</h3>
          <p className="text-xs text-muted-foreground">Pre-crafted and AI-refined for your profile</p>
        </div>
        <div className="divide-y divide-border">
          {TEMPLATES.map((tmpl, i) => (
            <div key={i} className="px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', tmpl.categoryColor)}>
                      {tmpl.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Used {tmpl.useCount} times</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{tmpl.preview}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(i, tmpl.preview)}
                    className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Copy template"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button className="flex items-center gap-1 rounded-lg bg-purple-500/10 px-2.5 py-1.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors">
                    <Sparkles className="h-3 w-3" />
                    Customise with AI
                  </button>
                </div>
              </div>
              {copiedIndex === i && (
                <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Copied to clipboard!</p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Outreach Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-border bg-card"
      >
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold text-foreground">Recent Outreach Activity</h3>
          <p className="text-xs text-muted-foreground">Your last 8 messages and their status</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Contact</th>
                <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Organisation</th>
                <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Message Type</th>
                <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Sent</th>
                <th className="px-3 py-3 text-left font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {OUTREACH_ACTIVITY.map((row, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-500/40 flex items-center justify-center text-[10px] font-bold text-gold-600 dark:text-gold-400">
                        {row.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{row.name}</p>
                        <p className="text-[10px] text-muted-foreground">{row.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium text-foreground">{row.company}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.type}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.date}</td>
                  <td className="px-3 py-3">
                    <StatusChip status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
