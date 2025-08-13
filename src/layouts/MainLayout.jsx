import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../hooks/useModal';
import Icon from '../components/Icon';
// Use public asset path so static hosting (Netlify/Vercel) can serve without bundling
const logoPath = '/assets/logo.png';
import Modal from '../components/Modal';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin } = useAuth();
  const { modal, showConfirmModal } = useModal();

  const isActive = (path) => location.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

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
        navigate('/login');
      },
      () => {}
    );
  };

  const isAdminUserDisplay = isAdmin || currentUser?.id === 'admin' || currentUser?.email === 'admin@example.com' || currentUser?.name === 'Administrator';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-default)' }}>
      {/* Header */}
      <header className="header" role="banner">
        <div className="header-container">
          <div className="header-content">
            {/* Logo */}
            <Link to="/" className="logo" aria-label="Go to home page">
              <img src={logoPath} alt="Logo" className="h-6 w-6 md:h-8 md:w-8 mr-8" />
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
                      to="/profile"
                      className="user-menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Icon name="user" style="solid" size="sm" />
                      Profile
                    </Link>
                    <Link
                      to="/profile"
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
              <li className="border-t border-gray-200 mt-4 pt-4">
                <Link
                  to="/profile"
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
      <main role="main">
        <Outlet />
      </main>

      <Modal {...modal} />
    </div>
  );
};

export default MainLayout;
