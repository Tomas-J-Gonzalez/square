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
  punishmentSeverity: number;
}

const PUNISHMENT_OPTIONS = [
  { value: '25_pushups', label: '25 Pushups' },
  { value: 'buys_drinks', label: 'Buys Drinks Next Time' },
  { value: 'cleans_up', label: 'Cleans Up After Event' },
  { value: 'cooks_next', label: 'Cooks for Next Event' },
  { value: 'pays_penalty', label: 'Pays $20 Penalty' },
  { value: 'wears_costume', label: 'Wears Embarrassing Costume' },
  { value: 'sings_song', label: 'Sings a Song in Public' },
  { value: 'dance_routine', label: 'Does a Dance Routine' },
  { value: 'custom', label: 'Custom Punishment' }
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
    customPunishment: '',
    punishmentSeverity: 5
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
        // punishmentSeverity: formData.punishmentSeverity, // Temporarily disabled until DB column is added
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

  const handleInputChange = (field: keyof EventFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow valid date format YYYY-MM-DD
    if (value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      handleInputChange('date', value);
    }
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

  const getSeverityLabel = (severity: number) => {
    if (severity <= 2) return 'Very Easy';
    if (severity <= 4) return 'Easy';
    if (severity <= 6) return 'Medium';
    if (severity <= 8) return 'Hard';
    return 'Very Hard';
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
                aria-invalid={formData.title.trim() === '' ? 'true' : 'false'}
              />
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
                  onChange={handleDateChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  min={new Date().toISOString().split('T')[0]}
                />
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
                />
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
                aria-invalid={formData.location.trim() === '' ? 'true' : 'false'}
              />
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
              />
            </div>
          </div>

          {/* Punishment Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Punishment for Flakers</h2>
            
            <fieldset>
              <legend className="sr-only">Punishment options</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PUNISHMENT_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="punishment"
                      value={option.value}
                      checked={formData.punishment === option.value}
                      onChange={(e) => handleInputChange('punishment', e.target.value)}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">{option.label}</span>
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
                  aria-invalid={formData.customPunishment.trim() === '' ? 'true' : 'false'}
                />
              </div>
            )}

            {/* Punishment Severity Slider */}
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                Punishment Severity: <span className="text-pink-600 font-medium">{getSeverityLabel(formData.punishmentSeverity)}</span>
              </label>
              <input
                type="range"
                id="severity"
                name="severity"
                min="1"
                max="10"
                value={formData.punishmentSeverity}
                onChange={(e) => handleInputChange('punishmentSeverity', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Easy</span>
                <span>Very Hard</span>
              </div>
            </div>
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
