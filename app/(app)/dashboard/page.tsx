'use client';

import { useState, useEffect } from 'react';
import Card, { CardIcon, CardTitle, CardDescription, CardAction } from '../../components/Card';
import Icon from '../../components/Icon';
import { useAuth } from '../../contexts/AuthContext';
import IdeaGeneratorModal from '../../components/IdeaGeneratorModal';

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
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEvents(user.email);
    }
  }, [user]);

  const fetchEvents = async (userEmail: string) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getEvents', userEmail, status: 'active' }),
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
      <div className="text-left mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome back, {firstName}! 👋
        </h1>
      </div>

      {/* Quick Actions - 4 Cards in One Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Create Event Card - Only show if no active events */}
        {events.length === 0 && (
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
        )}

        {/* Events I'm Hosting Card - Only show if user has active events */}
        {events.length > 0 && (
          <Card href={`/dashboard/event/${events[0].id}`}>
            <CardIcon backgroundColor="#ec4899">
              <Icon name="users" size="lg" />
            </CardIcon>
            <CardTitle>My Events</CardTitle>
            <CardDescription>
              {events.length} active event{events.length !== 1 ? 's' : ''}
            </CardDescription>
            <CardAction>
              Manage Events
              <Icon name="arrow-right" size="sm" className="card-action-icon" />
            </CardAction>
          </Card>
        )}

        {/* What are we doing? Card */}
        <Card onClick={() => setIsIdeaModalOpen(true)}>
          <CardIcon backgroundColor="#8B5CF6">
            <Icon name="lightbulb" size="lg" />
          </CardIcon>
          <CardTitle>What are we doing?</CardTitle>
          <CardDescription>Get AI-powered activity ideas</CardDescription>
          <CardAction>
            Generate Ideas
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
      </div>

      {/* Idea Generator Modal */}
      <IdeaGeneratorModal 
        isOpen={isIdeaModalOpen} 
        onClose={() => setIsIdeaModalOpen(false)} 
      />

    </div>
  );
}
