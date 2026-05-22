'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Minus } from 'lucide-react'

export type SkillTagType = 'matched' | 'missing' | 'neutral'

interface SkillTagProps {
  skill: string
  type?: SkillTagType
  size?: 'sm' | 'md'
  showIcon?: boolean
}

const typeClasses: Record<SkillTagType, string> = {
  matched:
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  missing:
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  neutral:
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
}

const iconMap: Record<SkillTagType, React.ReactNode> = {
  matched: <CheckCircle2 className="h-3 w-3" />,
  missing: <XCircle className="h-3 w-3" />,
  neutral: <Minus className="h-3 w-3" />,
}

export function SkillTag({ skill, type = 'neutral', size = 'sm', showIcon = false }: SkillTagProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        typeClasses[type],
        sizeClasses[size]
      )}
    >
      {showIcon && iconMap[type]}
      {skill}
    </span>
  )
}

interface SkillTagsProps {
  skills: string[]
  matchedSkills?: string[]
  missingSkills?: string[]
  maxVisible?: number
  size?: 'sm' | 'md'
  showIcons?: boolean
  className?: string
}

export function SkillTags({
  skills,
  matchedSkills = [],
  missingSkills = [],
  maxVisible,
  size = 'sm',
  showIcons = false,
  className,
}: SkillTagsProps) {
  const visibleSkills = maxVisible ? skills.slice(0, maxVisible) : skills
  const hiddenCount = maxVisible ? Math.max(0, skills.length - maxVisible) : 0

  const getType = (skill: string): SkillTagType => {
    if (matchedSkills.includes(skill)) return 'matched'
    if (missingSkills.includes(skill)) return 'missing'
    return 'neutral'
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {visibleSkills.map((skill) => (
        <SkillTag
          key={skill}
          skill={skill}
          type={getType(skill)}
          size={size}
          showIcon={showIcons}
        />
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          +{hiddenCount} more
        </span>
      )}
    </div>
  )
}

interface MatchedMissingSkillsProps {
  matchedSkills: string[]
  missingSkills: string[]
  className?: string
}

export function MatchedMissingSkills({
  matchedSkills,
  missingSkills,
  className,
}: MatchedMissingSkillsProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {matchedSkills.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Matched Skills ({matchedSkills.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.map((skill) => (
              <SkillTag key={skill} skill={skill} type="matched" size="sm" />
            ))}
          </div>
        </div>
      )}
      {missingSkills.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <XCircle className="h-3.5 w-3.5" />
            Missing Skills ({missingSkills.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.map((skill) => (
              <SkillTag key={skill} skill={skill} type="missing" size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SkillTags
