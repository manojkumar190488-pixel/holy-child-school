'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Briefcase,
  Brain,
  Plug,
  Upload,
  Save,
  Check,
  AlertCircle,
  Mail,
  MessageSquare,
  Phone,
  Zap,
  Shield,
  RefreshCw,
  Camera,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { toast } from 'sonner'
import * as Slider from '@radix-ui/react-slider'
import * as Switch from '@radix-ui/react-switch'
import { SENIORITY_LEVELS, REMOTE_TYPES, INDUSTRY_TAGS } from '@/lib/constants'

type Tab = 'profile' | 'notifications' | 'preferences' | 'ai' | 'integrations'

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'preferences', label: 'Job Preferences', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'ai', label: 'AI Settings', icon: <Brain className="h-4 w-4" /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug className="h-4 w-4" /> },
]

function SettingRow({
  label,
  description,
  children,
  divider = true,
}: {
  label: string
  description?: string
  children: React.ReactNode
  divider?: boolean
}) {
  return (
    <div className={cn('flex items-start justify-between gap-6 py-4', divider && 'border-b border-border last:border-b-0')}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function SwitchToggle({ defaultChecked = false, onChange }: { defaultChecked?: boolean; onChange?: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={(c) => {
        setChecked(c)
        onChange?.(c)
      }}
      className={cn(
        'relative h-6 w-11 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/30',
        checked ? 'bg-gold-500' : 'bg-muted'
      )}
    >
      <Switch.Thumb
        className={cn(
          'block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200',
          'translate-x-1',
          checked && 'translate-x-6'
        )}
      />
    </Switch.Root>
  )
}

function WeightSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground">{value}%</span>
      </div>
      <Slider.Root
        min={0}
        max={100}
        step={5}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="relative flex h-5 w-full touch-none select-none items-center"
      >
        <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
          <Slider.Range className="absolute h-full rounded-full bg-gold-500" />
        </Slider.Track>
        <Slider.Thumb className="block h-4 w-4 rounded-full border-2 border-gold-500 bg-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-gold-500/30 hover:scale-110" />
      </Slider.Root>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [weights, setWeights] = useState({
    skills: 40,
    experience: 25,
    location: 10,
    seniority: 15,
    industry: 5,
    compensation: 5,
  })

  const [profileForm, setProfileForm] = useState({
    name: 'Alexandra Chen',
    email: 'alex.chen@consulting.com',
    title: 'Senior Strategy Consultant',
    location: 'New York, NY',
    company: '',
    bio: 'Experienced strategy consultant with 8+ years at top-tier consulting firms. Specialized in M&A, digital transformation, and corporate strategy.',
    linkedinUrl: 'https://linkedin.com/in/alexandra-chen',
  })

  const [digestTime, setDigestTime] = useState('08:00')
  const [minScore, setMinScore] = useState(60)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsSaving(false)
    toast.success('Settings saved successfully')
  }

  const totalWeight = Object.values(weights).reduce((s, v) => s + v, 0)
  const isWeightValid = totalWeight === 100

  return (
    <div className="animate-in">
      <div className="max-w-4xl">
        {/* Tabs */}
        <div className="mb-6 flex gap-0.5 rounded-xl border border-border bg-muted p-1 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Personal Information</h3>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-900 text-xl font-bold">
                    AC
                  </div>
                  <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-navy-900 shadow-sm hover:bg-gold-400 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{profileForm.name}</p>
                  <p className="text-xs text-muted-foreground">{profileForm.title}</p>
                  <button className="mt-1 text-xs font-medium text-gold-600 dark:text-gold-400 hover:underline">
                    Change photo
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'Your full name', type: 'text' },
                  { key: 'email', label: 'Email Address', placeholder: 'your@email.com', type: 'email' },
                  { key: 'title', label: 'Professional Title', placeholder: 'Senior Strategy Consultant', type: 'text' },
                  { key: 'location', label: 'Location', placeholder: 'City, Country', type: 'text' },
                  { key: 'company', label: 'Current Company', placeholder: 'Optional', type: 'text' },
                  { key: 'linkedinUrl', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...', type: 'url' },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input
                      type={type}
                      value={profileForm[key as keyof typeof profileForm]}
                      onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="input"
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="label">Professional Summary</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                    rows={4}
                    className="input resize-none"
                    placeholder="Brief professional summary..."
                  />
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Resume</h3>
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center transition-colors hover:border-gold-500/50 cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm font-semibold text-foreground">Upload Resume</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, or DOCX · Max 5MB
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Choose File
                </Button>
              </div>
            </div>

            {/* Theme */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Appearance</h3>
              <SettingRow label="Theme" description="Choose your preferred color scheme" divider={false}>
                <ThemeToggle variant="segmented" />
              </SettingRow>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Email Notifications</h3>
              <div className="space-y-0">
                <SettingRow label="Daily Digest" description="Receive top 10 AI-curated opportunities every morning">
                  <SwitchToggle defaultChecked onChange={(c) => toast.info(c ? 'Daily digest enabled' : 'Daily digest disabled')} />
                </SettingRow>
                <SettingRow label="Digest Send Time" description="When should we send your daily digest?">
                  <input
                    type="time"
                    value={digestTime}
                    onChange={(e) => setDigestTime(e.target.value)}
                    className="input w-32"
                  />
                </SettingRow>
                <SettingRow label="High Match Alerts" description="Instant alert when a 90%+ match is found">
                  <SwitchToggle defaultChecked />
                </SettingRow>
                <SettingRow label="Weekly Market Report" description="Weekly summary of job market trends">
                  <SwitchToggle />
                </SettingRow>
                <SettingRow label="Application Reminders" description="Reminders for pending follow-ups" divider={false}>
                  <SwitchToggle defaultChecked />
                </SettingRow>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Telegram Integration</h3>
              <div className="space-y-0">
                <SettingRow label="Enable Telegram" description="Receive notifications via Telegram Bot">
                  <SwitchToggle onChange={(c) => c && toast.info('Enter your Telegram chat ID below')} />
                </SettingRow>
                <SettingRow label="Telegram Chat ID" description="Get this from @OpportunityIQBot" divider={false}>
                  <input
                    type="text"
                    className="input w-40"
                    placeholder="Chat ID"
                  />
                </SettingRow>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">WhatsApp Integration</h3>
              <div className="space-y-0">
                <SettingRow label="Enable WhatsApp" description="Receive digest via WhatsApp Business API">
                  <SwitchToggle />
                </SettingRow>
                <SettingRow label="WhatsApp Number" description="Include country code" divider={false}>
                  <input
                    type="tel"
                    className="input w-40"
                    placeholder="+1 555 000 0000"
                  />
                </SettingRow>
              </div>
            </div>
          </motion.div>
        )}

        {/* Job Preferences Tab */}
        {activeTab === 'preferences' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Target Roles</h3>
              <div>
                <label className="label">Preferred Job Titles</label>
                <input type="text" className="input" placeholder="e.g., Senior Strategy Consultant, VP Strategy, Director..." />
                <p className="text-xs text-muted-foreground mt-1.5">Separate multiple titles with commas</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Location & Remote</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Preferred Locations</label>
                  <input type="text" className="input" defaultValue="New York, San Francisco, London" />
                </div>
                <div>
                  <label className="label">Work Type</label>
                  <div className="flex gap-2 flex-wrap mt-1.5">
                    {REMOTE_TYPES.map((rt) => (
                      <label key={rt.value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm has-[:checked]:border-gold-500 has-[:checked]:bg-gold-50 dark:has-[:checked]:bg-gold-900/20 transition-all">
                        <input type="checkbox" className="hidden" defaultChecked />
                        <span>{rt.icon}</span>
                        <span className="font-medium text-foreground">{rt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Seniority</h3>
              <div className="flex flex-wrap gap-2">
                {SENIORITY_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm transition-all has-[:checked]:border-gold-500 has-[:checked]:bg-gold-50 dark:has-[:checked]:bg-gold-900/20"
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      defaultChecked={['senior', 'lead', 'director', 'vp'].includes(level.value)}
                    />
                    <span className="font-medium text-foreground">{level.shortLabel}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Minimum Match Score</h3>
              <div className="px-2">
                <WeightSlider
                  label={`Only show jobs with score ≥ ${minScore}%`}
                  value={minScore}
                  onChange={setMinScore}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Industries</h3>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {INDUSTRY_TAGS.map((industry) => (
                  <label
                    key={industry}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs transition-all has-[:checked]:border-gold-500 has-[:checked]:bg-gold-50 dark:has-[:checked]:bg-gold-900/20"
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      defaultChecked={['Consulting', 'Finance', 'Technology'].includes(industry)}
                    />
                    <span className="font-medium text-foreground">{industry}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Settings Tab */}
        {activeTab === 'ai' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Scoring Weights</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Customize how the AI calculates your match score
                  </p>
                </div>
                <div className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
                  isWeightValid
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}>
                  {isWeightValid ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  Total: {totalWeight}%
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(weights).map(([key, value]) => (
                  <WeightSlider
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={value}
                    onChange={(v) => setWeights((p) => ({ ...p, [key]: v }))}
                  />
                ))}
              </div>

              {!isWeightValid && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-xs text-red-700 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  Weights must sum to exactly 100%. Currently: {totalWeight}%.
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">AI Features</h3>
              <div className="space-y-0">
                <SettingRow label="Semantic Job Search" description="Use AI to understand search intent beyond keywords">
                  <SwitchToggle defaultChecked />
                </SettingRow>
                <SettingRow label="Auto-Summarize Jobs" description="Generate AI summaries for every job posting">
                  <SwitchToggle defaultChecked />
                </SettingRow>
                <SettingRow label="Recruiter Discovery" description="Auto-identify and profile recruiters from job postings">
                  <SwitchToggle defaultChecked />
                </SettingRow>
                <SettingRow label="Cover Letter Generation" description="Generate personalized cover letters with GPT-4" divider={false}>
                  <SwitchToggle defaultChecked />
                </SettingRow>
              </div>
            </div>
          </motion.div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {[
              {
                icon: <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>,
                name: 'Google Account',
                description: 'Sign in and sync your calendar for interview scheduling',
                connected: true,
              },
              {
                icon: <div className="h-5 w-5 rounded bg-[#0A66C2] flex items-center justify-center text-white text-xs font-bold">in</div>,
                name: 'LinkedIn',
                description: 'Import profile data and enable one-click applications',
                connected: false,
              },
              {
                icon: <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-500 text-white"><MessageSquare className="h-3 w-3" /></div>,
                name: 'Telegram Bot',
                description: 'Receive instant notifications via @OpportunityIQBot',
                connected: false,
              },
              {
                icon: <div className="flex h-5 w-5 items-center justify-center rounded bg-green-500 text-white"><Phone className="h-3 w-3" /></div>,
                name: 'WhatsApp',
                description: 'Get daily digest via WhatsApp Business',
                connected: false,
              },
              {
                icon: <Mail className="h-5 w-5 text-muted-foreground" />,
                name: 'Email (SMTP)',
                description: 'Configure custom email server for digest delivery',
                connected: true,
              },
            ].map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted">
                    {integration.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <Button
                  variant={integration.connected ? 'secondary' : 'outline'}
                  size="sm"
                  leftIcon={
                    integration.connected ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Plug className="h-3.5 w-3.5" />
                    )
                  }
                  onClick={() => toast.info(integration.connected ? 'Disconnecting...' : 'Connecting...')}
                >
                  {integration.connected ? 'Connected' : 'Connect'}
                </Button>
              </div>
            ))}
          </motion.div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" size="sm">
            Discard Changes
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={isSaving}
            onClick={handleSave}
            leftIcon={!isSaving ? <Save className="h-4 w-4" /> : undefined}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
