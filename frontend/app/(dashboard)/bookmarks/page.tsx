'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark,
  FolderOpen,
  Plus,
  Search,
  Tag,
  Trash2,
  Edit2,
  ExternalLink,
  StickyNote,
  FolderPlus,
} from 'lucide-react'
import { cn, formatDate, getInitials, stringToColor, formatRelativeDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { MatchScoreCircle } from '@/components/jobs/MatchScoreCircle'
import { SourceBadge } from '@/components/ui/Badge'
import { createMockJob } from '@/lib/api'
import { toast } from 'sonner'
import type { BookmarkFolder } from '@/types'

const MOCK_FOLDERS: BookmarkFolder[] = [
  { id: 'all', name: 'All Bookmarks', color: '#F59E0B', count: 9, createdAt: '' },
  { id: 'f1', name: 'Top Priorities', color: '#10B981', count: 3, createdAt: '' },
  { id: 'f2', name: 'Multilateral / UN', color: '#3B82F6', count: 3, createdAt: '' },
  { id: 'f3', name: 'To Research', color: '#8B5CF6', count: 3, createdAt: '' },
]

interface BookmarkItem {
  id: string
  jobId: string
  job: ReturnType<typeof createMockJob>
  folderId?: string
  notes?: string
  tags: string[]
  createdAt: string
}

const MOCK_BOOKMARKS: BookmarkItem[] = [
  {
    id: 'b1',
    jobId: 'j1',
    job: createMockJob({ id: 'j1', title: 'Senior Digital Transformation Advisor', company: { name: 'World Bank Group' }, matchScore: { overall: 96, breakdown: { skills: 96, experience: 95, location: 94, seniority: 97, industry: 96, compensation: 93 }, matchedSkills: ['Digital Transformation', 'E-Governance', 'PMU'], missingSkills: [], reasoning: '', confidence: 0.97 } }),
    folderId: 'f1',
    notes: 'Perfect profile match (96%). Research World Bank procurement process. Draft application by May 28.',
    tags: ['high-priority', 'World-Bank', 'apply-soon'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'b2',
    jobId: 'j2',
    job: createMockJob({ id: 'j2', title: 'PMU Director – Digital Health', company: { name: 'Asian Development Bank' }, matchScore: { overall: 95, breakdown: { skills: 95, experience: 94, location: 92, seniority: 96, industry: 95, compensation: 92 }, matchedSkills: ['PMU', 'Digital Health', 'Donor Coordination'], missingSkills: [], reasoning: '', confidence: 0.96 } }),
    folderId: 'f1',
    notes: 'Outstanding match for my PMU/TSU experience. Salary range excellent. Apply before June 1.',
    tags: ['high-priority', 'ADB', 'PMU', 'follow-up'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'b3',
    jobId: 'j3',
    job: createMockJob({ id: 'j3', title: 'Director, Health Information Systems', company: { name: 'UNDP India' }, matchScore: { overall: 93, breakdown: { skills: 93, experience: 92, location: 91, seniority: 94, industry: 93, compensation: 90 }, matchedSkills: ['Health Information Systems', 'Public Health IT', 'E-Governance'], missingSkills: ['DHIS2 Certification'], reasoning: '', confidence: 0.94 } }),
    folderId: 'f2',
    tags: ['UNDP', 'UN-system', 'health-IT'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'b4',
    jobId: 'j4',
    job: createMockJob({ id: 'j4', title: 'National IT Advisor – Health', company: { name: 'WHO India' }, matchScore: { overall: 91, breakdown: { skills: 90, experience: 92, location: 90, seniority: 92, industry: 91, compensation: 88 }, matchedSkills: ['Public Health IT', 'HIS', 'Digital Health Policy'], missingSkills: [], reasoning: '', confidence: 0.93 } }),
    folderId: 'f2',
    notes: 'WHO posting. Aligns well with NHP/NHM digital health work. Check WHO vacancy notice timeline.',
    tags: ['WHO', 'UN-system', 'health-IT'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'b5',
    jobId: 'j5',
    job: createMockJob({ id: 'j5', title: 'Senior Consultant, E-Governance', company: { name: 'Deloitte Government' }, matchScore: { overall: 89, breakdown: { skills: 88, experience: 90, location: 88, seniority: 91, industry: 89, compensation: 87 }, matchedSkills: ['E-Governance', 'Digital Transformation', 'Consulting'], missingSkills: ['Salesforce Gov Cloud'], reasoning: '', confidence: 0.91 } }),
    folderId: 'f2',
    tags: ['Deloitte', 'e-governance', 'Big4'],
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'b6',
    jobId: 'j6',
    job: createMockJob({ id: 'j6', title: 'Digital Transformation Lead', company: { name: 'GIZ India' }, matchScore: { overall: 88, breakdown: { skills: 87, experience: 89, location: 87, seniority: 90, industry: 88, compensation: 86 }, matchedSkills: ['Digital Transformation', 'Government Consulting', 'Project Management'], missingSkills: ['German Aid Modalities'], reasoning: '', confidence: 0.90 } }),
    folderId: 'f3',
    notes: 'GIZ bilateral aid context — research GIZ India digital portfolio before applying.',
    tags: ['GIZ', 'research', 'bilateral-aid'],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function BookmarksPage() {
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [bookmarks, setBookmarks] = useState(MOCK_BOOKMARKS)
  const [folders] = useState(MOCK_FOLDERS)

  const filteredBookmarks = bookmarks.filter((b) => {
    if (selectedFolder !== 'all' && b.folderId !== selectedFolder) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        b.job.title.toLowerCase().includes(q) ||
        b.job.company.name.toLowerCase().includes(q) ||
        b.notes?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleRemoveBookmark = (bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId))
    toast.success('Bookmark removed')
  }

  const handleSaveNote = (bookmarkId: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === bookmarkId ? { ...b, notes: noteText } : b))
    )
    setEditingNote(null)
    toast.success('Note saved')
  }

  return (
    <div className="animate-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">
            {bookmarks.length} Saved Opportunities
          </h2>
          <p className="text-sm text-muted-foreground">
            Organized across {folders.length - 1} folders
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<FolderPlus className="h-4 w-4" />}
          onClick={() => setShowNewFolder((p) => !p)}
        >
          New Folder
        </Button>
      </div>

      {/* New Folder Input */}
      <AnimatePresence>
        {showNewFolder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="input flex-1 max-w-xs"
              autoFocus
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (newFolderName.trim()) {
                  toast.success(`Folder "${newFolderName}" created`)
                  setNewFolderName('')
                  setShowNewFolder(false)
                }
              }}
            >
              Create
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowNewFolder(false)}>
              Cancel
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-5">
        {/* Folders Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="rounded-xl border border-border bg-card p-3 space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  selectedFolder === folder.id
                    ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                )}
              >
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: folder.color }}
                />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                <span className="text-xs font-semibold">{folder.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookmarks..."
              className="input pl-9"
            />
          </div>

          {filteredBookmarks.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="h-7 w-7" />}
              title="No bookmarks found"
              subtitle={
                searchQuery
                  ? 'No bookmarks match your search.'
                  : 'Bookmark jobs from the Jobs page to save them here.'
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredBookmarks.map((bookmark) => {
                const { job } = bookmark
                const initials = getInitials(job.company.name)
                const bgColor = stringToColor(job.company.name)
                const folder = folders.find((f) => f.id === bookmark.folderId)

                return (
                  <motion.div
                    key={bookmark.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-border bg-card p-5 transition-all hover:border-gold-500/20 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <div
                        className="h-11 w-11 flex-shrink-0 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: bgColor }}
                      >
                        {initials}
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="text-sm font-bold text-foreground">
                              {job.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {job.company.name} · {job.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <MatchScoreCircle score={job.matchScore.overall} size="sm" />
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <SourceBadge source={job.source} />
                          {folder && folder.id !== 'all' && (
                            <div className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              <FolderOpen className="h-3 w-3" />
                              {folder.name}
                            </div>
                          )}
                          {bookmark.tags.map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                              <Tag className="h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Notes */}
                        {editingNote === bookmark.id ? (
                          <div className="mt-3 space-y-2">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              rows={3}
                              className="input resize-none text-xs"
                              placeholder="Add a note..."
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                size="xs"
                                onClick={() => handleSaveNote(bookmark.id)}
                              >
                                Save Note
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setEditingNote(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : bookmark.notes ? (
                          <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2">
                            <StickyNote className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gold-500" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {bookmark.notes}
                            </p>
                          </div>
                        ) : null}

                        {/* Footer */}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Saved {formatRelativeDate(bookmark.createdAt)}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingNote(bookmark.id)
                                setNoteText(bookmark.notes || '')
                              }}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              title="Edit note"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <a
                              href={`/jobs/${job.id}`}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              title="View job"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                            <button
                              onClick={() => handleRemoveBookmark(bookmark.id)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                              title="Remove bookmark"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
