'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GraduationCap, Eye, EyeOff, ChevronDown, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRBAC, ROLE_LABELS, ROLE_COLORS, ROLE_DEFAULT_ROUTE } from '@/lib/rbac'
import { DEMO_ACCOUNTS, SCHOOL_INFO } from '@/lib/mock-school-data'
import type { UserRole } from '@/types/school'
import { toast } from 'sonner'

const ROLE_ICONS: Record<UserRole, string> = {
  super_admin: '🔐', school_admin: '🏫', principal: '👑',
  vice_principal: '📋', teacher: '📚', student: '🎓',
  parent: '👨‍👩‍👧', accountant: '💰', librarian: '📖',
  transport_manager: '🚌', hr_manager: '👥', receptionist: '📞',
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useRBAC()
  const [selectedRole, setSelectedRole] = useState<UserRole>('principal')
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('principal@holychildschool.edu.in')
  const [password, setPassword] = useState('demo123')

  const selectedAccount = DEMO_ACCOUNTS.find(a => a.role === selectedRole) || DEMO_ACCOUNTS[2]

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    const account = DEMO_ACCOUNTS.find(a => a.role === role)
    if (account) setEmail(account.email)
    setShowRoleDropdown(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 800))
    login({
      id: `USR_${selectedRole.toUpperCase()}`,
      name: selectedAccount.name,
      email: selectedAccount.email,
      role: selectedRole,
    })
    toast.success(`Welcome, ${selectedAccount.name}!`, {
      description: `Logged in as ${ROLE_LABELS[selectedRole]}`,
    })
    router.push(ROLE_DEFAULT_ROUTE[selectedRole])
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 dark:bg-navy-950 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-gold-500 blur-3xl" />
          <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-blue-500 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          {/* School Logo */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-gold-500 shadow-2xl">
            <GraduationCap className="h-12 w-12 text-navy-900" />
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-3">
            Holy Child School
          </h1>
          <p className="text-gold-400 font-medium text-lg mb-2">
            {SCHOOL_INFO.tagline}
          </p>
          <p className="text-navy-300 text-sm mb-12">
            {SCHOOL_INFO.affiliation}
          </p>

          {/* Feature highlights */}
          <div className="space-y-4 text-left">
            {[
              'Complete Student Lifecycle Management',
              'Real-time Attendance Tracking',
              'Fee Collection & Financial Reports',
              'Examination & Result Management',
              'Parent–School Communication',
              'AI-powered Insights & Analytics',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-gold-400 flex-shrink-0" />
                <span className="text-navy-200 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-navy-900 dark:bg-navy-800">
              <GraduationCap className="h-8 w-8 text-gold-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Holy Child School</h1>
            <p className="text-sm text-muted-foreground">{SCHOOL_INFO.tagline}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-foreground">Welcome back</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to access your school portal
              </p>
            </div>

            {/* Demo Role Selector */}
            <div className="mb-6 rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Demo Account — Select Role
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(p => !p)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                >
                  <span className="text-xl">{ROLE_ICONS[selectedRole]}</span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground">{selectedAccount.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedAccount.description}</p>
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', ROLE_COLORS[selectedRole])}>
                    {ROLE_LABELS[selectedRole]}
                  </span>
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', showRoleDropdown && 'rotate-180')} />
                </button>

                {showRoleDropdown && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                    {DEMO_ACCOUNTS.map((account) => (
                      <button
                        key={account.role}
                        type="button"
                        onClick={() => handleRoleSelect(account.role)}
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted',
                          selectedRole === account.role && 'bg-gold-50 dark:bg-gold-900/10'
                        )}
                      >
                        <span className="text-lg">{ROLE_ICONS[account.role]}</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">{account.name}</p>
                          <p className="text-xs text-muted-foreground">{account.description}</p>
                        </div>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', ROLE_COLORS[account.role])}>
                          {ROLE_LABELS[account.role]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder-muted-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Demo password: demo123</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gold-500 py-3 text-sm font-bold text-navy-900 transition-all hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-900 border-t-transparent" />
                    Signing in…
                  </span>
                ) : (
                  'Sign In to Portal'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {SCHOOL_INFO.address}
            </p>
          </div>
        </motion.div>
      </div>

      {showRoleDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)} />
      )}
    </div>
  )
}
