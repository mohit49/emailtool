'use client';

import { useState } from 'react';
import Link from 'next/link';
import Carousel from './Carousel';
import { 
  Mail, FileText, Layout, Eye, Code, Folder, Settings, Palette, Zap, Target, Plug, CheckCircle, BarChart, Link2, 
  UserCircle, GitBranch, Edit3
} from 'lucide-react';

export default function HomePageClient() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Product carousel slides
  const productSlides = [
    {
      title: 'Email Testing & Editor Tool',
      description: 'Create, test, and send professional email campaigns with our powerful VS Code-like editor. Preview emails in real-time across all devices and email clients.',
      features: [
        'VS Code-like HTML editor with syntax highlighting',
        'Real-time preview on mobile, tablet, and desktop',
        'Bulk email sending with Excel import',
        'Custom SMTP configuration',
        'Template library and folder organization',
        'Collaborative comments and feedback'
      ],
      gradient: 'from-indigo-600 to-purple-600',
      color: 'indigo',
      icon: <Mail className="w-16 h-16" />
    },
    {
      title: 'Form Builder Tool',
      description: 'Build powerful forms with our drag-and-drop form builder. Create subscription forms, contact forms, surveys, and quizzes with automatic validation.',
      features: [
        'Drag-and-drop form builder',
        'Multiple form types (contact, survey, subscription)',
        'Multi-step form support',
        'Automatic form validation',
        'Form data collection and export',
        'Embed forms in popups seamlessly'
      ],
      gradient: 'from-purple-600 to-pink-600',
      color: 'purple',
      icon: <FileText className="w-16 h-16" />
    },
    {
      title: 'Popup Builder Tool',
      description: 'Create engaging popups and nudges with our intuitive builder. Set up smart triggers, exit intent detection, and embed forms for maximum conversions.',
      features: [
        'Drag-and-drop popup builder',
        'Smart triggers (exit intent, scroll, timeout)',
        'Custom CSS and JavaScript support',
        'Easy SDK integration',
        'Form integration in popups',
        'Analytics and metrics tracking'
      ],
      gradient: 'from-pink-600 to-red-600',
      color: 'pink',
      icon: <Layout className="w-16 h-16" />
    }
  ];

  // Features grouped for carousel
  const featureGroups = [
    {
      title: 'Email Testing Features',
      gradient: 'from-indigo-600 to-purple-600',
      color: 'indigo',
      features: [
        { title: 'Interactive Preview', icon: Eye, description: 'See exactly how your email will look in real-time as you edit your HTML code. Preview on mobile, tablet, and desktop views.' },
        { title: 'VS Code Editor', icon: Code, description: 'Write your HTML with a powerful Monaco Editor that provides syntax highlighting, autocomplete, and IntelliSense.' },
        { title: 'Save Templates', icon: Folder, description: 'Save your favorite email templates and organize them in folders. Access them anytime for quick reuse.' },
        { title: 'Bulk Email Sending', icon: Mail, description: 'Send emails to multiple recipients at once. Import recipients from Excel and track sending progress.' },
        { title: 'Custom SMTP', icon: Settings, description: 'Configure multiple SMTP settings for different email accounts. Send emails from your own domain.' }
      ]
    },
    {
      title: 'Popup Building Features',
      gradient: 'from-purple-600 to-pink-600',
      color: 'purple',
      features: [
        { title: 'Drag & Drop Builder', icon: Palette, description: 'Create stunning popups and nudges with our intuitive drag-and-drop editor. No coding required.' },
        { title: 'Smart Popup Triggers', icon: Zap, description: 'Set up popups to trigger on page load, after timeout, scroll percentage, exit intent, or when specific elements appear.' },
        { title: 'Custom CSS & JavaScript', icon: Target, description: 'Add your own custom CSS and JavaScript to popups for complete design control and functionality.' },
        { title: 'Popup SDK Integration', icon: Plug, description: 'Easy-to-integrate JavaScript SDK for your website. Just add one script tag and your popups will work.' },
        { title: 'Analytics & Metrics', icon: BarChart, description: 'Track popup performance with detailed analytics including views, clicks, conversions, and visitor data.' }
      ]
    },
    {
      title: 'Form Builder Features',
      gradient: 'from-pink-600 to-red-600',
      color: 'pink',
      features: [
        { title: 'Form Builder & Integration', icon: FileText, description: 'Create custom forms with our drag-and-drop form builder. Build subscription forms, contact forms, surveys, and quizzes.' },
        { title: 'Automatic Form Validation', icon: CheckCircle, description: 'Built-in form validation ensures data quality. Validate required fields, email formats, numbers, URLs, and more.' },
        { title: 'Multi-Step Forms', icon: GitBranch, description: 'Create multi-step forms for better user experience. Navigate between steps with Next and Previous buttons.' },
        { title: 'Form Data Collection', icon: BarChart, description: 'Collect and manage all form submissions in one place. View submission data, export results, and track form performance.' },
        { title: 'Embed in Popups', icon: Link2, description: 'Embed forms directly into popups with automatic validation. Perfect for lead generation and data collection.' }
      ]
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechStart Inc.',
      content: 'PRZIO has transformed how we create and test email campaigns. The real-time preview and collaborative features save us hours every week.',
      avatar: UserCircle
    },
    {
      name: 'Michael Chen',
      role: 'Frontend Developer',
      company: 'Digital Agency',
      content: 'The VS Code-like editor is exactly what I needed. I can write clean HTML and see instant previews. The popup builder is incredibly powerful too.',
      avatar: UserCircle
    },
    {
      name: 'Emily Rodriguez',
      role: 'Growth Marketer',
      company: 'E-commerce Platform',
      content: 'Our conversion rates increased by 40% after implementing exit intent popups with embedded forms. The form builder makes it so easy to capture leads.',
      avatar: UserCircle
    },
    {
      name: 'David Thompson',
      role: 'Product Manager',
      company: 'SaaS Company',
      content: 'The combination of email testing, form building, and popup creation in one platform is a game-changer. It\'s become an essential tool for our team.',
      avatar: UserCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Section 1: Product Carousel */}
      <section className="w-full bg-orange-400 relative overflow-hidden">
        {/* Faded background icons - different for each slide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {currentSlideIndex === 0 && (
            <Edit3 className="w-[800px] h-[800px] text-white/10 transition-opacity duration-500" />
          )}
          {currentSlideIndex === 1 && (
            <FileText className="w-[800px] h-[800px] text-white/10 transition-opacity duration-500" />
          )}
          {currentSlideIndex === 2 && (
            <Layout className="w-[800px] h-[800px] text-white/10 transition-opacity duration-500" />
          )}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
          <Carousel items={productSlides.map((slide, index) => {
          const colorClasses = {
            indigo: {
              check: 'text-indigo-600',
              button: 'bg-gradient-to-r from-indigo-600 to-purple-600',
              border: 'border-indigo-600',
              text: 'text-indigo-600',
              hover: 'hover:bg-indigo-50'
            },
            purple: {
              check: 'text-purple-600',
              button: 'bg-gradient-to-r from-purple-600 to-pink-600',
              border: 'border-purple-600',
              text: 'text-purple-600',
              hover: 'hover:bg-purple-50'
            },
            pink: {
              check: 'text-pink-600',
              button: 'bg-gradient-to-r from-pink-600 to-red-600',
              border: 'border-pink-600',
              text: 'text-pink-600',
              hover: 'hover:bg-pink-50'
            }
          };
          const colors = colorClasses[slide.color as keyof typeof colorClasses];
          
          return (
            <div key={index} className="rounded-3xl p-12 md:p-16 min-h-[600px] flex flex-col justify-center">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex justify-center mb-8">
                  <div className={`bg-gradient-to-br ${slide.gradient} rounded-2xl p-6 text-white`}>
                    {slide.icon}
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                  {slide.title}
                </h2>
                <p className="text-xl md:text-2xl mb-8 text-white leading-relaxed">
                  {slide.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
                  {slide.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle className="w-6 h-6 mr-3 mt-1 flex-shrink-0 text-white" />
                      <span className="text-lg text-white">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={index === 0 ? "/tool" : index === 1 ? "/forms" : "/popups"}
                    className={`px-8 py-4 ${colors.button} text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-all shadow-lg`}
                  >
                    View More
                  </Link>
                  <Link
                    href="/signup"
                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all"
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </div>
          );
        })} onSlideChange={setCurrentSlideIndex} />
        </div>
      </section>

      {/* Section 2: About Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">PRZIO</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&apos;re on a mission to make email template creation, form building, and popup creation simple, 
            powerful, and accessible to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              PRZIO was born from a simple need: making email template creation, form building, and popup creation 
              as easy as possible. We believe that everyone, regardless of technical expertise, should be able to 
              create beautiful, responsive email templates, powerful forms, and engaging popups.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h3>
            <p className="text-gray-600 leading-relaxed">
              Whether you&apos;re a marketer sending newsletters, a developer building email systems, or a designer 
              creating email campaigns, our platform provides the tools you need to succeed. We combine the power 
              of professional code editors with intuitive interfaces to give you the best of both worlds.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/about"
            className="text-indigo-600 hover:text-indigo-700 font-semibold text-lg"
          >
            Learn More About Us →
          </Link>
        </div>
      </section>

      {/* Section 3: Powerful Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features for <strong>Email Testing</strong>, <strong>Popup Building</strong> & <strong>Form Builder</strong>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create, test, and send professional email campaigns, engaging popups, and powerful forms
          </p>
        </div>

        {/* Email Testing Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                <Eye className="w-12 h-12" />
              </div>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              {featureGroups[0].title}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureGroups[0].features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-4 text-indigo-600">
                    <IconComponent className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popup Building Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                <Palette className="w-12 h-12" />
              </div>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              {featureGroups[1].title}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureGroups[1].features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-4 text-purple-600">
                    <IconComponent className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Builder Features */}
        <div>
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-pink-600 to-red-600 rounded-2xl p-6 text-white">
                <FileText className="w-12 h-12" />
              </div>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              {featureGroups[2].title}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureGroups[2].features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-4 text-pink-600">
                    <IconComponent className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in minutes with our simple process for Email Testing, Form Building, and Popup Creation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Create Your Account</h3>
            <p className="text-gray-600 leading-relaxed">
              Sign up for free in seconds. Verify your email and you&apos;re ready to start creating amazing 
              email templates, forms, and popups.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Build & Design</h3>
            <p className="text-gray-600 leading-relaxed">
              Use our powerful tools to create email templates with the HTML editor, build forms with the 
              drag-and-drop builder, and design popups with custom triggers. Preview everything in real-time.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-pink-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Deploy & Track</h3>
            <p className="text-gray-600 leading-relaxed">
              Send your emails, embed your forms, and integrate your popups with our easy SDK. 
              Track performance, collect data, and optimize your campaigns.
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

      {/* Perfect For Everyone Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Perfect For Everyone
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you&apos;re a marketer, developer, or designer, we&apos;ve got you covered with email testing, popup building, and form creation tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-10 text-white">
            <h3 className="text-3xl font-bold mb-4">For Marketers</h3>
            <p className="text-lg mb-6 opacity-90">
              Create stunning email campaigns without coding. Use our pre-built templates 
              or customize them to match your brand. Build forms and popups to capture leads.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                Pre-built email templates
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                Lead generation forms
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                Exit intent popups
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl p-10 text-white">
            <h3 className="text-3xl font-bold mb-4">For Developers</h3>
            <p className="text-lg mb-6 opacity-90">
              Write clean HTML code with our VS Code-like editor. Test email rendering 
              across different clients and devices. Build custom popups with advanced triggers and JavaScript SDK integration.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                Advanced HTML editor
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                Popup SDK integration
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                Custom CSS & JavaScript
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-10 text-white">
            <h3 className="text-3xl font-bold mb-4">For Growth Marketers</h3>
            <p className="text-lg mb-6 opacity-90">
              Create conversion-focused popups and email campaigns. Use exit intent popups, 
              scroll triggers, and smart timing to capture leads and boost engagement.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                Exit intent popups
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                Lead generation forms
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                Smart trigger options
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied users who are creating amazing email campaigns, forms, and popups
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => {
            const AvatarIcon = testimonial.avatar;
            return (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white mr-4">
                  <AvatarIcon className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-gray-600">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                &quot;{testimonial.content}&quot;
              </p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who are already creating amazing email campaigns, forms, and engaging popups. 
            Start for free today and boost your conversions!
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
    </div>
  );
}

