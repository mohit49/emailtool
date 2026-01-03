import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'About Us - PRZIO',
  description: 'Learn about PRZIO, our mission, and how we help marketers and developers create amazing email campaigns.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            About <span className="font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">PRZIO</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&apos;re on a mission to make email template creation and testing simple, 
            powerful, and accessible to everyone.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            PRZIO was born from a simple need: making email template creation 
            and testing as easy as possible. We believe that everyone, regardless of technical 
            expertise, should be able to create beautiful, responsive email templates.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Whether you&apos;re a marketer sending newsletters, a developer building email systems, 
            or a designer creating email campaigns, our platform provides the tools you need 
            to succeed. We combine the power of professional code editors with intuitive 
            interfaces to give you the best of both worlds.
          </p>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What We Offer
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Professional Tools</h3>
            <p className="text-gray-600 leading-relaxed">
              Our VS Code-like editor provides syntax highlighting, autocomplete, and all the 
              features you&apos;d expect from a professional development environment. Write clean, 
              maintainable HTML code with confidence.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Real-Time Preview</h3>
            <p className="text-gray-600 leading-relaxed">
              See your email templates come to life as you type. Preview on mobile, tablet, 
              and desktop views to ensure your emails look perfect on every device and email client.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Bulk Email Sending</h3>
            <p className="text-gray-600 leading-relaxed">
              Send emails to hundreds or thousands of recipients with ease. Import recipients 
              from Excel, organize them in folders, and track your sending progress in real-time.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Custom SMTP</h3>
            <p className="text-gray-600 leading-relaxed">
              Use your own SMTP servers to send emails from your domain. Maintain full control 
              over your email delivery and branding while leveraging our powerful template system.
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
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Fast & Efficient</h3>
              <p className="text-gray-600 leading-relaxed">
                Built with performance in mind. Our platform loads quickly, saves your work automatically, 
                and provides instant previews. No more waiting around for your templates to render.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600 leading-relaxed">
                Your data is encrypted and stored securely. We never share your templates or 
                recipient information with third parties. Your privacy is our priority.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Built for Teams</h3>
              <p className="text-gray-600 leading-relaxed">
                Organize your templates in folders, manage recipients efficiently, and collaborate 
                with your team. Share templates and work together seamlessly.
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
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Always Improving</h3>
              <p className="text-gray-600 leading-relaxed">
                We&apos;re constantly adding new features and improvements based on user feedback. 
                Our platform evolves with your needs, ensuring you always have the best tools available.
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

