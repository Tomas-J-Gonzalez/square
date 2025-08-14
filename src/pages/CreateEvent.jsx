import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { eventService } from '../services/eventService';
import Icon from '../components/Icon';

const CreateEvent = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    decisionMode: 'none',
    punishment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const decisionModes = [
    {
      id: 'none',
      title: 'No Group Decision',
      description: 'You decide yourself',
      icon: 'user'
    },
    {
      id: 'vote',
      title: 'Vote',
      description: 'Everyone gets to vote on the event',
      icon: 'vote-yea'
    },
    {
      id: 'chance',
      title: 'Chance',
      description: 'Random selection decides',
      icon: 'dice'
    },
    {
      id: 'game',
      title: 'Game',
      description: 'Play a game to decide',
      icon: 'gamepad'
    }
  ];

  const punishments = [
    'Buy everyone coffee',
    'Pay for the next event',
    'Do the dishes for a week',
    'Write an apology letter',
    'Wear a silly hat for a day',
    'Sing karaoke in public',
    'Clean everyone\'s car',
    'Make dinner for everyone'
  ];

  const isCustomPunishment = formData.punishment === '__custom__';

  // Helper to get today's date in local timezone as YYYY-MM-DD (no UTC shift)
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Additional validation for date input (non-blocking, timezone-safe)
    if (name === 'date' && value) {
      const [y, m, d] = value.split('-').map(Number);
      const selectedDate = new Date(y, (m || 1) - 1, d || 1);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(selectedDate.getTime())) {
        setError('Please select a valid date.');
      } else if (d && selectedDate < today) {
        // Only compare if a full date (with day) is present
        setError('Please select a date that is today or in the future.');
      } else if (error) {
        setError('');
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields (including custom punishment)
    const punishmentValid = formData.punishment && (formData.punishment !== '__custom__' ? true : (formData.customPunishment && formData.customPunishment.trim().length > 0));
    if (!formData.title || !formData.date || !formData.time || !formData.decisionMode || !punishmentValid) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate a stable ID before any persistence so server/local stay in sync
      const generatedId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const eventData = {
        id: generatedId,
        ...formData,
        punishment: formData.punishment === '__custom__' ? (formData.customPunishment || '').trim() : formData.punishment,
        dateTime: `${formData.date}T${formData.time}`,
        participants: [],
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // Persist server-side for invite workflows (best-effort, non-fatal)
      try {
        const { supabase } = await import('../../lib/supabaseClient');
        if (supabase) {
          await supabase.from('events').upsert({
            id: eventData.id, // Use the same ID for both local and server
            title: eventData.title,
            date: formData.date,
            time: formData.time,
            location: formData.location || null,
            decision_mode: formData.decisionMode,
            punishment: eventData.punishment,
            invited_by: (JSON.parse(localStorage.getItem('be-there-or-be-square-current-user')||'{}').name) || 'Organizer'
          });
        }
          const newEvent = eventService.createNewEvent(eventData);
          router.push(`/event/${newEvent.id}`);
      } catch (_) {
        // Fallback to local only if supabase not configured
        const newEvent = eventService.createNewEvent(eventData);
        router.push(`/event/${newEvent.id}`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleErrorLinkClick = (errorMessage) => {
    // Extract the link from the error message
    const linkMatch = errorMessage.match(/\[View Current Event\]\(([^)]+)\)/);
    if (linkMatch) {
      const eventPath = linkMatch[1];
      router.push(eventPath);
    }
  };

  const renderErrorMessage = (errorMessage) => {
    // Check if the error message contains a link
    const linkMatch = errorMessage.match(/\[View Current Event\]\(([^)]+)\)/);
    
    if (linkMatch) {
      const beforeLink = errorMessage.split('[')[0];
      const afterLink = errorMessage.split(']')[1].split('(')[0];
      
      return (
        <div className="mt-16 p-16 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            {beforeLink}
            <button
              onClick={() => handleErrorLinkClick(errorMessage)}
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              current event
            </button>
            {afterLink}
          </p>
        </div>
      );
    }
    
    // Regular error message without link
    return (
      <div className="mt-16 p-16 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 text-sm">{errorMessage}</p>
      </div>
    );
  };

  return (
    <div className="section">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <div className="section-header">
            <h1 className="section-title">Create New Event</h1>
            <p className="section-subtitle">Set up your event and choose how to handle flakes</p>
          </div>

          <form onSubmit={handleSubmit} aria-labelledby="create-event-title">
            {/* Event Details */}
            <div className="form-section bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <h2 id="create-event-title" className="text-xl font-semibold text-gray-900 mb-6">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="title" className="form-label">Event Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Friday night dinner"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location" className="form-label">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Joe's Restaurant"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="date" className="form-label">Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-input"
                    min={getLocalDateString()}
                    max={`${new Date().getFullYear() + 2}-12-31`}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="time" className="form-label">Time *</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Decision Mode */}
            <div className="form-section bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">How to Decide on Event</h2>
              <p className="text-sm text-gray-600 mb-6">Choose how you will decide on the event</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {decisionModes.map((mode) => {
                  const isDisabled = mode.id !== 'none';
                  return (
                    <label 
                      key={mode.id} 
                      className={`decision-option ${formData.decisionMode === mode.id ? 'selected' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={isDisabled ? 'Currently unavailable' : undefined}
                      aria-disabled={isDisabled}
                    >
                      <input
                        type="radio"
                        name="decisionMode"
                        value={mode.id}
                        checked={formData.decisionMode === mode.id}
                        onChange={handleInputChange}
                        disabled={isDisabled}
                        tabIndex={isDisabled ? -1 : 0}
                      />
                      <div className="decision-content">
                        <div className="decision-icon">
                          <Icon name={mode.icon} style="solid" size="lg" />
                        </div>
                        <div className="decision-title">{mode.title}</div>
                        <div className="decision-description">{mode.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Punishment Selection */}
            <div className="form-section bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Punishment for Flakes</h2>
              <p className="text-sm text-gray-600 mb-6">Select what happens to the person who flakes</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {punishments.map((punishment, index) => (
                  <label 
                    key={index} 
                    className={`punishment-option ${formData.punishment === punishment ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="punishment"
                      value={punishment}
                      checked={formData.punishment === punishment}
                      onChange={handleInputChange}
                    />
                    <div className="punishment-text">{punishment}</div>
                  </label>
                ))}

                {/* Custom punishment option */}
                <label 
                  className={`punishment-option ${isCustomPunishment ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="punishment"
                    value="__custom__"
                    checked={isCustomPunishment}
                    onChange={handleInputChange}
                  />
                  <div className="punishment-text">Custom punishment</div>
                </label>
              </div>

              {isCustomPunishment && (
                <div className="mt-6">
                  <label htmlFor="customPunishment" className="form-label">Enter custom punishment *</label>
                  <input
                    id="customPunishment"
                    type="text"
                    className="form-input"
                    placeholder="Describe the punishment"
                    value={formData.customPunishment || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, customPunishment: e.target.value }))}
                    required
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-section">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-lg w-full"
              >
                {isSubmitting ? 'Creating Event...' : 'Create Event'}
              </button>
              
              {/* Error Message - Now at bottom with link support */}
              {error && renderErrorMessage(error)}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
