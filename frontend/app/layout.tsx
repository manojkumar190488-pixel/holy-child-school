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
    'AI career intelligence', 'job matching', 'consulting jobs',
    'senior consultant', 'job tracker', 'OpportunityIQ',
    'e-governance jobs', 'digital transformation careers',
  ],
  authors: [{ name: 'OpportunityIQ' }],
  creator: 'OpportunityIQ',
  metadataBase: new URL('https://opportunityiq.ai'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OpportunityIQ',
    startupImage: [
      { url: '/icons/icon-512x512.png', media: '(device-width: 320px)' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://opportunityiq.ai',
    title: 'OpportunityIQ — AI Career Intelligence',
    description: 'AI-powered job opportunity intelligence for senior consultants.',
    siteName: 'OpportunityIQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpportunityIQ — AI Career Intelligence',
    description: 'AI-powered job opportunity intelligence for senior consultants.',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/icon.svg', color: '#F59E0B' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#F59E0B',
    'msapplication-TileImage': '/icons/icon-144x144.png',
    'theme-color': '#F59E0B',
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
