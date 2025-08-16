'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card, { CardIcon, CardTitle, CardDescription, CardAction } from '../../components/Card';
import Icon from '../../components/Icon';
import DexVexGame from '../../components/DexVexGame';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participant_count: number;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchEvents(parsedUser.email);
    } else {
      // Redirect to login if no user
      window.location.href = '/login';
    }
  }, []);

  const fetchEvents = async (userEmail: string) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getEvents', userEmail }),
      });

      const data = await response.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Show up or Else" 
                className="h-8 w-auto"
              />
              <span className="ml-3 text-xl font-bold text-gray-900">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-600">
                Manage your events and keep track of your participants.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid-cards mb-8">
            {/* Create Event Card */}
            <Card href="/dashboard/create-event">
              <CardIcon backgroundColor="#ec4899">
                <Icon name="plus" size="lg" />
              </CardIcon>
              <CardTitle>Create New Event</CardTitle>
              <CardDescription>Plan your next gathering</CardDescription>
              <CardAction>
                Create Event
                <Icon name="arrow-right" size="sm" className="card-action-icon" />
              </CardAction>
            </Card>

            {/* Past Events Card */}
            <Card href="/dashboard/past-events">
              <CardIcon backgroundColor="#3b82f6">
                <Icon name="calendar" size="lg" />
              </CardIcon>
              <CardTitle>Past Events</CardTitle>
              <CardDescription>View completed events</CardDescription>
              <CardAction>
                View Past Events
                <Icon name="arrow-right" size="sm" className="card-action-icon" />
              </CardAction>
            </Card>

            {/* Fun Card */}
            <Card onClick={() => setShowGame(true)}>
              <CardIcon backgroundColor="#8b5cf6">
                <Icon name="gamepad" size="lg" />
              </CardIcon>
              <CardTitle>Fun</CardTitle>
              <CardDescription>Play Dex Vex game</CardDescription>
              <CardAction>
                Play Game
                <Icon name="arrow-right" size="sm" className="card-action-icon" />
              </CardAction>
            </Card>
          </div>

          {/* Current Events */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Events I'm Hosting
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your active events and participant counts.
              </p>
            </div>
            <div className="border-t border-gray-200">
              {events.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first event.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/dashboard/create-event"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                    >
                      Create Event
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <li key={event.id}>
                      <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-500">
                              {event.date} at {event.time} • {event.location}
                            </p>
                            <p className="text-sm text-gray-500">
                              {event.participant_count} participants
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            href={`/dashboard/event/${event.id}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-pink-700 bg-pink-100 hover:bg-pink-200"
                          >
                            Manage
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Game Modal */}
      {showGame && <DexVexGame onClose={() => setShowGame(false)} />}
    </div>
  );
}
