'use client';

import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Layout, FileText, ArrowRight, CheckCircle } from 'lucide-react';

export default function IntegrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />

      {/* Hero Section with Full Screen Background */}
      <section className="w-full relative overflow-hidden min-h-[30vh] md:min-h-[35vh] lg:min-h-[40vh] flex items-center">
        {/* Full screen background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/main-heade-bg.jpg"
            alt="Integration background"
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
                PRZIO Integration
              </span>
              <br />
              <span className="text-white">Complete Setup Guide</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md px-4">
              Learn how to integrate <strong>PRZIO email testing</strong>, <strong>popup builder</strong>, and <strong>form builder</strong> into your website. 
              Follow our step-by-step tutorials to get started in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Integration Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-8 lg:pt-24 pb-8 md:pb-16 lg:pb-20 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-8 lg:mb-5">
          {/* Email Integration */}
          <Link href="/integration/email" className="group">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Integration</h2>
              <p className="text-gray-600 mb-6">
                Integrate <strong>PRZIO email testing</strong> and <strong>bulk email sending</strong> into your application. 
                Learn how to send transactional emails, marketing campaigns, and test email templates.
              </p>
              <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Popup Integration */}
          <Link href="/integration/popup" className="group">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <Layout className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Popup Integration</h2>
              <p className="text-gray-600 mb-6">
                Add <strong>conversion popups</strong>, <strong>exit intent popups</strong>, and <strong>lead generation popups</strong> to your website. 
                Complete guide for popup builder integration with triggers and targeting.
              </p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Form Integration */}
          <Link href="/integration/form" className="group">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Form Integration</h2>
              <p className="text-gray-600 mb-6">
                Integrate <strong>contact forms</strong>, <strong>lead capture forms</strong>, and <strong>survey forms</strong> into your website. 
                Learn form builder integration with validation and multi-step forms.
              </p>
              <div className="flex items-center text-pink-600 font-semibold group-hover:translate-x-2 transition-transform">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Start Overview</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Create Your Account</h3>
                <p className="text-gray-600">
                  Sign up for a free <strong>PRZIO account</strong> and verify your email address to get started.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Create a Project</h3>
                <p className="text-gray-600">
                  Create a new <strong>project</strong> in your dashboard to organize your email templates, popups, and forms.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-pink-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Configure Settings</h3>
                <p className="text-gray-600">
                  Set up your <strong>SMTP settings</strong> for email sending, configure <strong>API keys</strong> for integrations, 
                  and customize your project settings.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Choose Your Integration</h3>
                <p className="text-gray-600">
                  Select the integration type you need: <strong>Email integration</strong>, <strong>Popup integration</strong>, 
                  or <strong>Form integration</strong>, and follow the detailed tutorial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Integrate PRZIO?</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  <strong>Unified platform</strong> for email, popup, and form management
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  <strong>Easy integration</strong> with JavaScript SDK and REST API
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  <strong>Real-time testing</strong> and preview capabilities
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  <strong>Scalable infrastructure</strong> for high-volume sending
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Integration Methods</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  <strong>JavaScript SDK</strong> - Easy client-side integration
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  <strong>REST API</strong> - Server-side integration with full control
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  <strong>WordPress Plugin</strong> - One-click WordPress integration
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">
                  <strong>Webhooks</strong> - Real-time event notifications
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
