'use client';

import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import Image from 'next/image';
import { Mail, MessageCircle, HelpCircle, Book, FileText, Ticket } from 'lucide-react';
import TicketList from '../../components/TicketList';
import { useAuth } from '../../app/providers/AuthProvider';

export default function SupportPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />

      {/* Hero Section with Full Screen Background */}
      <section className="w-full relative overflow-hidden min-h-[30vh] md:min-h-[35vh] lg:min-h-[40vh] flex items-center">
        {/* Full screen background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/main-heade-bg.jpg"
            alt="Support background"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10 relative z-10 w-full">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 drop-shadow-lg">
              <span className="bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
                Support Center
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md px-4">
              We&apos;re here to help! Get assistance with <strong>email templates</strong>, <strong>popup builder</strong>, 
              <strong>form integration</strong>, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Help Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-8 lg:pt-24 pb-8 md:pb-16 lg:pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link href="/integration" className="group">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <Book className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Integration Guides</h3>
              <p className="text-gray-600 leading-relaxed">
                Step-by-step tutorials for <strong>email SDK</strong>, <strong>popup SDK</strong>, and <strong>form builder</strong> integration.
              </p>
            </div>
          </Link>

          <Link href="/third-party-integration" className="group">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">API Documentation</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete API reference and code examples for developers integrating <strong>PRZIO</strong> into their applications.
              </p>
            </div>
          </Link>

          <Link href="/support/raise-ticket" className="group">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Raise a Ticket</h3>
              <p className="text-gray-600 leading-relaxed">
                Create a support ticket to get help with <strong>email templates</strong>, <strong>popup builder</strong>, 
                <strong>form integration</strong>, or any other issues.
              </p>
            </div>
          </Link>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl p-12 shadow-lg mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have a question or need help? We&apos;re here to assist you with any issues related to 
              <strong> email templates</strong>, <strong>popups</strong>, or <strong>forms</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Email Support</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Send us an email and we&apos;ll get back to you as soon as possible.
              </p>
              <a
                href="mailto:support@przio.com"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                support@przio.com
              </a>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Quick Query</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Have a quick question? Open our live chat and get instant help from our support team.
              </p>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openSupportChat'));
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
                Open Chat
              </button>
            </div>
          </div>
        </div>

        {/* Support Tickets Section - Only for logged-in users */}
        {user && (
          <div className="bg-white rounded-2xl p-12 shadow-lg mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Support Tickets</h2>
                <p className="text-gray-600">
                  Create and manage your support tickets. Track the status and communicate with our support team.
                </p>
              </div>
              <Link
                href="/support/raise-ticket"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-md"
              >
                <Ticket className="w-5 h-5" />
                Raise a Ticket
              </Link>
            </div>
            <TicketList />
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                How do I integrate PRZIO email templates into my website?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                You can integrate <strong>PRZIO email SDK</strong> by adding our JavaScript SDK to your website. 
                Visit our <Link href="/integration/email" className="text-indigo-600 hover:underline">Email Integration Guide</Link> for 
                step-by-step instructions and code examples.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                How do I create and deploy popups?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Use our <strong>Popup Builder</strong> to design your popup, then integrate it using our <strong>popup SDK</strong>. 
                Check out our <Link href="/integration/popup" className="text-indigo-600 hover:underline">Popup Integration Guide</Link> for 
                detailed instructions on setting up popup campaigns.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Can I use my own SMTP server?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! <strong>PRZIO</strong> supports custom <strong>SMTP configuration</strong>. You can add your SMTP settings in the 
                project settings to send emails from your own domain. This ensures better deliverability and brand consistency.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                How do I integrate forms into my website?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our <strong>Form Builder</strong> allows you to create forms and integrate them easily. 
                Follow our <Link href="/integration/form" className="text-indigo-600 hover:underline">Form Integration Guide</Link> to 
                learn how to embed forms and manage form submissions.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Is there a WordPress plugin available?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! We offer a <strong>WordPress plugin</strong> that makes it easy to integrate <strong>PRZIO popups</strong> and 
                <strong> email templates</strong> into your WordPress site. The plugin is available for download and includes 
                easy configuration options.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                How do I track email performance?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>PRZIO</strong> provides comprehensive analytics for your <strong>email campaigns</strong>. You can track 
                open rates, click rates, and delivery status directly from your dashboard. All metrics are updated in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
