'use client';

import { useAuth } from '../app/providers/AuthProvider';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
    setUserDropdownOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/assets/logo-web.png" 
                alt="PRZIO Logo" 
                width={120} 
                height={40}
                className="h-8 md:h-10 w-auto"
                priority
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
              How It Works
            </Link>
            <Link href="/integration" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
              Integration
            </Link>
            {user && (
              <Link href="/third-party-integration" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                API Docs
              </Link>
            )}
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-colors shadow-md"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-colors shadow-md"
                >
                  <span>{user?.name || 'User'}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/projects"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Go to Projects
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-indigo-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                How It Works
              </Link>
              <Link href="/integration" className="text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                Integration
              </Link>
              {user && (
                <Link href="/third-party-integration" className="text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  API Docs
                </Link>
              )}
              {!user ? (
                <>
                  <Link href="/login" className="text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/signup" className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium text-center hover:from-orange-600 hover:to-red-700 transition-colors shadow-md" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="space-y-2">
                  <Link 
                    href="/projects" 
                    className="block px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium text-center hover:from-orange-600 hover:to-red-700 transition-colors shadow-md" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Go to Projects
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full px-6 py-2 text-gray-700 font-medium text-center hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

