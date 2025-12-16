import Link from 'next/link';
import Navigation from '../components/Navigation';
import HomeRedirect from '../components/HomeRedirect';
import Footer from '../components/Footer';

export const metadata = {
  title: 'PRZIO - Test & Preview HTML Email Templates',
  description: 'Create, preview, and test your HTML email templates with our powerful email testing tool. Perfect for marketers, developers, and designers.',
  keywords: 'email testing, email template, HTML email, email preview, email design',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <HomeRedirect />
      <Navigation />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Test Your Email
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Templates with Ease
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create, preview, and save your HTML email templates. Test how your emails look
            across different devices and email clients before sending them to your audience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started Free
            </Link>
            <Link
              href="/how-it-works"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-all shadow-md"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features for Email Testing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create, test, and send professional email campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Live Preview</h3>
            <p className="text-gray-600 leading-relaxed">
              See exactly how your email will look in real-time as you edit your HTML code. 
              Preview on mobile, tablet, and desktop views to ensure perfect rendering across all devices.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">VS Code Editor</h3>
            <p className="text-gray-600 leading-relaxed">
              Write your HTML with a powerful Monaco Editor that provides syntax highlighting, 
              autocomplete, and IntelliSense. Just like Visual Studio Code, right in your browser.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-pink-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Save Templates</h3>
            <p className="text-gray-600 leading-relaxed">
              Save your favorite email templates and organize them in folders. 
              Access them anytime for quick reuse and share with your team.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Bulk Email Sending</h3>
            <p className="text-gray-600 leading-relaxed">
              Send emails to multiple recipients at once. Import recipients from Excel, 
              organize them in folders, and track sending progress in real-time.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
            <p className="text-gray-600 leading-relaxed">
              Your templates and data are stored securely. Use your own SMTP settings 
              for complete control over email delivery and branding.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Custom SMTP</h3>
            <p className="text-gray-600 leading-relaxed">
              Configure multiple SMTP settings for different email accounts. 
              Send emails from your own domain with full control over sender information.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in minutes with our simple 3-step process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Create Your Account</h3>
            <p className="text-gray-600 leading-relaxed">
              Sign up for free in seconds. Verify your email and you're ready to start creating amazing email templates.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Design Your Template</h3>
            <p className="text-gray-600 leading-relaxed">
              Use our powerful HTML editor to create your email template. Preview it in real-time 
              and see how it looks on different devices.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-pink-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Send & Track</h3>
            <p className="text-gray-600 leading-relaxed">
              Configure your SMTP settings, select recipients, and send your emails. 
              Track delivery status and manage your campaigns all in one place.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/how-it-works"
            className="text-indigo-600 hover:text-indigo-700 font-semibold text-lg"
          >
            Learn More →
          </Link>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Perfect For Everyone
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you're a marketer, developer, or designer, we've got you covered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-10 text-white">
            <h3 className="text-3xl font-bold mb-4">For Marketers</h3>
            <p className="text-lg mb-6 opacity-90">
              Create stunning email campaigns without coding. Use our pre-built templates 
              or customize them to match your brand. Send to thousands of recipients with ease.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Pre-built email templates
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Bulk email sending
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Recipient management
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl p-10 text-white">
            <h3 className="text-3xl font-bold mb-4">For Developers</h3>
            <p className="text-lg mb-6 opacity-90">
              Write clean HTML code with our VS Code-like editor. Test email rendering 
              across different clients and devices. Integrate with your own SMTP servers.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced HTML editor
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Custom SMTP integration
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                API access
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who are already creating amazing email campaigns. 
            Start for free today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
