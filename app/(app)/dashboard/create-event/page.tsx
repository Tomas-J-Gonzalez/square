'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../components/Button';

interface EventFormData {
  title: string;
  date: string;
  time: string;
  location: string;
  eventType: 'in-person' | 'virtual';
  eventDetails: string;
  decisionMode: string;
  punishment: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'group' | 'single'>('group');
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: '',
    time: '',
    location: '',
    eventType: 'in-person',
    eventDetails: '',
    decisionMode: '',
    punishment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = localStorage.getItem('currentUser');
      if (!userData) {
        router.push('/login');
        return;
      }

      const user = JSON.parse(userData);
      const eventData = {
        ...formData,
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
  };

  const groupDecisionOptions = [
    { value: 'group_vote', label: 'Group Vote', description: 'Everyone votes on the decision' },
    { value: 'random_chance', label: 'Random Chance', description: 'Let fate decide randomly' },
    { value: 'mini_game', label: 'Mini Game', description: 'Play a game to decide' }
  ];

  const singleDecisionOptions = [
    { value: 'single_person', label: 'Single Person Choice', description: 'One person makes the decision' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="mt-2 text-gray-600">Plan your next gathering and set up the rules</p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Basic Event Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
              
              <div className="form-group">
                <label htmlFor="title" className="form-label">Event Title</label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="form-input"
                  placeholder="Enter event title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    type="date"
                    id="date"
                    required
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time" className="form-label">Time</label>
                  <input
                    type="time"
                    id="time"
                    required
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">Location</label>
                <input
                  type="text"
                  id="location"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="form-input"
                  placeholder="Enter event location"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="eventType"
                      value="in-person"
                      checked={formData.eventType === 'in-person'}
                      onChange={(e) => handleInputChange('eventType', e.target.value)}
                      className="mr-2"
                    />
                    In-Person
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="eventType"
                      value="virtual"
                      checked={formData.eventType === 'virtual'}
                      onChange={(e) => handleInputChange('eventType', e.target.value)}
                      className="mr-2"
                    />
                    Virtual
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="eventDetails" className="form-label">Event Details (Optional)</label>
                <textarea
                  id="eventDetails"
                  value={formData.eventDetails}
                  onChange={(e) => handleInputChange('eventDetails', e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="Add any additional details about your event..."
                />
              </div>
            </div>

            {/* Decision Mode */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Decision Making</h3>
              
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab('group')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'group'
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Group Decision
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('single')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'single'
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Single Person Choice
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="pt-4">
                {activeTab === 'group' ? (
                  <div className="space-y-3">
                    {groupDecisionOptions.map((option) => (
                      <label key={option.value} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="decisionMode"
                          value={option.value}
                          checked={formData.decisionMode === option.value}
                          onChange={(e) => handleInputChange('decisionMode', e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {singleDecisionOptions.map((option) => (
                      <label key={option.value} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="decisionMode"
                          value={option.value}
                          checked={formData.decisionMode === option.value}
                          onChange={(e) => handleInputChange('decisionMode', e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Punishment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Punishment for Flakers</h3>
              <div className="form-group">
                <label htmlFor="punishment" className="form-label">What happens to people who flake?</label>
                <textarea
                  id="punishment"
                  required
                  value={formData.punishment}
                  onChange={(e) => handleInputChange('punishment', e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="Describe the punishment for people who don't show up..."
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={!formData.title || !formData.date || !formData.time || !formData.location || !formData.decisionMode || !formData.punishment}
              >
                Create Event
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
