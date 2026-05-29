'use client'

import { useState } from 'react'
import { Save, Check, School, Bell, Shield, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SCHOOL_INFO } from '@/lib/mock-school-data'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

type SettingsTab = 'school' | 'notifications' | 'security' | 'appearance'

const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { key: 'school', label: 'School Profile', icon: <School className="h-4 w-4" /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { key: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
  { key: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
]

const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('school')
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaved(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaved(false)
    toast.success('Settings saved successfully!')
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">School & account configuration</p>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto scrollbar-none">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={cn('flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-all', activeTab === t.key ? 'border-gold-500 text-gold-600 dark:text-gold-400' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {activeTab === 'school' && (
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">School Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'School Name', defaultValue: SCHOOL_INFO.name },
                { label: 'Affiliation', defaultValue: SCHOOL_INFO.affiliation },
                { label: 'Academic Year', defaultValue: SCHOOL_INFO.academicYear },
                { label: 'Current Term', defaultValue: SCHOOL_INFO.currentTerm },
                { label: 'Principal Name', defaultValue: 'Dr. Anita Sharma' },
                { label: 'Contact Number', defaultValue: '+91-522-2345678' },
              ].map(field => (
                <div key={field.label} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">{field.label}</label>
                  <input className={inputCls} defaultValue={field.defaultValue} />
                </div>
              ))}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Address</label>
                <textarea rows={2} className={inputCls + ' resize-none'} defaultValue={SCHOOL_INFO.address} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                { label: 'Fee Due Reminders', desc: 'Send alerts when fees are overdue' },
                { label: 'Attendance Alerts', desc: 'Notify parents when attendance drops below 75%' },
                { label: 'Exam Notifications', desc: 'Send exam schedule and result notifications' },
                { label: 'Circular Broadcasts', desc: 'Send new circulars to all parents and staff' },
                { label: 'Birthday Reminders', desc: 'Auto-wish students on birthdays' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="peer h-5 w-9 rounded-full bg-muted after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-gold-500 peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Current Password</label>
                <input type="password" className={inputCls} placeholder="Enter current password" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">New Password</label>
                <input type="password" className={inputCls} placeholder="Min 8 characters" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Confirm New Password</label>
                <input type="password" className={inputCls} placeholder="Repeat new password" />
              </div>
              <div className="rounded-xl border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Enable OTP-based 2FA for enhanced security</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="peer h-5 w-9 rounded-full bg-muted after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-gold-500 peer-checked:after:translate-x-4" />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Appearance</h3>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Theme</p>
              <ThemeToggle variant="button" />
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold text-foreground mb-1">Language</p>
              <p className="text-xs text-muted-foreground mb-3">Interface language</p>
              <select className={inputCls + ' max-w-xs'} defaultValue="en">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-bold text-navy-900 hover:bg-gold-400 transition-colors">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
