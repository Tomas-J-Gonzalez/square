import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import Icon from '../components/Icon';

const CreateEvent = () => {
  const navigate = useNavigate();
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
      description: 'Everyone votes on who flaked',
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!formData.title || !formData.date || !formData.time || !formData.decisionMode) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const eventData = {
        ...formData,
        dateTime: `${formData.date}T${formData.time}`,
        participants: [],
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      const newEvent = eventService.createNewEvent(eventData);
      navigate(`/event/${newEvent.id}`);
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
      navigate(eventPath);
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
        <div className="form-container">
          <div className="section-header">
            <h1 className="section-title">Create New Event</h1>
            <p className="section-subtitle">
              Set up your event and choose how to handle flakes
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Event Details */}
            <div className="form-section">
              <h2 className="form-section-title">Event Details</h2>
              <div className="form-grid">
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
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="date" className="form-label">Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-input"
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
            <div className="form-section">
              <h2 className="form-section-title">How to Decide on Event</h2>
              <p className="form-section-description">
                Choose how the group will decide who gets punished for flaking
              </p>
              <div className="decision-grid">
                {decisionModes.map((mode) => (
                  <label 
                    key={mode.id} 
                    className={`decision-option ${formData.decisionMode === mode.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="decisionMode"
                      value={mode.id}
                      checked={formData.decisionMode === mode.id}
                      onChange={handleInputChange}
                    />
                    <div className="decision-content">
                      <div className="decision-icon">
                        <Icon name={mode.icon} style="solid" size="lg" />
                      </div>
                      <div className="decision-title">{mode.title}</div>
                      <div className="decision-description">{mode.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Punishment Selection */}
            <div className="form-section">
              <h2 className="form-section-title">Punishment for Flakes</h2>
              <p className="form-section-description">
                Select what happens to the person who flakes
              </p>
              <div className="punishment-grid">
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
              </div>
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
