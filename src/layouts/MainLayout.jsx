import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Icon from '../components/Icon';

const MainLayout = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-default">
      {/* Header */}
      <header className="bg-background-default border-b border-border-default">
        <div className="container mx-auto px-16 sm:px-40 md:px-80 lg:px-80 xl:px-80 xxl:px-128">
          <div className="flex justify-between items-center h-64">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-16">
              <div className="w-32 h-32 bg-background-brand-brand-primary rounded-full flex items-center justify-center">
                <Icon name="calendar-check" style="solid" size="md" className="text-content-knockout" />
              </div>
              <span className="text-heading-3 font-bold text-content-default">
                Anti-Flake
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-32">
              <Link
                to="/"
                className={`text-body-md font-medium transition-colors duration-200 ${
                  isActive('/')
                    ? 'text-background-brand-brand-primary'
                    : 'text-content-default hover:text-background-brand-brand-primary'
                }`}
              >
                Home
              </Link>
              <Link
                to="/create"
                className={`text-body-md font-medium transition-colors duration-200 ${
                  isActive('/create')
                    ? 'text-background-brand-brand-primary'
                    : 'text-content-default hover:text-background-brand-brand-primary'
                }`}
              >
                Create Event
              </Link>
              <Link
                to="/past"
                className={`text-body-md font-medium transition-colors duration-200 ${
                  isActive('/past')
                    ? 'text-background-brand-brand-primary'
                    : 'text-content-default hover:text-background-brand-brand-primary'
                }`}
              >
                Past Events
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden p-8 text-content-subtle hover:text-content-default">
              <Icon name="bars" style="solid" size="md" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>


    </div>
  );
};

export default MainLayout;
