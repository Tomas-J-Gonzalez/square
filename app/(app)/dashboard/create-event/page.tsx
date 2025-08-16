'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EventFormData {
  title: string;
  date: string;
  time: string;
  location: string;
  eventType: 'in-person' | 'virtual';
  eventDetails: string;
  punishment: string;
  customPunishment: string;
}

const PUNISHMENT_OPTIONS = [
  { value: '25_pushups', label: '25 Pushups', description: 'Do 25 pushups at the next event' },
  { value: 'buys_drinks', label: 'Buys Drinks Next Time', description: 'Pay for everyone\'s drinks at the next gathering' },
  { value: 'custom', label: 'Custom Punishment', description: 'Write your own punishment below' }
];

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: '',
    time: '',
    location: '',
    eventType: 'in-person',
    eventDetails: '',
    punishment: '',
    customPunishment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Event title is required');
      setLoading(false);
      return;
    }

    if (!formData.date) {
      setError('Event date is required');
      setLoading(false);
      return;
    }

    if (!formData.time) {
      setError('Event time is required');
      setLoading(false);
      return;
    }

    if (!formData.location.trim()) {
      setError('Event location is required');
      setLoading(false);
      return;
    }

    if (!formData.punishment) {
      setError('Please select a punishment for flakers');
      setLoading(false);
      return;
    }

    if (formData.punishment === 'custom' && !formData.customPunishment.trim()) {
      setError('Please enter a custom punishment');
      setLoading(false);
      return;
    }

    try {
      const userData = localStorage.getItem('currentUser');
      if (!userData) {
        router.push('/login');
        return;
      }

      const user = JSON.parse(userData);
      
      // Determine final punishment text
      const finalPunishment = formData.punishment === 'custom' 
        ? formData.customPunishment 
        : PUNISHMENT_OPTIONS.find(opt => opt.value === formData.punishment)?.label || '';

      const eventData = {
        title: formData.title.trim(),
        date: formData.date,
        time: formData.time,
        location: formData.location.trim(),
        eventType: formData.eventType,
        eventDetails: formData.eventDetails.trim(),
        decisionMode: 'single_person', // Default for now
        punishment: finalPunishment,
        invited_by: user.email
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createEvent', eventData }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to create event');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.date &&
      formData.time &&
      formData.location.trim() &&
      formData.punishment &&
      (formData.punishment !== 'custom' || formData.customPunishment.trim())
    );
  };

  return (
    <div className="px-8 sm:px-16 lg:px-32 space-y-8">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Create New Event</h1>
        <p className="text-lg text-gray-600">
          Plan your next gathering and set up the rules for participants.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert" aria-live="polite">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Basic Event Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>
            
            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Event Title <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                placeholder="Enter event title"
                aria-describedby="title-help"
                aria-invalid={formData.title.trim() === '' ? 'true' : 'false'}
              />
              <p id="title-help" className="mt-1 text-sm text-gray-500">
                Give your event a catchy name that will get people excited
              </p>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  aria-describedby="date-help"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p id="date-help" className="mt-1 text-sm text-gray-500">
                  When is your event happening?
                </p>
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  aria-describedby="time-help"
                />
                <p id="time-help" className="mt-1 text-sm text-gray-500">
                  What time should people arrive?
                </p>
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                placeholder="Enter event location"
                aria-describedby="location-help"
                aria-invalid={formData.location.trim() === '' ? 'true' : 'false'}
              />
              <p id="location-help" className="mt-1 text-sm text-gray-500">
                Where is your event taking place?
              </p>
            </div>

            {/* Event Type */}
            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-3">
                  Event Type <span className="text-red-500" aria-label="required">*</span>
                </legend>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="eventType"
                      value="in-person"
                      checked={formData.eventType === 'in-person'}
                      onChange={(e) => handleInputChange('eventType', e.target.value)}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">In-Person Event</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="eventType"
                      value="virtual"
                      checked={formData.eventType === 'virtual'}
                      onChange={(e) => handleInputChange('eventType', e.target.value)}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">Virtual Event</span>
                  </label>
                </div>
              </fieldset>
            </div>

            {/* Event Details */}
            <div>
              <label htmlFor="eventDetails" className="block text-sm font-medium text-gray-700 mb-2">
                Event Details <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <textarea
                id="eventDetails"
                name="eventDetails"
                value={formData.eventDetails}
                onChange={(e) => handleInputChange('eventDetails', e.target.value)}
                rows={4}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                placeholder="Add any additional details about your event, what to bring, dress code, etc."
                aria-describedby="eventDetails-help"
              />
              <p id="eventDetails-help" className="mt-1 text-sm text-gray-500">
                Provide any additional information that participants should know
              </p>
            </div>
          </div>

          {/* Punishment Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Punishment for Flakers</h2>
            <p className="text-sm text-gray-600">
              What happens to people who don't show up? Choose from our suggestions or create your own.
            </p>
            
            <fieldset>
              <legend className="sr-only">Punishment options</legend>
              <div className="space-y-3">
                {PUNISHMENT_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="punishment"
                      value={option.value}
                      checked={formData.punishment === option.value}
                      onChange={(e) => handleInputChange('punishment', e.target.value)}
                      className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                      aria-describedby={`punishment-${option.value}-description`}
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div id={`punishment-${option.value}-description`} className="text-sm text-gray-500">
                        {option.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Custom Punishment Input */}
            {formData.punishment === 'custom' && (
              <div className="mt-4">
                <label htmlFor="customPunishment" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Punishment <span className="text-red-500" aria-label="required">*</span>
                </label>
                <textarea
                  id="customPunishment"
                  name="customPunishment"
                  required
                  value={formData.customPunishment}
                  onChange={(e) => handleInputChange('customPunishment', e.target.value)}
                  rows={3}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  placeholder="Describe the punishment for people who don't show up..."
                  aria-describedby="customPunishment-help"
                  aria-invalid={formData.customPunishment.trim() === '' ? 'true' : 'false'}
                />
                <p id="customPunishment-help" className="mt-1 text-sm text-gray-500">
                  Be creative but keep it fun and reasonable!
                </p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Event...
                </div>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
