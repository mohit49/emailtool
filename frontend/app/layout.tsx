import type { Metadata } from 'next'
import { Lato } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './providers/AuthProvider'
import ExternalScripts from '../components/ExternalScripts'
import SupportChat from '../components/SupportChat'

const lato = Lato({ 
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Create Custom Forms, Schedule Automated Emails & Track Conversions | PRZIO',
  description: 'Easily engage visitors, track conversions, and grow your business with custom forms, smart email campaigns, and real-time visitor analytics. Create custom forms to engage and convert visitors, schedule and send automated emails to engaged users, track website visitors and conversions in real time, and design custom email templates and pop-ups for your business.',
  keywords: 'email testing tool, popup builder, form builder, nudge builder, email template editor, popup creator, exit intent popup, website popup builder, email testing, HTML email editor, popup marketing, email campaign tool, drag and drop popup builder, conversion popup, lead generation popup, email preview tool, popup designer, email builder, website engagement tool, popup trigger, scroll popup, timeout popup, cookie-based popup, session popup, contact form builder, survey form builder, subscription form, form validation, embedded forms, popup forms, lead capture form, form submission, form data collection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={lato.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <ExternalScripts />
        <SupportChat />
      </body>
    </html>
  )
}



