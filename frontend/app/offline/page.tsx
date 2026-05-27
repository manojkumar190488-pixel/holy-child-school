'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gold-500 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
          <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
      <h1 className="text-2xl font-extrabold text-foreground mb-2">You're offline</h1>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
        OpportunityIQ needs an internet connection to fetch the latest job opportunities.
        Your saved bookmarks and applications are still available.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-navy-900 hover:bg-gold-400 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
