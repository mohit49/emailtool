import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Email Testing Tool & Popup Builder - Create, Test & Send Emails & Popups | PRZIO',
  description: 'Free email testing tool and popup builder platform. Test, preview, and send HTML email templates. Create engaging popups and nudges with drag-and-drop editor. Perfect for email campaigns, popup marketing, exit intent popups, and website engagement tools.',
  keywords: 'email testing tool, popup builder, nudge builder, email template editor, popup creator, exit intent popup, website popup builder, email testing, HTML email editor, popup marketing, email campaign tool, drag and drop popup builder, conversion popup, lead generation popup, email preview tool, popup designer, email builder, website engagement tool, popup trigger, scroll popup, timeout popup, cookie-based popup, session popup',
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



