'use client';

import { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import Icon from '../../../components/Icon';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  flakes: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
  }>;
}

export default function PastEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      const userData = localStorage.getItem('currentUser');
      if (!userData) {
        window.location.href = '/login';
        return;
      }

      const user = JSON.parse(userData);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getPastEvents', userEmail: user.email }),
      });

      const data = await response.json();
      if (data.success) {
        setEvents(data.events || []);
      } else {
        setError(data.error || 'Failed to fetch past events');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Past Events</h1>
          <p className="mt-2 text-gray-600">View your completed and cancelled events</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <Icon name="calendar" size="xl" className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No past events</h3>
            <p className="text-gray-600 mb-6">
              You haven't completed or cancelled any events yet.
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white shadow rounded-lg overflow-hidden">
                {/* Event Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-gray-600">
                        {formatDate(event.date)} at {formatTime(event.time)}
                      </p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {event.status === 'completed' ? 'Completed' : 'Cancelled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Flakes Section */}
                <div className="px-6 py-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Flakes ({event.flakes.length})
                  </h4>
                  
                  {event.flakes.length === 0 ? (
                    <p className="text-gray-500 italic">No flakes! Everyone showed up.</p>
                  ) : (
                    <div className="space-y-3">
                      {event.flakes.map((flake) => (
                        <div key={flake.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <Icon name="x" size="sm" className="text-red-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{flake.name}</p>
                            <p className="text-sm text-gray-500">{flake.email}</p>
                            {flake.message && (
                              <p className="text-sm text-gray-600 mt-1">"{flake.message}"</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
