import Link from 'next/link';
import { ReactNode } from 'react';

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Marketing Header */}
      <header className="bg-white px-4 sm:px-32 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/logo-stacked.svg" 
                alt="Show up or Else" 
                className="h-8 sm:h-12 w-auto"
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-12">
            <Link href="/login" className="text-pink-500 font-bold hover:text-pink-600 transition-colors px-6 py-2 rounded-full border-2 border-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-200">
              Login
            </Link>
            <Link href="/signup" className="bg-pink-500 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-600 transition-colors">
              Sign Up
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-0">
        {children}
      </main>

      {/* Marketing Footer */}
      <footer className="bg-pink-600 text-white py-16 px-4 sm:px-32">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 marketing-heading">Be there or be square</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm">
            <span>Show Up or Else © 2025</span>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
