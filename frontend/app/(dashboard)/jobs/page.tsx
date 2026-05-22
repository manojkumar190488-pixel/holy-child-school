'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, SlidersHorizontal, ArrowUpDown, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchBar } from '@/components/ui/SearchBar'
import { Button } from '@/components/ui/Button'
import { JobCard } from '@/components/jobs/JobCard'
import { JobFilters } from '@/components/jobs/JobFilters'
import { EmptyState } from '@/components/ui/EmptyState'
import { useJobs, useFilters, useHideJob, useBookmarkJob } from '@/hooks/useJobs'
import { createMockJob } from '@/lib/api'
import type { SortOption, ViewMode, Job } from '@/types'
import { toast } from 'sonner'

// Mock data for demo
const MOCK_JOBS: Job[] = [
  createMockJob({ id: 'j1', matchScore: { overall: 94, breakdown: { skills: 95, experience: 92, location: 90, seniority: 96, industry: 93, compensation: 90 }, matchedSkills: ['Strategy', 'Leadership', 'M&A'], missingSkills: ['Salesforce'], reasoning: 'Excellent match', confidence: 0.95 } }),
  createMockJob({ id: 'j2', title: 'VP Strategy & Operations', company: { name: 'Boston Consulting Group' }, matchScore: { overall: 89, breakdown: { skills: 88, experience: 90, location: 85, seniority: 92, industry: 88, compensation: 85 }, matchedSkills: ['Strategy', 'Operations', 'Leadership'], missingSkills: ['Python'], reasoning: 'Strong match', confidence: 0.91 } }),
  createMockJob({ id: 'j3', title: 'Director of Corporate Development', company: { name: 'Bain & Company' }, matchScore: { overall: 91, breakdown: { skills: 90, experience: 92, location: 88, seniority: 93, industry: 91, compensation: 88 }, matchedSkills: ['Strategy', 'M&A', 'Due Diligence'], missingSkills: [], reasoning: 'Very strong match', confidence: 0.93 } }),
  createMockJob({ id: 'j4', title: 'Senior Manager, Transformation', company: { name: 'Deloitte' }, remoteType: 'remote', matchScore: { overall: 82, breakdown: { skills: 80, experience: 84, location: 80, seniority: 84, industry: 82, compensation: 80 }, matchedSkills: ['Change Management', 'Consulting'], missingSkills: ['Agile'], reasoning: 'Good fit', confidence: 0.87 } }),
  createMockJob({ id: 'j5', title: 'Head of Finance Strategy', company: { name: 'Goldman Sachs' }, matchScore: { overall: 76, breakdown: { skills: 74, experience: 78, location: 75, seniority: 78, industry: 76, compensation: 75 }, matchedSkills: ['Financial Modeling', 'Strategy'], missingSkills: ['Bloomberg', 'Derivatives'], reasoning: 'Partial match on finance skills', confidence: 0.82 } }),
  createMockJob({ id: 'j6', title: 'Principal Consultant, Digital', company: { name: 'Accenture' }, remoteType: 'hybrid', matchScore: { overall: 85, breakdown: { skills: 83, experience: 87, location: 82, seniority: 87, industry: 85, compensation: 82 }, matchedSkills: ['Consulting', 'Digital Transformation', 'Leadership'], missingSkills: ['Cloud Architecture'], reasoning: 'Strong consulting background', confidence: 0.89 } }),
  createMockJob({ id: 'j7', title: 'Associate Partner, Strategy', company: { name: 'Oliver Wyman' }, matchScore: { overall: 88, breakdown: { skills: 87, experience: 89, location: 86, seniority: 90, industry: 88, compensation: 86 }, matchedSkills: ['Strategy', 'Financial Services', 'Leadership'], missingSkills: [], reasoning: 'Excellent strategy consulting fit', confidence: 0.92 } }),
  createMockJob({ id: 'j8', title: 'Chief of Staff', company: { name: 'Sequoia Capital' }, matchScore: { overall: 72, breakdown: { skills: 70, experience: 74, location: 70, seniority: 74, industry: 72, compensation: 70 }, matchedSkills: ['Strategy', 'Leadership'], missingSkills: ['VC', 'Portfolio Management', 'Venture Scouting'], reasoning: 'Partial match, missing VC experience', confidence: 0.78 } }),
]

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'match_score', label: 'Match Score' },
  { value: 'posted_date', label: 'Posted Date' },
  { value: 'relevance', label: 'Relevance' },
  { value: 'company', label: 'Company' },
]

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('match_score')
  const [showFilters, setShowFilters] = useState(true)
  const [page, setPage] = useState(1)

  const { filters, updateFilter, resetFilters, activeFilterCount } = useFilters()

  const hideJob = useHideJob()
  const { bookmark } = useBookmarkJob()

  const handleHide = useCallback((job: Job) => {
    toast.success(`"${job.title}" hidden`)
    hideJob.mutate(job.id)
  }, [hideJob])

  const handleBookmark = useCallback((job: Job) => {
    toast.success(job.isBookmarked ? 'Bookmark removed' : 'Job bookmarked!')
    bookmark({ jobId: job.id })
  }, [bookmark])

  const handleApply = useCallback((job: Job) => {
    if (job.sourceUrl) window.open(job.sourceUrl, '_blank')
  }, [])

  // Sort mock jobs
  const sortedJobs = [...MOCK_JOBS].sort((a, b) => {
    if (sortBy === 'match_score') return b.matchScore.overall - a.matchScore.overall
    if (sortBy === 'posted_date') return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    if (sortBy === 'company') return a.company.name.localeCompare(b.company.name)
    return b.matchScore.overall - a.matchScore.overall
  })

  const filteredJobs = sortedJobs.filter((job) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.name.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q))
      )
    }
    if (filters.minMatchScore && job.matchScore.overall < filters.minMatchScore) return false
    if (filters.remoteTypes?.length && !filters.remoteTypes.includes(job.remoteType)) return false
    if (filters.sources?.length && !filters.sources.includes(job.source)) return false
    return true
  })

  const PAGE_SIZE = 6
  const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE)
  const paginatedJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-5 animate-in">
      {/* Search + Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchBar
          className="flex-1"
          placeholder="AI search: try 'senior consultant MBB remote' or 'VP strategy fintech'"
          onSearch={setSearchQuery}
          defaultValue={searchQuery}
        />
        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none cursor-pointer rounded-lg border border-border bg-card pl-3 pr-8 py-2 text-sm font-medium text-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* View Toggle */}
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'grid'
                  ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'list'
                  ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Filter toggle on mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((p) => !p)}
            leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
            className="md:hidden"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-900">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          Showing{' '}
          <span className="font-semibold text-foreground">
            {paginatedJobs.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-foreground">{filteredJobs.length}</span>{' '}
          opportunities
          {searchQuery && (
            <span>
              {' '}for &ldquo;<span className="text-gold-600 dark:text-gold-400">{searchQuery}</span>&rdquo;
            </span>
          )}
        </p>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-gold-600 dark:text-gold-400 hover:underline"
          >
            Clear {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Main Layout: Filters + Jobs */}
      <div className="flex gap-5">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {(showFilters || window?.innerWidth >= 768) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 280 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block flex-shrink-0"
              style={{ width: 280 }}
            >
              <div className="sticky top-6">
                <JobFilters
                  filters={filters}
                  onFiltersChange={(f) => {
                    Object.entries(f).forEach(([k, v]) => {
                      updateFilter(k as keyof typeof filters, v as never)
                    })
                    setPage(1)
                  }}
                  onReset={() => { resetFilters(); setPage(1) }}
                  activeFilterCount={activeFilterCount}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jobs Grid/List */}
        <div className="flex-1 min-w-0">
          {paginatedJobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-7 w-7" />}
              title="No opportunities found"
              subtitle="Try adjusting your search or filters to discover more matches."
              action={{
                label: 'Clear Filters',
                onClick: () => { resetFilters(); setSearchQuery('') },
              }}
              secondaryAction={{
                label: 'Browse All Jobs',
                onClick: () => setSearchQuery(''),
              }}
            />
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${viewMode}-${page}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                      : 'flex flex-col gap-2'
                  )}
                >
                  {paginatedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      variant={viewMode === 'list' ? 'list' : 'card'}
                      onBookmark={handleBookmark}
                      onHide={handleHide}
                      onApply={handleApply}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                          page === i + 1
                            ? 'bg-gold-500 text-navy-900'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
