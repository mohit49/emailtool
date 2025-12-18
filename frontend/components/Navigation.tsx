'use client';

import { useAuth } from '../app/providers/AuthProvider';
import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              PRZIO
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
              About
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
              How It Works
            </Link>
            {user && (
              <Link href="/third-party-integration" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Integration
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
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <Link
                href="/projects"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
              >
                My Projects
              </Link>
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
              <Link href="/about" className="text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                How It Works
              </Link>
              {user && (
                <Link href="/third-party-integration" className="text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Integration
                </Link>
              )}
              {!user ? (
                <>
                  <Link href="/login" className="text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/signup" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium text-center" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              ) : (
                <Link href="/projects" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium text-center" onClick={() => setMobileMenuOpen(false)}>
                  My Projects
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

