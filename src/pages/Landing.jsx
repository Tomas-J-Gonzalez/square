import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import { useRouter } from 'next/router';

const Landing = () => {
  const { currentUser } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white px-32 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/logo.svg" 
              alt="Show up or Else" 
              className="h-10 w-auto"
              onError={(e) => { e.currentTarget.src='/favicon.png?v=1'; }}
            />
          </div>
          <div className="flex items-center gap-4">
            {!currentUser ? (
              <>
                <Link href="/register" className="text-pink-500 font-bold text-sm hover:text-pink-600">
                  Sign up
                </Link>
                <Link href="/login" className="bg-pink-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-pink-600 transition-colors">
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-pink-500 font-bold text-sm hover:text-pink-600">
                  Dashboard
                </Link>
                <Link href="/create" className="bg-pink-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-pink-600 transition-colors">
                  Create Event
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-20 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-4">
              Show up or Else
            </h1>
            <p className="text-xl text-gray-300">
              Make event planning fun, collaborative, and flake-proof
            </p>
          </div>
          
          <Link 
            href={currentUser ? "/dashboard" : "/register"} 
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-32 py-3 rounded-full font-bold text-lg hover:bg-pink-600 transition-colors"
          >
            {currentUser ? "Go to Dashboard" : "Create your event"}
            <Icon name="arrow-right" style="solid" size="sm" />
          </Link>
        </div>
      </section>

      {/* Feature Ribbon - Moving Ticker */}
      <section className="bg-white py-10 px-8 overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-12 animate-scroll whitespace-nowrap">
            {/* First set of items */}
            <div className="flex items-center gap-4">
              <Icon name="smile" style="regular" size="lg" className="text-pink-500" />
              <span className="font-medium text-gray-900 uppercase tracking-wide">Make Events Fun</span>
            </div>
            <div className="flex items-center gap-4">
              <Icon name="calendar-plus" style="solid" size="lg" className="text-pink-500" />
              <span className="font-medium text-gray-900 uppercase tracking-wide">Easy Event Creation</span>
            </div>
            <div className="flex items-center gap-4">
              <Icon name="users" style="solid" size="lg" className="text-pink-500" />
              <span className="font-medium text-gray-900 uppercase tracking-wide">Collaborative Planning</span>
            </div>
            <div className="flex items-center gap-4">
              <Icon name="exclamation-triangle" style="solid" size="lg" className="text-pink-500" />
              <span className="font-medium text-gray-900 uppercase tracking-wide">Punish Flakers</span>
            </div>
            <div className="flex items-center gap-4">
              <Icon name="heart" style="solid" size="lg" className="text-pink-500" />
              <span className="font-medium text-gray-900 uppercase tracking-wide">Create Memories</span>
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="flex items-center gap-4">
              <Icon name="smile" style="regular" size="lg" className="text-pink-500" />
              <span className="font-medium text-gray-900 uppercase tracking-wide">Make Events Fun</span>
            </div>
            <div className="flex items-center gap-4">
              <Icon name="calendar-plus" style="solid" size="lg" className="text-pink-500" />
              <span className="font-medium text-gray-900 uppercase tracking-wide">Easy Event Creation</span>
            </div>
            <div className="flex items-center gap-4">
              <Icon name="users" style="solid" size="lg" className="text-pink-500" />
              <span className="font-medium text-gray-900 uppercase tracking-wide">Collaborative Planning</span>
            </div>
            <div className="flex items-center gap-4">
              <Icon name="exclamation-triangle" style="solid" size="lg" className="text-pink-500" />
              <span className="font-medium text-gray-900 uppercase tracking-wide">Punish Flakers</span>
            </div>
            <div className="flex items-center gap-4">
              <Icon name="heart" style="solid" size="lg" className="text-pink-500" />
              <span className="font-medium text-gray-900 uppercase tracking-wide">Create Memories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Make event planning "funner"
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Tired of flaky friends ruining your plans? We make event planning fun, collaborative, and flake-proof. 
            Create events, collect RSVPs, and keep everyone accountable with playful punishments and rewards. 
            Finally — planning hangouts that people actually show up to.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pink-600 text-white py-20 px-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Be there or be square</h3>
              <div className="flex items-center gap-6 text-sm">
                <span>Show Up or Else © 2025</span>
                <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="text-white hover:text-pink-200 transition-colors"
                aria-label="Facebook"
              >
                <Icon name="facebook" style="brands" size="lg" />
              </a>
              <a 
                href="#" 
                className="text-white hover:text-pink-200 transition-colors"
                aria-label="Instagram"
              >
                <Icon name="instagram" style="brands" size="lg" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
