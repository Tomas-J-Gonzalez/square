import Link from 'next/link';
import { ReactNode, useState } from 'react';

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      {/* Marketing Header */}
      <header className="bg-white px-4 sm:px-32 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/assets/logo-nav.svg" 
                alt="Show up or Else" 
                className="h-6 sm:h-8 w-auto"
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/login" className="btn btn-secondary border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white px-6 py-2">
              Login
            </Link>
            <Link href="/signup" className="btn btn-primary px-8 py-3 font-semibold shadow-md hover:shadow-lg">
              Sign Up
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-gray-900"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <Link 
              href="/login" 
              className="block w-full text-center btn btn-secondary border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white px-6 py-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="block w-full text-center btn btn-primary px-6 py-3 font-semibold shadow-md hover:shadow-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 sm:px-0">
        {children}
      </main>

      {/* Marketing Footer */}
      <footer className="bg-gray-100 text-gray-600 py-8 px-4 sm:px-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs">
            <span>Show Up or Else © 2025</span>
            <Link href="/privacy" className="hover:text-gray-800 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-800 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
