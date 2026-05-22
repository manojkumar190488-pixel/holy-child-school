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

// Mock data — reflects digital transformation, e-governance, public health IT, government consulting
const MOCK_JOBS: Job[] = [
  createMockJob({ id: 'j1', title: 'Senior Digital Transformation Advisor', company: { name: 'World Bank Group' }, matchScore: { overall: 96, breakdown: { skills: 96, experience: 95, location: 94, seniority: 97, industry: 96, compensation: 93 }, matchedSkills: ['Digital Transformation', 'E-Governance', 'PMU', 'Stakeholder Management'], missingSkills: [], reasoning: 'Perfect profile match for multilateral digital advisory', confidence: 0.97 } }),
  createMockJob({ id: 'j2', title: 'Director, Health Information Systems', company: { name: 'UNDP India' }, remoteType: 'hybrid', matchScore: { overall: 93, breakdown: { skills: 93, experience: 92, location: 91, seniority: 94, industry: 93, compensation: 90 }, matchedSkills: ['Health Information Systems', 'Public Health IT', 'E-Governance'], missingSkills: ['DHIS2 Certification'], reasoning: 'Excellent fit for UN health IT leadership', confidence: 0.94 } }),
  createMockJob({ id: 'j3', title: 'PMU Director – Digital Health', company: { name: 'Asian Development Bank' }, matchScore: { overall: 95, breakdown: { skills: 95, experience: 94, location: 92, seniority: 96, industry: 95, compensation: 92 }, matchedSkills: ['PMU', 'Digital Health', 'Donor Coordination', 'M&E'], missingSkills: [], reasoning: 'Outstanding match — 14+ yrs PMU/TSU experience aligns perfectly', confidence: 0.96 } }),
  createMockJob({ id: 'j4', title: 'Senior Consultant, E-Governance', company: { name: 'Deloitte Government' }, remoteType: 'hybrid', matchScore: { overall: 89, breakdown: { skills: 88, experience: 90, location: 88, seniority: 91, industry: 89, compensation: 87 }, matchedSkills: ['E-Governance', 'Digital Transformation', 'Government Consulting'], missingSkills: ['Salesforce Gov Cloud'], reasoning: 'Strong alignment on e-governance practice area', confidence: 0.91 } }),
  createMockJob({ id: 'j5', title: 'Practice Lead, Digital Public Infrastructure', company: { name: 'EY India' }, matchScore: { overall: 87, breakdown: { skills: 86, experience: 88, location: 86, seniority: 89, industry: 87, compensation: 85 }, matchedSkills: ['Digital Transformation', 'Public Infrastructure', 'Consulting', 'Leadership'], missingSkills: ['DPI Stack'], reasoning: 'Good match for emerging DPI advisory practice', confidence: 0.90 } }),
  createMockJob({ id: 'j6', title: 'National IT Advisor – Health', company: { name: 'WHO India' }, remoteType: 'onsite', matchScore: { overall: 91, breakdown: { skills: 90, experience: 92, location: 90, seniority: 92, industry: 91, compensation: 88 }, matchedSkills: ['Public Health IT', 'HIS', 'Digital Health Policy'], missingSkills: [], reasoning: 'Ideal for public health IT consulting at WHO scale', confidence: 0.93 } }),
  createMockJob({ id: 'j7', title: 'Digital Transformation Lead', company: { name: 'GIZ India' }, remoteType: 'hybrid', matchScore: { overall: 88, breakdown: { skills: 87, experience: 89, location: 87, seniority: 90, industry: 88, compensation: 86 }, matchedSkills: ['Digital Transformation', 'Government Consulting', 'Project Management'], missingSkills: ['German Development Aid'], reasoning: 'Strong match for bilateral development cooperation', confidence: 0.90 } }),
  createMockJob({ id: 'j8', title: 'Program Manager, Smart Cities', company: { name: 'MeitY / NICSI' }, matchScore: { overall: 84, breakdown: { skills: 82, experience: 86, location: 85, seniority: 85, industry: 84, compensation: 80 }, matchedSkills: ['Smart Cities', 'E-Governance', 'PMU', 'Policy'], missingSkills: ['GIS Mapping'], reasoning: 'Good government tech alignment, lower compensation range', confidence: 0.87 } }),
  createMockJob({ id: 'j9', title: 'Senior Advisor, Digital Health Strategy', company: { name: 'Gates Foundation' }, remoteType: 'remote', matchScore: { overall: 90, breakdown: { skills: 89, experience: 91, location: 92, seniority: 91, industry: 90, compensation: 90 }, matchedSkills: ['Digital Health', 'Public Health IT', 'Strategy', 'Donor Relations'], missingSkills: ['Global Health Security'], reasoning: 'Strong for philanthropic health digital transformation advisory', confidence: 0.92 } }),
  createMockJob({ id: 'j10', title: 'Chief Technology Advisor – Governance', company: { name: 'USAID India Mission' }, matchScore: { overall: 86, breakdown: { skills: 85, experience: 87, location: 85, seniority: 88, industry: 86, compensation: 84 }, matchedSkills: ['Governance Technology', 'E-Governance', 'Consulting'], missingSkills: ['PEPFAR', 'USAID Procurement Regulations'], reasoning: 'Good fit with minor gaps in USAID-specific protocols', confidence: 0.89 } }),
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
