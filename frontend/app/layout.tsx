import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { QueryClientProviderWrapper } from '@/components/providers/QueryClientProvider'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'OpportunityIQ — AI Career Intelligence',
    template: '%s | OpportunityIQ',
  },
  description:
    'AI-powered job opportunity intelligence for senior consultants. Discover, track, and act on the best opportunities with AI-curated matching.',
  keywords: [
    'AI career intelligence',
    'job matching',
    'consulting jobs',
    'senior consultant',
    'job tracker',
    'OpportunityIQ',
  ],
  authors: [{ name: 'OpportunityIQ' }],
  creator: 'OpportunityIQ',
  metadataBase: new URL('https://opportunityiq.ai'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://opportunityiq.ai',
    title: 'OpportunityIQ — AI Career Intelligence',
    description:
      'AI-powered job opportunity intelligence for senior consultants.',
    siteName: 'OpportunityIQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpportunityIQ — AI Career Intelligence',
    description:
      'AI-powered job opportunity intelligence for senior consultants.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryClientProviderWrapper>
            {children}
            <Toaster
              position="top-right"
              richColors
              theme="system"
              toastOptions={{
                style: {
                  fontFamily: 'Inter, sans-serif',
                },
              }}
            />
          </QueryClientProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
