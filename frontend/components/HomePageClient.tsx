'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Mail, FileText, Eye, Code, Folder, Settings, Palette, Zap, Target, Plug, CheckCircle, BarChart, Link2, 
  UserCircle, GitBranch, Edit3
} from 'lucide-react';

// Typing Animation Component
function TypingAnimation({ texts, speed = 100, deleteSpeed = 50, pauseTime = 2000, lineDelay = 1000 }: { 
  texts: string[], 
  speed?: number, 
  deleteSpeed?: number,
  pauseTime?: number,
  lineDelay?: number
}) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    
    const currentFullText = texts[currentTextIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (charIndex < currentFullText.length) {
          setCurrentText(currentFullText.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Finished typing, pause then start deleting
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, pauseTime);
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setCurrentText(currentFullText.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          // Finished deleting, add delay before moving to next text
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(false);
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
            setCharIndex(0);
          }, lineDelay);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, isPaused, currentTextIndex, texts, speed, deleteSpeed, pauseTime, lineDelay]);

  return (
    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 text-left leading-tight">
      <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
        {currentText}
      </span>
      <span className="inline-block w-0.5 h-[0.9em] bg-gradient-to-r from-orange-500 to-red-600 ml-1 align-middle animate-[blink_1s_infinite]"></span>
    </h1>
  );
}

export default function HomePageClient() {
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTooltipPosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setTooltipPosition({
          top: 0, // Not needed for absolute positioning
          left: 0, // Not needed for absolute positioning
          width: rect.width,
        });
      }
    };

    updateTooltipPosition();
    window.addEventListener('resize', updateTooltipPosition);

    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
    };
  }, []);

  // Typing animation texts
  const typingTexts = [
    'Create custom forms to engage and convert visitors',
    'Schedule and send automated emails to engaged users',
    'Track website visitors and conversions in real time',
    'Design custom email templates and pop-ups for your business'
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
    <div className="min-h-screen bg-blue-50">
      {/* Section 1: Hero with Typing Animation */}
      <section className="w-full bg-blue-50 relative overflow-hidden">
        {/* Main header background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/main-heade-bg.jpg"
            alt="Main header background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
          <div className="rounded-3xl py-12 px-0 md:py-16 md:px-0 min-h-[600px] flex flex-col justify-center relative w-full md:w-[50%]">
            {/* Text content on top */}
            <div className="relative z-10 max-w-4xl text-left">
              <TypingAnimation texts={typingTexts} speed={50} deleteSpeed={30} pauseTime={1000} lineDelay={1500} />
              <p className="text-xl md:text-2xl text-gray-700 mt-6 mb-8 leading-relaxed font-light">
                Easily engage visitors, track conversions, and grow your business with custom forms, smart email campaigns, and real-time visitor analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-start mt-8 relative">
                <div ref={buttonRef} className="inline-block">
                  <Link
                    href="/signup"
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg inline-block"
                  >
                    Get Started Free
                  </Link>
                </div>
                {/* Animated gradient tooltip */}
                {tooltipPosition && (
                  <div 
                    className="absolute top-full left-0 mt-3 pointer-events-none w-full animate-slide-bounce"
                  >
                    {/* Arrow pointing to button */}
                    <div className="absolute -top-2 left-8 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-black"></div>
                    <div className="bg-black rounded-lg px-4 py-3 shadow-lg animate-pulse-glow">
                      <p className="text-sm md:text-base text-white font-medium">
                        Create your Popup, Email Templates, and Forms now - totally free! Track conversions in real-time.
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    const nextSection = document.getElementById('about-section');
                    if (nextSection) {
                      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="inline-block p-[2px] bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all cursor-pointer"
                >
                  <span className="block px-8 py-4 bg-blue-50 rounded-lg">
                    <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent font-semibold text-lg">Learn More</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: About Us */}
      <section id="about-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-blue-50">
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
            className="inline-block p-[2px] bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
          >
            <span className="block px-6 py-3 bg-blue-50 rounded-lg">
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent font-semibold text-lg">Learn More About Us →</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Section 3: Powerful Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-blue-50">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-blue-50">
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
            className="inline-block p-[2px] bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
          >
            <span className="block px-6 py-3 bg-blue-50 rounded-lg">
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent font-semibold text-lg">Learn More →</span>
            </span>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-blue-50">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-blue-50">
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
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="/about"
              className="inline-block p-[2px] bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
            >
              <span className="block px-8 py-4 bg-white rounded-lg">
                <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent font-semibold text-lg">Learn More About Us</span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

