'use client';

import React from 'react';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProfileDropdown from '../components/ProfileDropdown';
import { useAuth } from '../contexts/AuthContext';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    console.log('AppLayout: Auth state changed - user:', user, 'loading:', loading);
    if (!loading && !user) {
      console.log('AppLayout: No user found, redirecting to login');
      // Add a small delay to prevent race conditions
      setTimeout(() => {
        router.push('/login');
      }, 100);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // Get first name only
  const firstName = user?.name?.split(' ')[0] || 'User';

  // Navigation items with active state
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'Past Events', href: '/dashboard/past-events', icon: 'clock' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'plus':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'clock':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-20">
          <div className="flex items-center justify-between h-16 sm:h-20 py-2">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center group">
                <img 
                  src="/assets/circle-pink.svg" 
                  alt="Show up or Else" 
                  className="h-8 w-8 sm:h-12 sm:w-12 transition-transform group-hover:scale-105"
                />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-pink-50 text-pink-700 border border-pink-200 shadow-sm'
                        : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className="mr-2">{getIcon(item.icon)}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Profile Dropdown */}
              <div className="hidden md:block">
                <ProfileDropdown 
                  userName={user?.name || 'User'}
                  userEmail={user?.email || ''}
                  onLogout={handleLogout}
                />
              </div>

              {/* Mobile Profile Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors"
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle mobile menu"
                >
                  {/* User Avatar */}
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-sm font-semibold text-white">
                      {firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Menu Icon */}
                  <svg className={`w-5 h-5 text-gray-500 ml-2 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="px-4 py-6 space-y-4">
                {/* User Profile Section */}
                <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">
                      {firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-semibold text-gray-900 truncate">{user?.name || 'User'}</div>
                    <div className="text-sm text-gray-500 truncate">{user?.email || ''}</div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-3">
                  {navigationItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 ${
                          active
                            ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 border border-pink-200 shadow-sm'
                            : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className="mr-4 text-pink-500">{getIcon(item.icon)}</span>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Additional Mobile Actions */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center px-4 py-4 text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </Link>

                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-4 text-left text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 xl:px-12">
        {children}
      </main>
    </div>
  );
}
