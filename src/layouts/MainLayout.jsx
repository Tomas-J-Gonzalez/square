import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Icon from '../components/Icon';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-default)' }}>
      {/* Header */}
      <header className="header" role="banner">
        <div className="header-container">
          <div className="header-content">
            {/* Logo */}
            <Link to="/" className="logo" aria-label="Go to home page">
              <div className="w-16 h-16 bg-pink-500 rounded-sm mr-8" aria-hidden="true"></div>
              <span className="logo-text">Be there or be square</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="nav-desktop" role="navigation" aria-label="Main navigation">
              <ul className="flex items-center gap-32 list-none m-0 p-0">
                <li>
                  <Link
                    to="/"
                    className={`nav-link ${isActive('/') ? 'active' : ''}`}
                    aria-current={isActive('/') ? 'page' : undefined}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/create"
                    className={`nav-link ${isActive('/create') ? 'active' : ''}`}
                    aria-current={isActive('/create') ? 'page' : undefined}
                  >
                    Create Event
                  </Link>
                </li>
                <li>
                  <Link
                    to="/past"
                    className={`nav-link ${isActive('/past') ? 'active' : ''}`}
                    aria-current={isActive('/past') ? 'page' : undefined}
                  >
                    Past Events
                  </Link>
                </li>
              </ul>
            </nav>

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
                  to="/"
                  className={`nav-link ${isActive('/') ? 'active' : ''}`}
                  aria-current={isActive('/') ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/create"
                  className={`nav-link ${isActive('/create') ? 'active' : ''}`}
                  aria-current={isActive('/create') ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Event
                </Link>
              </li>
              <li>
                <Link
                  to="/past"
                  className={`nav-link ${isActive('/past') ? 'active' : ''}`}
                  aria-current={isActive('/past') ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Past Events
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main role="main">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
