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
    default: 'GovIntel AI — Opportunity Intelligence Platform',
    template: '%s | GovIntel AI',
  },
  description:
    'AI-powered opportunity intelligence for senior government consulting and digital transformation leaders. Discover, rank, and act on the best leadership, remote, and consulting opportunities.',
  keywords: [
    'government consulting jobs',
    'AI career intelligence',
    'digital transformation leadership',
    'public sector advisory',
    'multilateral consulting',
    'GovIntel AI',
  ],
  authors: [{ name: 'GovIntel AI' }],
  creator: 'GovIntel AI',
  metadataBase: new URL('https://govintel.ai'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://govintel.ai',
    title: 'GovIntel AI — Opportunity Intelligence Platform',
    description:
      'AI-powered opportunity intelligence for senior government consulting and digital transformation leaders.',
    siteName: 'GovIntel AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GovIntel AI — Opportunity Intelligence Platform',
    description:
      'AI-powered opportunity intelligence for senior government consulting and digital transformation leaders.',
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
