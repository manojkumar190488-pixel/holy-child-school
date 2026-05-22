'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Copy,
  Download,
  Sparkles,
  RotateCcw,
  Check,
  ChevronDown,
  Edit3,
  Loader2,
} from 'lucide-react'
import { cn, copyToClipboard, downloadAsFile } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { COVER_LETTER_TONES } from '@/lib/constants'
import type { Job, CoverLetter } from '@/types'
import { aiApi } from '@/lib/api'

interface CoverLetterModalProps {
  isOpen: boolean
  onClose: () => void
  job: Job
}

export function CoverLetterModal({ isOpen, onClose, job }: CoverLetterModalProps) {
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [selectedTone, setSelectedTone] = useState<string>('professional')
  const [customInstructions, setCustomInstructions] = useState('')
  const [copied, setCopied] = useState(false)
  const [showToneDropdown, setShowToneDropdown] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await aiApi.generateCoverLetter({
        jobId: job.id,
        tone: selectedTone,
        customInstructions: customInstructions || undefined,
      })
      setCoverLetter(response.data)
      setEditedContent(response.data.content)
      setIsEditing(false)
    } catch {
      // In a real app, show toast error
      const mockLetter: CoverLetter = {
        id: 'cl_1',
        jobId: job.id,
        content: generateMockCoverLetter(job, selectedTone),
        version: 1,
        generatedAt: new Date().toISOString(),
        tone: selectedTone as CoverLetter['tone'],
        wordCount: 320,
      }
      setCoverLetter(mockLetter)
      setEditedContent(mockLetter.content)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    const content = isEditing ? editedContent : (coverLetter?.content || '')
    await copyToClipboard(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const content = isEditing ? editedContent : (coverLetter?.content || '')
    downloadAsFile(
      content,
      `cover-letter-${job.company.name.replace(/\s+/g, '-').toLowerCase()}.txt`
    )
  }

  const handleSaveEdit = () => {
    if (coverLetter) {
      setCoverLetter({ ...coverLetter, content: editedContent })
    }
    setIsEditing(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-100 dark:bg-gold-900/30">
                <Sparkles className="h-4 w-4 text-gold-600 dark:text-gold-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">AI Cover Letter</h2>
                <p className="text-xs text-muted-foreground">
                  {job.title} at {job.company.name}
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

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-160px)]">
            {!coverLetter ? (
              /* Generation Controls */
              <div className="space-y-5">
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <p className="text-sm font-semibold text-foreground mb-1">Generating for:</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{job.title}</span> at{' '}
                    <span className="font-medium text-foreground">{job.company.name}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.matchScore.matchedSkills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tone Selector */}
                <div>
                  <label className="label">Tone & Style</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowToneDropdown((p) => !p)}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground hover:border-gold-500/50 transition-colors"
                    >
                      <span className="capitalize">{selectedTone}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <AnimatePresence>
                      {showToneDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-border bg-card shadow-lg"
                        >
                          {COVER_LETTER_TONES.map((tone) => (
                            <button
                              key={tone.value}
                              onClick={() => {
                                setSelectedTone(tone.value)
                                setShowToneDropdown(false)
                              }}
                              className={cn(
                                'flex w-full items-center justify-between px-3.5 py-2.5 text-sm transition-colors hover:bg-muted first:rounded-t-lg last:rounded-b-lg',
                                selectedTone === tone.value
                                  ? 'text-gold-600 dark:text-gold-400 font-medium'
                                  : 'text-foreground'
                              )}
                            >
                              {tone.label}
                              {selectedTone === tone.value && <Check className="h-4 w-4" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Custom Instructions */}
                <div>
                  <label className="label">Custom Instructions (optional)</label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g., Emphasize my M&A experience, mention my MBA from INSEAD, keep under 300 words..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>
              </div>
            ) : (
              /* Generated Letter */
              <div className="space-y-4">
                {/* Version info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Version {coverLetter.version} · {coverLetter.wordCount} words · {coverLetter.tone}</span>
                  <button
                    onClick={() => {
                      setCoverLetter(null)
                      setIsEditing(false)
                    }}
                    className="flex items-center gap-1 text-gold-600 dark:text-gold-400 hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Regenerate
                  </button>
                </div>

                {/* Letter Content */}
                {isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="input h-80 resize-none font-mono text-xs leading-relaxed"
                  />
                ) : (
                  <div className="rounded-xl border border-border bg-muted/30 p-5">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                      {coverLetter.content}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <div className="flex items-center gap-2">
              {coverLetter && (
                <>
                  {isEditing ? (
                    <>
                      <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                        Save Changes
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                    >
                      Edit
                    </Button>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {coverLetter && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    leftIcon={
                      copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />
                    }
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                  >
                    Download
                  </Button>
                </>
              )}
              {!coverLetter && (
                <Button
                  variant="primary"
                  size="sm"
                  loading={isGenerating}
                  onClick={handleGenerate}
                  leftIcon={!isGenerating ? <Sparkles className="h-3.5 w-3.5" /> : undefined}
                >
                  {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function generateMockCoverLetter(job: Job, tone: string): string {
  const salutation = tone === 'formal' ? 'Dear Hiring Manager,' : 'Dear Hiring Team,'
  return `${salutation}

I am writing to express my strong interest in the ${job.title} position at ${job.company.name}. With my extensive background in ${job.matchScore.matchedSkills.slice(0, 2).join(' and ')}, I am confident that I would be a valuable addition to your team.

Throughout my career, I have demonstrated a consistent track record of delivering measurable results in high-stakes consulting engagements. My experience aligns closely with the requirements outlined in your job description, particularly in the areas of strategic analysis, stakeholder management, and driving organizational transformation.

At my previous roles, I have successfully:
• Led cross-functional teams of 8–15 professionals on complex transformation initiatives
• Developed and implemented strategic frameworks that delivered 30%+ efficiency improvements
• Built and maintained C-suite relationships across Fortune 500 and PE-backed companies

I am particularly drawn to ${job.company.name} because of its reputation for intellectual rigor and impact-driven work. The opportunity to contribute to your practice while continuing to grow as a senior leader is exactly the challenge I am seeking at this stage of my career.

I would welcome the opportunity to discuss how my experience and skills can contribute to your team's success. Thank you for considering my application.

${tone === 'formal' ? 'Yours sincerely,' : 'Best regards,'}

[Your Name]
[Your Contact Information]`
}

export default CoverLetterModal
