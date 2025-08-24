'use client';

import Link from 'next/link';
import { ReactNode, useState } from 'react';

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      {/* Marketing Header - Hikari-inspired design */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="flex items-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-full shadow-sm group-hover:shadow-md transition-all duration-200">
                  <img 
                    src="/assets/circle-pink.svg" 
                    alt="Show up or Else" 
                    className="h-5 w-5 mr-2"
                  />
                  <span className="font-bold text-sm uppercase tracking-wide">Show Up</span>
                </div>
              </Link>
            </div>
            
            {/* Center Navigation Links */}
            <nav className="flex items-center space-x-8">
              <Link 
                href="#features" 
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
              >
                Features
              </Link>
              <Link 
                href="#pricing" 
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
              >
                Pricing
              </Link>
              <Link 
                href="#about" 
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
              >
                About
              </Link>
              <Link 
                href="/privacy" 
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
              >
                Privacy
              </Link>
            </nav>

            {/* Right side - Login and Sign Up */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-between">
            {/* Mobile Logo */}
            <Link href="/" className="flex items-center">
              <div className="flex items-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2.5 py-1 rounded-full shadow-sm">
                <img 
                  src="/assets/circle-pink.svg" 
                  alt="Show up or Else" 
                  className="h-4 w-4 mr-1.5"
                />
                <span className="font-bold text-xs uppercase tracking-wide">Show Up</span>
              </div>
            </Link>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-3">
              <Link 
                href="#features" 
                className="block text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#pricing" 
                className="block text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="#about" 
                className="block text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/privacy" 
                className="block text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Privacy
              </Link>
            </div>
            
            {/* Mobile Action Buttons */}
            <div className="pt-4 border-t border-gray-200/50 space-y-3">
              <Link 
                href="/login" 
                className="block w-full text-center text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="block w-full text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 sm:px-0">
        {children}
      </main>

      {/* Marketing Footer */}
      <footer className="bg-gray-100 text-gray-600 py-8 px-4 sm:px-32" role="contentinfo">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs">
            <span>Show Up or Else © 2025</span>
            <Link 
              href="/privacy" 
              className="hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded px-1 py-0.5"
              aria-label="Read our Privacy Policy"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded px-1 py-0.5"
              aria-label="Read our Terms of Service"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
