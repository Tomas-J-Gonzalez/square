import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Use <img> for external Supabase Storage assets to avoid next/image domain allowlist issues
import { getAssetUrl } from '../utils/assetUrl';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../hooks/useModal';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
const logoPath = '/logo.svg?v=1';

const MainLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const { currentUser, logout, isAdmin } = useAuth();
  const { modal, showConfirmModal } = useModal();

  const isActive = (path) => router.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [router.pathname]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
        if (isUserMenuOpen) {
          setIsUserMenuOpen(false);
        }
      }
    };

    if (isMobileMenuOpen || isUserMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isUserMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    showConfirmModal(
      'Sign Out',
      'Are you sure you want to sign out?',
      () => {
        logout();
        router.push('/login');
      },
      () => {}
    );
  };

  const isAdminUserDisplay = isAdmin || currentUser?.id === 'admin' || currentUser?.email === 'admin@example.com' || currentUser?.name === 'Administrator';

  return (
    <div className="min-h-screen bg-white">
      <a href="#main" className="skip-link">Skip to content</a>
      {/* Header */}
      <header className="header" role="banner">
        <div className="header-container">
          <div className="header-content">
            {/* Logo */}
            <Link href="/" className="logo" aria-label="Go to home page">
              <img src={logoPath} alt="Show Up or Else" width="32" height="32" className="mr-8" onError={(e)=>{ e.currentTarget.src='/favicon.png?v=1'; }} />
            </Link>

            {/* Desktop Navigation (centered) */}
            <nav className="nav-desktop flex-1" role="navigation" aria-label="Main navigation">
              <ul className="flex items-center justify-center gap-32 list-none m-0 p-0">
                <li>
                  <Link
                    href="/"
                    className={`nav-link ${isActive('/') ? 'active' : ''}`}
                    aria-current={isActive('/') ? 'page' : undefined}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create"
                    className={`nav-link ${isActive('/create') ? 'active' : ''}`}
                    aria-current={isActive('/create') ? 'page' : undefined}
                  >
                    Create Event
                  </Link>
                </li>
                <li>
                  <Link
                    href="/past"
                    className={`nav-link ${isActive('/past') ? 'active' : ''}`}
                    aria-current={isActive('/past') ? 'page' : undefined}
                  >
                    Past Events
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Right controls (user menu + mobile toggle) aligned right and close together */}
            <div className="ml-auto flex items-center gap-8">
              {/* User Menu */}
              <div className="user-menu">
                <button
                  onClick={toggleUserMenu}
                  className="user-menu-button"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                  type="button"
                >
                  {!isAdminUserDisplay && (
                    <div className="user-avatar">
                      <span>
                        {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {currentUser?.name || 'User'}
                    {(isAdminUserDisplay) && <span className="ml-1 text-xs text-pink-600">(Admin)</span>}
                  </span>
                  <Icon 
                    name="chevron-down" 
                    style="solid" 
                    size="sm" 
                    className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <p className="user-name">{currentUser?.name}</p>
                      <p className="user-email">{currentUser?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="user-menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Icon name="user" style="solid" size="sm" />
                      Profile
                    </Link>
                    <Link
                      href="/profile"
                      className="user-menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Icon name="cog" style="solid" size="sm" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="user-menu-item danger"
                      type="button"
                    >
                      <Icon name="sign-out-alt" style="solid" size="sm" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="nav-mobile-toggle"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                type="button"
              >
                <Icon 
                  name={isMobileMenuOpen ? 'times' : 'bars'} 
                  style="solid" 
                  size="md" 
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav 
            id="mobile-menu"
            className={`nav-mobile ${isMobileMenuOpen ? 'active' : ''}`}
            role="navigation"
            aria-label="Mobile navigation"
            aria-hidden={!isMobileMenuOpen}
          >
            <ul className="nav-mobile-content list-none m-0 p-0">
              <li>
                <Link
                  href="/"
                  className={`nav-link ${isActive('/') ? 'active' : ''}`}
                  aria-current={isActive('/') ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/create"
                  className={`nav-link ${isActive('/create') ? 'active' : ''}`}
                  aria-current={isActive('/create') ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Event
                </Link>
              </li>
              <li>
                <Link
                  href="/past"
                  className={`nav-link ${isActive('/past') ? 'active' : ''}`}
                  aria-current={isActive('/past') ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Past Events
                </Link>
              </li>
              <li className="border-t border-gray-200 mt-4 pt-4">
                <Link
                  href="/profile"
                  className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                  aria-current={isActive('/profile') ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile Settings
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="nav-link text-left w-full"
                  type="button"
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main" role="main">{children}</main>
      {/* Footer */}
      <footer className="mt-32 py-16">
        <div className="text-center text-xs text-gray-400 space-x-12">
          <Link href="/terms" className="hover:text-gray-600">Terms & Conditions</Link>
          <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
          <span>© {new Date().getFullYear()} Show Up or Else</span>
        </div>
      </footer>

      <Modal {...modal} />
    </div>
  );
};

export default MainLayout;
