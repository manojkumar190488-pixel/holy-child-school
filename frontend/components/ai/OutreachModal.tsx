'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Sparkles, RotateCcw, Check, MessageSquare, Mail, Phone } from 'lucide-react'
import { cn, copyToClipboard } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { OUTREACH_PLATFORMS } from '@/lib/constants'
import type { Job, OutreachMessage, RecruiterInfo } from '@/types'
import { aiApi } from '@/lib/api'

interface OutreachModalProps {
  isOpen: boolean
  onClose: () => void
  job: Job
  recruiter?: RecruiterInfo
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  linkedin: <MessageSquare className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  whatsapp: <Phone className="h-4 w-4" />,
}

export function OutreachModal({ isOpen, onClose, job, recruiter }: OutreachModalProps) {
  const [message, setMessage] = useState<OutreachMessage | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('linkedin')
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')

  const platform = OUTREACH_PLATFORMS.find((p) => p.value === selectedPlatform)
  const currentContent = isEditing ? editedContent : message?.content || ''
  const charCount = currentContent.length
  const charLimit = platform?.maxChars || 300
  const isOverLimit = charCount > charLimit

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await aiApi.generateOutreach({
        jobId: job.id,
        platform: selectedPlatform,
        tone: 'professional',
      })
      setMessage(response.data)
      setEditedContent(response.data.content)
      setIsEditing(false)
    } catch {
      const mockMsg: OutreachMessage = {
        id: 'om_1',
        jobId: job.id,
        content: generateMockOutreach(job, recruiter, selectedPlatform),
        platform: selectedPlatform as OutreachMessage['platform'],
        tone: 'professional',
        generatedAt: new Date().toISOString(),
        characterCount: 0,
      }
      mockMsg.characterCount = mockMsg.content.length
      setMessage(mockMsg)
      setEditedContent(mockMsg.content)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    await copyToClipboard(currentContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">AI Outreach Message</h2>
                <p className="text-xs text-muted-foreground">
                  {recruiter ? `To ${recruiter.name}` : `For ${job.title}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Recruiter info if available */}
          {recruiter && (
            <div className="mx-5 mt-4 rounded-xl border border-border bg-muted/40 p-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {recruiter.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{recruiter.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {recruiter.title} {recruiter.company && `at ${recruiter.company}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Platform Selector */}
          <div className="px-5 pt-4">
            <label className="label">Platform</label>
            <div className="flex gap-2">
              {OUTREACH_PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    setSelectedPlatform(p.value)
                    setMessage(null)
                  }}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200',
                    selectedPlatform === p.value
                      ? 'border-gold-500 bg-gold-50 text-gold-700 dark:bg-gold-900/20 dark:text-gold-400 dark:border-gold-500'
                      : 'border-border text-muted-foreground hover:border-gold-500/50 hover:text-foreground'
                  )}
                >
                  {PLATFORM_ICONS[p.value]}
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {!message ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-gold-500 mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">
                  Generate {platform?.label}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  AI will craft a personalized, concise outreach message optimized for {platform?.label}
                  {platform?.maxChars && ` (max ${platform.maxChars} characters)`}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  loading={isGenerating}
                  onClick={handleGenerate}
                  leftIcon={!isGenerating ? <Sparkles className="h-3.5 w-3.5" /> : undefined}
                >
                  {isGenerating ? 'Generating...' : 'Generate Message'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Message */}
                {isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={6}
                    className={cn(
                      'input resize-none font-sans text-sm leading-relaxed',
                      isOverLimit && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    )}
                  />
                ) : (
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                )}

                {/* Character count */}
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={cn(
                      'font-medium',
                      isOverLimit ? 'text-red-500' : 'text-muted-foreground'
                    )}
                  >
                    {charCount}/{charLimit} characters
                    {isOverLimit && ' (over limit)'}
                  </span>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-gold-600 dark:text-gold-400 hover:underline"
                      >
                        Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setMessage({ ...message, content: editedContent })
                            setIsEditing(false)
                          }}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="text-muted-foreground hover:underline"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setMessage(null)}
                      className="flex items-center gap-1 text-muted-foreground hover:underline"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Redo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            {message && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopy}
                leftIcon={
                  copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />
                }
              >
                {copied ? 'Copied!' : 'Copy Message'}
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function generateMockOutreach(job: Job, recruiter?: RecruiterInfo, platform?: string): string {
  const name = recruiter?.name ? `Hi ${recruiter.name.split(' ')[0]},` : 'Hi,'
  if (platform === 'linkedin') {
    return `${name}

I came across the ${job.title} role at ${job.company.name} and wanted to reach out. My background in ${job.matchScore.matchedSkills[0]} and ${job.matchScore.matchedSkills[1]} aligns closely with what you're looking for.

I'd love to connect and learn more about the opportunity. Would you be open to a brief conversation this week?

Best,
[Your Name]`
  }
  if (platform === 'email') {
    return `Subject: Interest in ${job.title} Role – ${job.company.name}

${name}

I am reaching out regarding the ${job.title} position at ${job.company.name}. With ${job.matchScore.matchedSkills.slice(0, 3).join(', ')} in my toolkit, I believe I can add significant value to your team.

I would appreciate the opportunity to discuss how my experience aligns with your needs. Are you available for a 15-minute call this week?

Best regards,
[Your Name]`
  }
  return `Hi! Interested in the ${job.title} role at ${job.company.name}. My background in ${job.matchScore.matchedSkills[0]} seems like a strong fit. Available to connect?`
}

export default OutreachModal
