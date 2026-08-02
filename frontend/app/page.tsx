'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Zap,
  Sparkles,
  Search,
  Mail,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Star,
  Globe,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const features = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'AI-Powered Matching',
    description:
      'Our AI analyzes your profile and matches you with opportunities using semantic understanding — beyond simple keyword matching.',
    color: 'from-gold-500/20 to-gold-500/5',
    iconColor: 'text-gold-500',
  },
  {
    icon: <Search className="h-5 w-5" />,
    title: 'Multi-Source Intelligence',
    description:
      'Aggregates opportunities from LinkedIn, Indeed, Glassdoor, Naukri, and 15+ specialized consulting job boards daily.',
    color: 'from-blue-500/20 to-blue-500/5',
    iconColor: 'text-blue-500',
  },
  {
    icon: <Mail className="h-5 w-5" />,
    title: 'Daily Digest',
    description:
      'Receive a curated daily digest via email, Telegram, or WhatsApp with only the top 10 opportunities handpicked for you.',
    color: 'from-purple-500/20 to-purple-500/5',
    iconColor: 'text-purple-500',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Market Analytics',
    description:
      'Track job market trends, salary benchmarks, in-demand skills, and recruiter activity in your target sectors.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-500',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Application Tracker',
    description:
      'Kanban-style pipeline to track your applications from interest to offer. Never miss a follow-up deadline.',
    color: 'from-cyan-500/20 to-cyan-500/5',
    iconColor: 'text-cyan-500',
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: 'Recruiter Network',
    description:
      'Automatically discovers and profiles recruiters active in your domain with AI-generated outreach messages.',
    color: 'from-orange-500/20 to-orange-500/5',
    iconColor: 'text-orange-500',
  },
]

const stats = [
  { value: '10,000+', label: 'Jobs Indexed Daily' },
  { value: '85%', label: 'Match Accuracy' },
  { value: '15+', label: 'Job Platforms' },
  { value: '3 min', label: 'Daily Review Time' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500">
              <Zap className="h-4 w-4 fill-navy-900 text-navy-900" />
            </div>
            <span className="text-sm font-bold text-foreground">
              Opportunity<span className="text-gold-500">IQ</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 transition-all hover:bg-gold-400 hover:shadow-glow"
            >
              Launch Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-background to-background dark:from-navy-900 dark:via-navy-950 dark:to-background" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-gold-500/10 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl"
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-gold-500" />
              <span className="text-xs font-semibold text-gold-600 dark:text-gold-400">
                AI-Powered Career Intelligence Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Your AI-Powered{' '}
              <span className="text-gradient-gold">Career Intelligence</span>
              {' '}for Senior Consultants
            </h1>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Stop manually searching 15 job platforms. GovIntel AI aggregates,
              scores, and delivers the exact opportunities you need — every morning,
              with an 85%+ AI match accuracy.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 rounded-xl bg-gold-500 px-7 py-3.5 text-base font-bold text-navy-900 shadow-glow transition-all hover:bg-gold-400 hover:shadow-glow-lg hover:-translate-y-0.5"
              >
                <Zap className="h-5 w-5 fill-navy-900" />
                Launch Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-7 py-3.5 text-base font-semibold text-foreground transition-all hover:bg-muted hover:border-gold-500/40"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              {['No credit card required', 'Free 14-day trial', 'Cancel anytime'].map((text) => (
                <div key={text} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Mock dashboard preview */}
              <div className="border-b border-border bg-muted/50 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="rounded-md border border-border bg-card px-4 py-1 text-xs text-muted-foreground">
                    app.opportunityiq.ai/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard skeleton preview */}
              <div className="p-6 bg-gradient-to-br from-navy-900/50 to-background min-h-[320px]">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Total Opportunities', value: '1,247', color: 'border-gold-500/30 bg-gold-500/5' },
                    { label: 'High Match >80%', value: '83', color: 'border-emerald-500/30 bg-emerald-500/5' },
                    { label: 'New Today', value: '24', color: 'border-blue-500/30 bg-blue-500/5' },
                    { label: 'Applied', value: '7', color: 'border-purple-500/30 bg-purple-500/5' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`rounded-xl border p-4 ${stat.color}`}
                    >
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
                {/* Job cards row */}
                <div className="grid grid-cols-3 gap-3">
                  {['McKinsey & Co', 'Boston Consulting Group', 'Bain & Company'].map(
                    (company, i) => (
                      <div
                        key={company}
                        className="rounded-xl border border-border bg-card/50 p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="h-8 w-8 rounded-lg bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-xs">
                            {company[0]}
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              i === 0 ? 'text-emerald-500' : i === 1 ? 'text-emerald-400' : 'text-amber-500'
                            }`}
                          >
                            {i === 0 ? '94%' : i === 1 ? '89%' : '76%'}
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-foreground">Sr. Strategy Consultant</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{company}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -left-4 top-1/3 hidden rounded-xl border border-emerald-500/30 bg-card px-3 py-2 shadow-lg md:block"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-foreground">47 new jobs found</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute -right-4 top-1/2 hidden rounded-xl border border-gold-500/30 bg-card px-3 py-2 shadow-lg md:block"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                <span className="text-xs font-semibold text-foreground">94% match found</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl font-extrabold text-gradient-gold">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-extrabold text-foreground">
            Everything you need to land your next role
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Purpose-built for senior professionals who want signal, not noise.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border border-border bg-gradient-to-br p-6 transition-all hover:shadow-md hover:-translate-y-0.5 ${feature.color}`}
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-sm ${feature.iconColor}`}
              >
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-bold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="flex justify-center gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-gold-500 text-gold-500" />
              ))}
            </div>
            <p className="text-lg font-semibold text-foreground">Trusted by senior professionals at</p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {['McKinsey', 'BCG', 'Bain', 'Deloitte', 'PwC', 'EY', 'Accenture', 'KPMG'].map(
              (firm) => (
                <span key={firm} className="text-lg font-bold text-muted-foreground">
                  {firm}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/10 to-transparent p-12">
            <h2 className="text-3xl font-extrabold text-foreground">
              Ready to elevate your job search?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Join senior consultants who save 10+ hours per week and discover
              opportunities they would have missed.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 rounded-xl bg-gold-500 px-8 py-3.5 text-base font-bold text-navy-900 shadow-glow transition-all hover:bg-gold-400 hover:shadow-glow-lg"
              >
                <Zap className="h-5 w-5 fill-navy-900" />
                Get Started Free
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-500">
                <Zap className="h-3.5 w-3.5 fill-navy-900 text-navy-900" />
              </div>
              <span className="text-sm font-bold text-foreground">
                Opportunity<span className="text-gold-500">IQ</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} GovIntel AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
