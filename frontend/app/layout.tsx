import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Free Email Testing Tool - Test, Create & Send Emails | PRZIO',
  description: 'Free email testing tool to test, preview, and send HTML email templates. Create and send free emails with our powerful email editor. Perfect for testing email campaigns, bulk email sending, and collaborative email design.',
  keywords: 'free email testing tool, free email sending tool, create and send free email, free email editor tool, email testing, email template, HTML email, email preview, email design, collaborative preview, email comments, bulk email sending, email campaign testing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}



