'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participant_count: number;
  status: string;
  invited_by: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

type EventTab = 'hosted' | 'cancelled' | 'completed';

export default function PastEventsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<EventTab>('hosted');

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

  const refreshEvents = async () => {
    if (!user?.email) return;
    setRefreshing(true);
    await fetchEvents(user.email);
    setRefreshing(false);
  };

  const getFilteredEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (activeTab) {
      case 'hosted':
        // Show only past events that were hosted by the user (not current/future events)
        return events.filter(event => {
          const eventDate = new Date(event.date);
          const eventDateTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
          return event.invited_by === user?.email && 
                 event.status === 'active' && 
                 eventDateTime < today;
        });
      case 'cancelled':
        return events.filter(event => event.invited_by === user?.email && event.status === 'cancelled');
      case 'completed':
        return events.filter(event => event.invited_by === user?.email && event.status === 'completed');
      default:
        return [];
    }
  };

  const getTabCount = (tab: EventTab) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (tab) {
      case 'hosted':
        // Count only past events that were hosted by the user
        return events.filter(event => {
          const eventDate = new Date(event.date);
          const eventDateTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
          return event.invited_by === user?.email && 
                 event.status === 'active' && 
                 eventDateTime < today;
        }).length;
      case 'cancelled':
        return events.filter(event => event.invited_by === user?.email && event.status === 'cancelled').length;
      case 'completed':
        return events.filter(event => event.invited_by === user?.email && event.status === 'completed').length;
      default:
        return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Completed</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading past events...</p>
        </div>
      </div>
    );
  }

  const filteredEvents = getFilteredEvents();

  return (
    <div className="px-8 sm:px-16 lg:px-32 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Past Events</h1>
          <p className="text-lg text-gray-600">
            View and manage your event history.
          </p>
        </div>
        <button
          onClick={refreshEvents}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
        >
          {refreshing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'hosted' as EventTab, label: 'Events I Hosted', icon: 'calendar' },
            { key: 'cancelled' as EventTab, label: 'Cancelled Events', icon: 'x-circle' },
            { key: 'completed' as EventTab, label: 'Completed Events', icon: 'check-circle' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                {getTabCount(tab.key)}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Events List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {filteredEvents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No {activeTab} events
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'hosted' && "You haven't hosted any events yet."}
              {activeTab === 'cancelled' && "You haven't cancelled any events."}
              {activeTab === 'completed' && "You haven't completed any events yet."}
            </p>
            {activeTab === 'hosted' && (
              <div className="mt-6">
                <Link
                  href="/dashboard/create-event"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                >
                  Create Event
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <div key={event.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-pink-500 rounded-md flex items-center justify-center">
                        {getStatusIcon(event.status)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">{event.title}</h4>
                        {getStatusBadge(event.status)}
                      </div>
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
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
