'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, SlidersHorizontal, ArrowUpDown, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchBar } from '@/components/ui/SearchBar'
import { Button } from '@/components/ui/Button'
import { JobCard } from '@/components/jobs/JobCard'
import { JobFilters } from '@/components/jobs/JobFilters'
import { EmptyState } from '@/components/ui/EmptyState'
import { useFilters, useHideJob, useBookmarkJob } from '@/hooks/useJobs'
import { getFilteredJobs } from '@/lib/mock-jobs'
import type { SortOption, ViewMode, Job } from '@/types'
import { toast } from 'sonner'

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'match_score', label: 'Match Score' },
  { value: 'posted_date', label: 'Posted Date' },
  { value: 'salary', label: 'Salary' },
  { value: 'company', label: 'Company' },
]

const PAGE_SIZE = 9

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('match_score')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())

  const { filters, updateFilter, resetFilters, activeFilterCount } = useFilters()

  const handleHide = useCallback((job: Job) => {
    setHiddenIds((prev) => new Set([...prev, job.id]))
    toast.success(`"${job.title}" hidden`)
  }, [])

  const handleBookmark = useCallback((job: Job) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (next.has(job.id)) {
        next.delete(job.id)
        toast.success('Bookmark removed')
      } else {
        next.add(job.id)
        toast.success('Job bookmarked!')
      }
      return next
    })
  }, [])

  const handleApply = useCallback((job: Job) => {
    if (job.sourceUrl) window.open(job.sourceUrl, '_blank', 'noopener,noreferrer')
  }, [])

  const filteredJobs = useMemo(() => {
    const results = getFilteredJobs({
      search: searchQuery,
      remoteTypes: filters.remoteTypes,
      seniorityLevels: filters.seniorityLevels,
      sources: filters.sources,
      industries: filters.industries,
      minMatchScore: filters.minMatchScore,
      salaryMin: filters.salaryMin,
      salaryMax: filters.salaryMax,
      sortBy,
    })
    return results
      .filter((j) => !hiddenIds.has(j.id))
      .map((j) => ({ ...j, isBookmarked: bookmarkedIds.has(j.id) }))
  }, [searchQuery, filters, sortBy, hiddenIds, bookmarkedIds])

  const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE)
  const paginatedJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    setPage(1)
  }, [])

  const handleFiltersChange = useCallback((f: Partial<typeof filters>) => {
    Object.entries(f).forEach(([k, v]) => {
      updateFilter(k as keyof typeof filters, v as never)
    })
    setPage(1)
  }, [updateFilter])

  const handleReset = useCallback(() => {
    resetFilters()
    setPage(1)
  }, [resetFilters])

  return (
    <div className="space-y-5 animate-in">
      {/* Search + Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchBar
          className="flex-1"
          placeholder="Search: 'digital health WHO', 'PMU director', 'remote consulting'…"
          onSearch={handleSearch}
          defaultValue={searchQuery}
        />
        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as SortOption); setPage(1) }}
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

          {/* Filter toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((p) => !p)}
            leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
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
          <span className="font-semibold text-foreground">{paginatedJobs.length}</span>{' '}
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
            onClick={handleReset}
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
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 280 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 overflow-hidden"
            >
              <div className="sticky top-6" style={{ width: 280 }}>
                <JobFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleReset}
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
                onClick: () => { handleReset(); setSearchQuery('') },
              }}
              secondaryAction={{
                label: 'Browse All Jobs',
                onClick: () => { setSearchQuery('') },
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
