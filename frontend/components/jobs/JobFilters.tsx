'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, RotateCcw, SlidersHorizontal, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { JOB_SOURCES, REMOTE_TYPES, SENIORITY_LEVELS, INDUSTRY_TAGS } from '@/lib/constants'
import type { SearchFilters, JobSource, RemoteType, SeniorityLevel } from '@/types'
import * as Slider from '@radix-ui/react-slider'

interface JobFiltersProps {
  filters: Partial<SearchFilters>
  onFiltersChange: (filters: Partial<SearchFilters>) => void
  onReset: () => void
  activeFilterCount: number
  className?: string
  collapsible?: boolean
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border pb-4 last:border-b-0 last:pb-0">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
      >
        {title}
        <ChevronDown
          className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CheckboxItem({
  label,
  checked,
  onChange,
  color,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  color?: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all duration-150',
          checked
            ? 'border-gold-500 bg-gold-500 text-navy-900'
            : 'border-border bg-card hover:border-gold-500/50'
        )}
      >
        {checked && <Check className="h-3 w-3 font-bold" strokeWidth={3} />}
      </div>
      {color && (
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="text-sm text-foreground">{label}</span>
    </label>
  )
}

export function JobFilters({
  filters,
  onFiltersChange,
  onReset,
  activeFilterCount,
  className,
  collapsible = false,
}: JobFiltersProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const updateArrayFilter = <T extends string>(
    key: keyof SearchFilters,
    value: T,
    checked: boolean
  ) => {
    const current = (filters[key] as T[]) || []
    const updated = checked ? [...current, value] : current.filter((v) => v !== value)
    onFiltersChange({ ...filters, [key]: updated })
  }

  const isSourceChecked = (source: JobSource) =>
    (filters.sources || []).includes(source)
  const isRemoteChecked = (type: RemoteType) =>
    (filters.remoteTypes || []).includes(type)
  const isSeniorityChecked = (level: SeniorityLevel) =>
    (filters.seniorityLevels || []).includes(level)
  const isIndustryChecked = (industry: string) =>
    (filters.industries || []).includes(industry)

  const content = (
    <div className="space-y-4">
      {/* Source Platform */}
      <FilterSection title="Source Platform">
        <div className="space-y-0.5">
          {JOB_SOURCES.map((source) => (
            <CheckboxItem
              key={source.value}
              label={source.label}
              checked={isSourceChecked(source.value)}
              onChange={(checked) => updateArrayFilter('sources', source.value, checked)}
              color={source.color}
            />
          ))}
        </div>
      </FilterSection>

      {/* Remote Type */}
      <FilterSection title="Work Type">
        <div className="space-y-0.5">
          {REMOTE_TYPES.map((remote) => (
            <CheckboxItem
              key={remote.value}
              label={remote.label}
              checked={isRemoteChecked(remote.value)}
              onChange={(checked) => updateArrayFilter('remoteTypes', remote.value, checked)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Seniority Level */}
      <FilterSection title="Seniority Level">
        <div className="space-y-0.5">
          {SENIORITY_LEVELS.map((level) => (
            <CheckboxItem
              key={level.value}
              label={level.label}
              checked={isSeniorityChecked(level.value)}
              onChange={(checked) => updateArrayFilter('seniorityLevels', level.value, checked)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Match Score */}
      <FilterSection title="Match Score">
        <div className="px-2 pt-2 pb-1">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              {filters.minMatchScore || 0}%
            </span>
            <span className="text-muted-foreground">Min score</span>
          </div>
          <Slider.Root
            min={0}
            max={100}
            step={5}
            value={[filters.minMatchScore || 0]}
            onValueChange={([value]) =>
              onFiltersChange({ ...filters, minMatchScore: value })
            }
            className="relative flex h-5 w-full touch-none select-none items-center"
          >
            <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
              <Slider.Range className="absolute h-full rounded-full bg-gold-500" />
            </Slider.Track>
            <Slider.Thumb
              className="block h-4 w-4 rounded-full border-2 border-gold-500 bg-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-gold-500/30 hover:scale-110"
              aria-label="Minimum match score"
            />
          </Slider.Root>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </FilterSection>

      {/* Posted Date */}
      <FilterSection title="Posted Date">
        <div className="space-y-0.5">
          {[
            { label: 'Today', value: '1d' },
            { label: 'Last 3 days', value: '3d' },
            { label: 'Last week', value: '7d' },
            { label: 'Last 2 weeks', value: '14d' },
            { label: 'Last month', value: '30d' },
          ].map((option) => {
            const cutoff = new Date()
            const days = parseInt(option.value)
            cutoff.setDate(cutoff.getDate() - days)
            const value = cutoff.toISOString()
            const checked = filters.postedAfter === value

            return (
              <CheckboxItem
                key={option.value}
                label={option.label}
                checked={checked}
                onChange={() =>
                  onFiltersChange({
                    ...filters,
                    postedAfter: checked ? undefined : value,
                  })
                }
              />
            )
          })}
        </div>
      </FilterSection>

      {/* Industry */}
      <FilterSection title="Industry" defaultOpen={false}>
        <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
          {INDUSTRY_TAGS.map((industry) => (
            <CheckboxItem
              key={industry}
              label={industry}
              checked={isIndustryChecked(industry)}
              onChange={(checked) => updateArrayFilter('industries', industry, checked)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(filters.sources || []).map((source) => (
            <span
              key={source}
              className="flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700 dark:bg-gold-900/30 dark:text-gold-400"
            >
              {source}
              <button
                onClick={() => updateArrayFilter('sources', source, false)}
                className="hover:text-gold-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="primary"
          size="sm"
          fullWidth
          className="flex-1"
          onClick={() => {}}
        >
          Apply Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-navy-900 text-[10px] font-bold text-gold-400">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  )

  if (collapsible) {
    return (
      <div className={className}>
        <button
          onClick={() => setIsPanelOpen((p) => !p)}
          className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-900">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              'ml-auto h-4 w-4 transition-transform duration-200',
              isPanelOpen && 'rotate-180'
            )}
          />
        </button>
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-b-xl border border-t-0 border-border bg-card p-4">
                {content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gold-500" />
          <h3 className="text-sm font-bold text-foreground">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-900">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      {content}
    </div>
  )
}

export default JobFilters
