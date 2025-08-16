'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card, { CardIcon, CardTitle, CardDescription, CardAction } from '../../components/Card';
import Icon from '../../components/Icon';

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

  // Get first name only
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="px-8 sm:px-16 lg:px-32 space-y-8">
      {/* Welcome Section - No Card Background */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Manage your events and keep track of your participants.
        </p>
      </div>

      {/* Quick Actions - 3 Cards in One Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <CardIcon backgroundColor="#ec4899">
            <Icon name="calendar" size="lg" />
          </CardIcon>
          <CardTitle>Past Events</CardTitle>
          <CardDescription>View completed events</CardDescription>
          <CardAction>
            View Past Events
            <Icon name="arrow-right" size="sm" className="card-action-icon" />
          </CardAction>
        </Card>

        {/* Events I'm Hosting Card - Smaller */}
        <Card href="/dashboard/events">
          <CardIcon backgroundColor="#ec4899">
            <Icon name="users" size="lg" />
          </CardIcon>
          <CardTitle>My Events</CardTitle>
          <CardDescription>
            {events.length === 0 
              ? "No active events" 
              : `${events.length} active event${events.length !== 1 ? 's' : ''}`
            }
          </CardDescription>
          <CardAction>
            Manage Events
            <Icon name="arrow-right" size="sm" className="card-action-icon" />
          </CardAction>
        </Card>
      </div>

      {/* Current Events - Full Width Card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Events I'm Hosting
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your active events and participant counts.
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {events.length === 0 ? (
            <div className="px-6 py-12 text-center">
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
            events.map((event) => (
              <div key={event.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
