import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    decisionMode: 'vote',
    punishment: 'buy-coffee'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const punishments = [
    { id: 'buy-coffee', name: 'Buy Coffee', description: 'Buy everyone coffee' },
    { id: 'clean-house', name: 'Clean House', description: 'Clean the host\'s house' },
    { id: 'cook-dinner', name: 'Cook Dinner', description: 'Cook dinner for everyone' },
    { id: 'pay-bill', name: 'Pay Bill', description: 'Pay the restaurant bill' },
    { id: 'wear-costume', name: 'Wear Costume', description: 'Wear a silly costume next time' },
    { id: 'dance-performance', name: 'Dance Performance', description: 'Perform a dance for everyone' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock event ID and redirect
    const eventId = Math.random().toString(36).substr(2, 9);
    navigate(`/event/${eventId}`);
  };

  return (
    <Section>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-64">
          <h1 className="text-heading-1 text-content-default mb-16">
            Create New Event
          </h1>
          <p className="text-body-lg text-content-subtle">
            Set up an event and let fate decide who gets the punishment!
          </p>
        </div>

        <Card className="p-32">
          <form onSubmit={handleSubmit} className="space-y-32">
            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-body-md font-medium text-content-default mb-8">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-16 py-8 border border-border-default rounded-md bg-background-default text-content-default placeholder-content-subtle focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-colors duration-200"
                placeholder="e.g., Friday Night Dinner"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                <label htmlFor="date" className="block text-body-md font-medium text-content-default mb-8">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-16 py-8 border border-border-default rounded-md bg-background-default text-content-default focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-colors duration-200"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-body-md font-medium text-content-default mb-8">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-16 py-8 border border-border-default rounded-md bg-background-default text-content-default focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-body-md font-medium text-content-default mb-8">
                Location (Optional)
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-16 py-8 border border-border-default rounded-md bg-background-default text-content-default placeholder-content-subtle focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-colors duration-200"
                placeholder="e.g., Joe's Pizza, 123 Main St"
              />
            </div>

            {/* Decision Mode */}
            <div>
              <label className="block text-body-md font-medium text-content-default mb-16">
                How to Decide the Flake?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                <label className="flex items-center p-16 border border-border-default rounded-md cursor-pointer hover:border-border-strong transition-colors duration-200">
                  <input
                    type="radio"
                    name="decisionMode"
                    value="vote"
                    checked={formData.decisionMode === 'vote'}
                    onChange={handleChange}
                    className="mr-12"
                  />
                  <div className="flex items-center">
                    <Icon name="vote-yea" style="solid" size="sm" className="text-background-brand-brand-primary mr-8" />
                    <span className="text-body-md">Vote</span>
                  </div>
                </label>
                <label className="flex items-center p-16 border border-border-default rounded-md cursor-pointer hover:border-border-strong transition-colors duration-200">
                  <input
                    type="radio"
                    name="decisionMode"
                    value="chance"
                    checked={formData.decisionMode === 'chance'}
                    onChange={handleChange}
                    className="mr-12"
                  />
                  <div className="flex items-center">
                    <Icon name="dice" style="solid" size="sm" className="text-background-brand-brand-primary mr-8" />
                    <span className="text-body-md">Chance</span>
                  </div>
                </label>
                <label className="flex items-center p-16 border border-border-default rounded-md cursor-pointer hover:border-border-strong transition-colors duration-200">
                  <input
                    type="radio"
                    name="decisionMode"
                    value="game"
                    checked={formData.decisionMode === 'game'}
                    onChange={handleChange}
                    className="mr-12"
                  />
                  <div className="flex items-center">
                    <Icon name="gamepad" style="solid" size="sm" className="text-background-brand-brand-primary mr-8" />
                    <span className="text-body-md">Game</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Punishment */}
            <div>
              <label htmlFor="punishment" className="block text-body-md font-medium text-content-default mb-8">
                Punishment for the Flake
              </label>
              <select
                id="punishment"
                name="punishment"
                value={formData.punishment}
                onChange={handleChange}
                className="w-full px-16 py-8 border border-border-default rounded-md bg-background-default text-content-default focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-colors duration-200"
              >
                {punishments.map(punishment => (
                  <option key={punishment.id} value={punishment.id}>
                    {punishment.name} - {punishment.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Icon name="spinner" style="solid" size="sm" className="animate-spin mr-8" />
                  Creating Event...
                </>
              ) : (
                <>
                  <Icon name="plus" style="solid" size="sm" className="mr-8" />
                  Create Event
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </Section>
  );
};

export default CreateEvent;
