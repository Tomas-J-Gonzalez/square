import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Icon from '../components/Icon';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-default)' }}>
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            {/* Logo */}
            <Link to="/" className="logo">
              <div className="w-16 h-16 bg-pink-500 rounded-sm mr-8"></div>
              <span className="logo-text">Be there or be square</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="nav-desktop">
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/create"
                className={`nav-link ${isActive('/create') ? 'active' : ''}`}
              >
                Create Event
              </Link>
              <Link
                to="/past"
                className={`nav-link ${isActive('/past') ? 'active' : ''}`}
              >
                Past Events
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="nav-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Icon name="bars" style="solid" size="md" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className={`nav-mobile ${isMobileMenuOpen ? 'active' : ''}`}>
            <nav className="nav-mobile-content">
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/create"
                className={`nav-link ${isActive('/create') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create Event
              </Link>
              <Link
                to="/past"
                className={`nav-link ${isActive('/past') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Past Events
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
