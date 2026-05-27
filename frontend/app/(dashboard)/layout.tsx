'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Extra bottom padding on mobile for the fixed nav bar */}
          <div className="mx-auto max-w-screen-2xl px-4 py-4 pb-24 md:px-6 md:pb-6 lg:px-8 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation — shown only on small screens */}
      <MobileNav />
    </div>
  )
}
