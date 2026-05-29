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
    default: 'Holy Child School ERP | CBSE Affiliated',
    template: '%s | Holy Child School ERP',
  },
  description:
    'Enterprise-grade School ERP Platform for Holy Child School, Lucknow. Manage students, staff, fees, attendance, examinations, library, transport, and more.',
  keywords: [
    'School ERP', 'School Management System', 'Holy Child School Lucknow',
    'CBSE School', 'Student Management', 'Fee Management', 'Attendance System',
    'School Portal', 'Parent Portal', 'Teacher Portal',
  ],
  authors: [{ name: 'Holy Child School' }],
  creator: 'Holy Child School ERP',
  metadataBase: new URL('https://manojkumar190488-pixel.github.io'),
  manifest: '/holy-child-school/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Holy Child ERP',
    startupImage: [
      { url: '/holy-child-school/icons/icon-512x512.png', media: '(device-width: 320px)' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://manojkumar190488-pixel.github.io/holy-child-school/',
    title: 'Holy Child School ERP | CBSE Affiliated',
    description: 'Enterprise School Management Platform — Students, Fees, Attendance, Examinations & More.',
    siteName: 'Holy Child School ERP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Holy Child School ERP',
    description: 'Enterprise School Management Platform for Holy Child School, Lucknow.',
  },
  icons: {
    icon: [
      { url: '/holy-child-school/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/holy-child-school/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/holy-child-school/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/holy-child-school/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/holy-child-school/icons/icon.svg', color: '#1e3a5f' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#1e3a5f',
    'msapplication-TileImage': '/holy-child-school/icons/icon-144x144.png',
    'theme-color': '#1e3a5f',
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
              toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }}
            />
          </QueryClientProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
