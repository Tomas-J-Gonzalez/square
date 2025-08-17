'use client';

import { useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';

interface Idea {
  title: string;
  description: string;
  category: string;
  estimatedCost: string;
  duration: string;
}

interface IdeaGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILTER_OPTIONS = [
  { id: 'pub', label: 'Pub', icon: '🍺' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'pool', label: 'Pool', icon: '🏊' },
  { id: 'live music', label: 'Live Music', icon: '🎵' },
  { id: 'concert', label: 'Concert', icon: '🎤' },
  { id: 'music festival', label: 'Music Festival', icon: '🎪' }
];

export default function IdeaGeneratorModal({ isOpen, onClose }: IdeaGeneratorModalProps) {
  const [location, setLocation] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const generateIdeas = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    setIdeas([]);

    try {
      const response = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, filters: selectedFilters }),
      });

      const data = await response.json();

      if (data.success) {
        setIdeas(data.ideas);
      } else {
        setError(data.error || 'Failed to generate ideas');
      }
    } catch (err) {
      setError('Failed to generate ideas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const filter = FILTER_OPTIONS.find(f => f.id === category);
    return filter?.icon || '🎯';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      pub: '#8B5CF6',
      restaurant: '#F59E0B',
      sports: '#10B981',
      pool: '#06B6D4',
      'live music': '#EC4899',
      concert: '#EF4444',
      'music festival': '#8B5CF6'
    };
    return colors[category] || '#6B7280';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="What are we doing?">
      <div className="space-y-6">
        {/* Location Input */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Where are you going?
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Downtown, Central Park, Beach"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Filter Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What type of activities interest you?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterToggle(filter.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md border transition-colors ${
                  selectedFilters.includes(filter.id)
                    ? 'bg-pink-50 border-pink-300 text-pink-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{filter.icon}</span>
                <span className="text-sm font-medium">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateIdeas}
          disabled={loading || !location.trim()}
          className="w-full bg-pink-600 text-white py-3 px-4 rounded-md font-medium hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating ideas...</span>
            </div>
          ) : (
            'Generate Ideas'
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Ideas Results */}
        {ideas.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Here are some ideas for {location}:
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ideas.map((idea, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: getCategoryColor(idea.category) }}
                    >
                      {getCategoryIcon(idea.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {idea.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">
                        {idea.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Icon name="clock" size="sm" />
                          <span>{idea.duration}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Icon name="star" size="sm" />
                          <span>{idea.estimatedCost}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!loading && ideas.length === 0 && location && !error && (
          <div className="text-center py-8">
            <Icon name="star" size="xl" className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">Enter a location and click "Generate Ideas" to get started!</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
