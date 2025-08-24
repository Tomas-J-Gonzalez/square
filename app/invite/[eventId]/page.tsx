
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

  // Update page metadata when event data is loaded
  useEffect(() => {
    if (event) {
      const hostFirstName = event.host_name?.split(' ')[0] || 'Someone';
      const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      
      // Update the page title
      document.title = `${hostFirstName} has invited you to ${event.title} - Show Up or Else`;
      
      // Update Open Graph meta tags for better Facebook sharing
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', `${hostFirstName} has invited you to ${event.title}`);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', `${hostFirstName} has invited you to ${event.title} on ${eventDate} at ${event.location}. Join us for this ${event.event_type} event!`);
      }
      
      // Update Twitter meta tags
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', `${hostFirstName} has invited you to ${event.title}`);
      }
      
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', `${hostFirstName} has invited you to ${event.title} on ${eventDate} at ${event.location}. Join us for this ${event.event_type} event!`);
      }
      
      // Update the URL meta tag
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        ogUrl.setAttribute('content', window.location.href);
      }
    }
  }, [event]);

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

  const generateICal = () => {
    const eventDate = new Date(event.date + 'T' + event.time);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Show Up or Else//Event//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@showuporelse.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.event_details || 'Event invitation from Show Up or Else'}`,
      `LOCATION:${event.location}`,
      `ORGANIZER;CN=${event.host_name}:mailto:${event.invited_by}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-purple-100/20 opacity-50"></div>
      
      <div className="relative z-10 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src="/assets/circle-pink.svg" 
                alt="Show up or Else" 
                className="h-16 w-16"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              You're Invited!
            </h1>
            <p className="text-lg text-gray-600">
              Hosted by <span className="font-semibold text-pink-600">{event.host_name}</span>
            </p>
          </div>

          {/* Event Details Card */}
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 mb-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{event.title}</h2>
              <button
                onClick={generateICal}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                title="Add to Calendar"
              >
                <Icon name="calendar-download" size="sm" className="mr-2" />
                Add to Calendar
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                  <Icon name="calendar" size="lg" className="text-pink-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{formatDate(event.date)}</p>
                  <p className="text-gray-600">{formatTime(event.time)}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                  <Icon name="map-pin" size="lg" className="text-pink-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{event.location}</p>
                  <p className="text-gray-600 capitalize">{event.event_type} event</p>
                </div>
              </div>
            </div>

            {event.event_details && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Event Details</h4>
                <p className="text-gray-700 leading-relaxed">{event.event_details}</p>
              </div>
            )}

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                  <Icon name="star" size="sm" className="text-amber-600" />
                </div>
                <h4 className="font-semibold text-amber-800">Punishment for Flakers</h4>
              </div>
              <p className="text-amber-700 leading-relaxed">{event.punishment}</p>
            </div>
          </div>

          {/* RSVP Form */}
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                <Icon name="check" size="lg" className="text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">RSVP</h3>
            </div>
            
            {error && (
              <div className="bg-red-50/80 border border-red-200 text-red-700 px-6 py-4 rounded-xl backdrop-blur-sm mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <Icon name="x" size="sm" className="text-red-600" />
                  </div>
                  <p className="font-semibold">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Your Name <span className="text-red-500" aria-label="required">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white/50 backdrop-blur-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter your full name"
                    disabled={submitting}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enter your name as you'd like it to appear on the guest list
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Your Email <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white/50 backdrop-blur-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter your email address (optional)"
                    disabled={submitting}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Optional: We'll use this to send you event updates
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Will you attend? <span className="text-red-500" aria-label="required">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup">
                  <label className="relative">
                    <input
                      type="radio"
                      name="willAttend"
                      value="true"
                      checked={formData.willAttend}
                      onChange={() => setFormData(prev => ({ ...prev, willAttend: true }))}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.willAttend 
                        ? 'border-green-500 bg-green-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                          formData.willAttend ? 'border-green-500 bg-green-500' : 'border-gray-300'
                        }`}>
                          {formData.willAttend && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Icon name="check" size="sm" className="text-green-600 mr-2" />
                          <span className="font-semibold text-green-700">Yes, I'll be there!</span>
                        </div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="relative">
                    <input
                      type="radio"
                      name="willAttend"
                      value="false"
                      checked={!formData.willAttend}
                      onChange={() => setFormData(prev => ({ ...prev, willAttend: false }))}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      !formData.willAttend 
                        ? 'border-red-500 bg-red-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                          !formData.willAttend ? 'border-red-500 bg-red-500' : 'border-gray-300'
                        }`}>
                          {!formData.willAttend && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Icon name="x" size="sm" className="text-red-600 mr-2" />
                          <span className="font-semibold text-red-700">Sorry, I can't make it</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700">
                  Message <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white/50 backdrop-blur-sm disabled:bg-gray-50 disabled:text-gray-500"
                  rows={3}
                  placeholder="Add a personal message or reason..."
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500">
                  Optional: Add a personal note or reason for your response
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/')}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={!formData.name}
                  className="w-full sm:w-auto"
                >
                  Submit RSVP
                </Button>
              </div>
            </form>
          </div>
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
