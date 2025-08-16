
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../../components/Button';
import NotificationModal from '../../components/NotificationModal';
import { useModal } from '../../hooks/useModal';
import Icon from '../../components/Icon';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  event_type: string;
  event_details: string;
  decision_mode: string;
  punishment: string;
  status: string;
  invited_by: string;
  host_name: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const successModal = useModal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    willAttend: true,
    message: ''
  });

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getEvent', eventId }),
      });

      const data = await response.json();
      if (data.success) {
        setEvent(data.event);
      } else {
        setError(data.error || 'Event not found');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rsvp',
          eventId,
          rsvpData: formData
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Show success message and redirect
        successModal.open();
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.error || 'Failed to submit RSVP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
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
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="x" size="xl" className="mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Event not found</h3>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or the event has been deleted.
          </p>
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (event.status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="calendar" size="xl" className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Event {event.status}</h3>
          <p className="text-gray-600 mb-6">
            This event has been {event.status}. Please contact the host for more information.
          </p>
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Invited!</h1>
          <p className="text-gray-600">Hosted by {event.host_name}</p>
        </div>

        {/* Event Details */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{event.title}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Icon name="calendar" size="md" className="text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{formatDate(event.date)}</p>
                <p className="text-gray-600">{formatTime(event.time)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Icon name="map-pin" size="md" className="text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{event.location}</p>
                <p className="text-gray-600 capitalize">{event.event_type} event</p>
              </div>
            </div>

            {event.event_details && (
              <div>
                <p className="text-gray-900">{event.event_details}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Punishment for Flakers</h4>
              <p className="text-yellow-700">{event.punishment}</p>
            </div>
          </div>
        </div>

        {/* RSVP Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">RSVP</h3>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Your Name</label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Your Email</label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Will you attend?</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="willAttend"
                    value="true"
                    checked={formData.willAttend}
                    onChange={() => setFormData(prev => ({ ...prev, willAttend: true }))}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <Icon name="check" size="sm" className="text-green-600 mr-2" />
                    <span className="font-medium text-green-700">Yes, I'll be there!</span>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="willAttend"
                    value="false"
                    checked={!formData.willAttend}
                    onChange={() => setFormData(prev => ({ ...prev, willAttend: false }))}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <Icon name="x" size="sm" className="text-red-600 mr-2" />
                    <span className="font-medium text-red-700">Sorry, I can't make it</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">Message (Optional)</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="form-input"
                rows={3}
                placeholder="Add a personal message or reason..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={!formData.name || !formData.email}
              >
                Submit RSVP
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Notification Modal */}
      <NotificationModal
        isOpen={successModal.isOpen}
        onClose={successModal.close}
        title="RSVP Submitted Successfully!"
        message="Thank you for responding to the invitation. We'll see you there!"
        variant="success"
        autoClose={true}
        autoCloseDelay={2000}
        showCloseButton={false}
      />
    </div>
  );
}
