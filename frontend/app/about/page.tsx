'use client';

import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />

      {/* Hero Section with Full Screen Background */}
      <section className="w-full relative overflow-hidden min-h-[30vh] md:min-h-[35vh] lg:min-h-[40vh] flex items-center">
        {/* Full screen background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/main-heade-bg.jpg"
            alt="About background"
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
                About PRZIO
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md px-4">
              The all-in-one platform for <strong>email template testing</strong>, <strong>popup builder</strong>, and <strong>form builder</strong> integration. 
              Create, test, and deploy powerful marketing tools with ease.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            <strong>PRZIO</strong> is the comprehensive platform for <strong>email template testing</strong>, <strong>popup builder</strong>, and <strong>form builder</strong> solutions. 
            We empower marketers, developers, and businesses to create, test, and deploy professional <strong>email templates</strong>, 
            engaging <strong>popup campaigns</strong>, and powerful <strong>form integrations</strong> without technical complexity.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Our platform combines three powerful tools: <strong>Email Template Builder</strong> for creating and testing responsive email designs, 
            <strong>Popup Builder</strong> for building conversion-optimized popups, and <strong>Form Builder</strong> for seamless form integration. 
            Whether you&apos;re sending transactional emails, creating marketing campaigns, or collecting leads, <strong>PRZIO</strong> provides 
            everything you need in one integrated solution.
          </p>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three powerful tools integrated into one platform for complete marketing automation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Email Template Builder</h3>
            <p className="text-gray-600 leading-relaxed">
              Create and test responsive <strong>email templates</strong> with our professional HTML editor. 
              Send bulk emails, test across email clients, and integrate with your <strong>SMTP server</strong>. 
              Perfect for transactional emails, newsletters, and marketing campaigns.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Popup Builder</h3>
            <p className="text-gray-600 leading-relaxed">
              Build conversion-optimized <strong>popups</strong> and <strong>popup campaigns</strong> with our drag-and-drop builder. 
              Create exit-intent popups, welcome modals, and promotional overlays. Integrate easily with our <strong>popup SDK</strong> 
              and track performance metrics in real-time.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Form Builder</h3>
            <p className="text-gray-600 leading-relaxed">
              Design and integrate powerful <strong>forms</strong> for lead generation and data collection. 
              Our <strong>form builder</strong> provides seamless integration with your website, automatic email notifications, 
              and comprehensive form submission management.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Why Choose <span className="font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">PRZIO</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The complete solution for <strong>email testing</strong>, <strong>popup integration</strong>, and <strong>form builder</strong> needs
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Easy Integration</h3>
              <p className="text-gray-600 leading-relaxed">
                Integrate <strong>PRZIO email SDK</strong>, <strong>popup SDK</strong>, and <strong>form builder</strong> into your website in minutes. 
                Simple JavaScript integration with comprehensive documentation. No complex setup required.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Real-Time Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track <strong>email open rates</strong>, <strong>popup conversion metrics</strong>, and <strong>form submission analytics</strong> in real-time. 
                Monitor performance, optimize campaigns, and make data-driven decisions.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Secure & Reliable</h3>
              <p className="text-gray-600 leading-relaxed">
                Enterprise-grade security for your <strong>email templates</strong>, <strong>popup data</strong>, and <strong>form submissions</strong>. 
                Your data is encrypted, backed up, and never shared with third parties.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">All-in-One Platform</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage <strong>email templates</strong>, <strong>popups</strong>, and <strong>forms</strong> from one dashboard. 
                No need for multiple tools or integrations. Everything you need for email marketing, lead generation, 
                and conversion optimization in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Have Questions?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            We&apos;re here to help! Reach out to us anytime and we&apos;ll get back to you as soon as possible.
          </p>
          <a
            href="mailto:support@przio.com"
            className="inline-block px-8 py-4 bg-white text-orange-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg"
          >
            Contact Support
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

