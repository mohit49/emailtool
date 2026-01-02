import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './providers/AuthProvider'
import ExternalScripts from '../components/ExternalScripts'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Email Testing Tool & Popup Builder with Forms - Create, Test & Send Emails, Popups & Forms | PRZIO',
  description: 'Free email testing tool, popup builder, and form builder platform. Test, preview, and send HTML email templates. Create engaging popups with embedded forms, lead generation forms, contact forms, and surveys. Perfect for email campaigns, popup marketing, exit intent popups, form submissions, and website engagement tools.',
  keywords: 'email testing tool, popup builder, form builder, nudge builder, email template editor, popup creator, exit intent popup, website popup builder, email testing, HTML email editor, popup marketing, email campaign tool, drag and drop popup builder, conversion popup, lead generation popup, email preview tool, popup designer, email builder, website engagement tool, popup trigger, scroll popup, timeout popup, cookie-based popup, session popup, contact form builder, survey form builder, subscription form, form validation, embedded forms, popup forms, lead capture form, form submission, form data collection',
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
        <ExternalScripts />
      </body>
    </html>
  )
}



