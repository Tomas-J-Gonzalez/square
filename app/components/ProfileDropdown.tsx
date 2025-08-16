'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface ProfileDropdownProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export default function ProfileDropdown({ userName, userEmail, onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'right' | 'left'>('right');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const handleToggle = () => {
    if (!isOpen) {
      // Check if dropdown would overflow to the right
      const button = dropdownRef.current?.querySelector('button');
      if (button) {
        const rect = button.getBoundingClientRect();
        const dropdownWidth = 224; // w-56 = 14rem = 224px
        const viewportWidth = window.innerWidth;
        
        if (rect.right + dropdownWidth > viewportWidth) {
          setDropdownPosition('left');
        } else {
          setDropdownPosition('right');
        }
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={handleToggle}
        className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open user menu"
      >
        {/* User Info */}
        <div className="hidden sm:block text-left min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-900 truncate">{userName}</div>
          <div className="text-xs text-gray-500 truncate">{userEmail}</div>
        </div>
        
        {/* Dropdown Arrow */}
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 transform opacity-100 scale-100 transition-all duration-200 ease-out ${dropdownPosition === 'right' ? 'right-0' : 'left-0'}`}>
          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/dashboard/profile"
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>View Profile</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
