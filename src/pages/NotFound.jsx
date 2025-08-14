import React from 'react';
import Link from 'next/link';
import Icon from '../components/Icon';

const NotFound = () => {
  return (
    <div className="section">
      <div className="section-container">
        <div className="text-center py-32">
          <div className="mb-24">
            <Icon name="exclamation-triangle" style="solid" size="4xl" className="text-pink-500 mx-auto mb-16" />
            <h1 className="text-6xl font-bold text-gray-900 mb-8">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-16">Page Not Found</h2>
            <p className="text-lg text-gray-600 mb-32 max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>
          
          <div className="space-y-16">
            <Link href="/" className="btn btn-primary btn-lg inline-flex items-center">
              <Icon name="home" style="solid" size="sm" className="mr-8" />
              Go Home
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Or try one of these pages:</p>
              <div className="flex justify-center space-x-16 mt-8">
                <Link href="/create" className="text-pink-500 hover:text-pink-700 transition-colors">
                  Create Event
                </Link>
                <Link href="/past" className="text-pink-500 hover:text-pink-700 transition-colors">
                  Past Events
                </Link>
                <Link href="/profile" className="text-pink-500 hover:text-pink-700 transition-colors">
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
