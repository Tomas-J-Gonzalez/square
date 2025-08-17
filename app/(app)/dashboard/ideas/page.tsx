'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../../../components/Icon';

interface Idea {
  title: string;
  description: string;
  category: string;
  estimatedCost: string;
  duration: string;
}

const FILTER_OPTIONS = [
  { id: 'pub', label: 'Pub', icon: '🍺', color: '#8B5CF6' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️', color: '#F59E0B' },
  { id: 'sports', label: 'Sports', icon: '⚽', color: '#10B981' },
  { id: 'pool', label: 'Pool', icon: '🏊', color: '#06B6D4' },
  { id: 'live music', label: 'Live Music', icon: '🎵', color: '#EC4899' },
  { id: 'concert', label: 'Concert', icon: '🎤', color: '#EF4444' },
  { id: 'music festival', label: 'Music Festival', icon: '🎪', color: '#8B5CF6' }
];

export default function IdeasPage() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

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
    setHasGenerated(true);

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
    const filter = FILTER_OPTIONS.find(f => f.id === category);
    return filter?.color || '#6B7280';
  };

  const handleCreateEvent = (idea: Idea) => {
    // Navigate to create event page with pre-filled data
    const eventData = {
      title: idea.title,
      description: idea.description,
      location: location,
      category: idea.category
    };
    
    // Store in sessionStorage for the create event page to use
    sessionStorage.setItem('ideaData', JSON.stringify(eventData));
    router.push('/dashboard/create-event');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon name="arrow-right" size="lg" className="rotate-180" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">What are we doing?</h1>
                <p className="text-gray-600">Get AI-powered activity ideas for your next adventure</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Input & Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              {/* Location Input */}
              <div className="mb-6">
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-3">
                  Where are you going?
                </label>
                <div className="relative">
                  <Icon 
                    name="map-pin" 
                    size="md" 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Downtown, Central Park, Beach"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Filter Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  What interests you?
                </label>
                <div className="space-y-2">
                  {FILTER_OPTIONS.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => handleFilterToggle(filter.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all ${
                        selectedFilters.includes(filter.id)
                          ? 'bg-pink-50 border-pink-300 text-pink-700 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{filter.icon}</span>
                      <span className="font-medium">{filter.label}</span>
                      {selectedFilters.includes(filter.id) && (
                        <Icon name="check" size="sm" className="ml-auto text-pink-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateIdeas}
                disabled={loading || !location.trim()}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating ideas...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Icon name="lightbulb" size="md" />
                    <span>Generate Ideas</span>
                  </div>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="x" size="sm" className="text-red-600" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            {!hasGenerated ? (
              /* Welcome State */
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon name="lightbulb" size="xl" className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to discover amazing activities?
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Enter a location and select your interests to get personalized activity suggestions powered by AI.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Icon name="map-pin" size="sm" />
                      <span>Location-based</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="star" size="sm" />
                      <span>Cost estimates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="clock" size="sm" />
                      <span>Duration info</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="users" size="sm" />
                      <span>Group friendly</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : ideas.length > 0 ? (
              /* Results State */
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Ideas for {location}
                  </h2>
                  <p className="text-gray-600">
                    {selectedFilters.length > 0 
                      ? `Based on your interests: ${selectedFilters.join(', ')}`
                      : 'Here are some great activities to try:'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ideas.map((idea, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg"
                          style={{ backgroundColor: getCategoryColor(idea.category) }}
                        >
                          {getCategoryIcon(idea.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {idea.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            {idea.description}
                          </p>
                          <div className="flex items-center justify-between">
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
                            <button
                              onClick={() => handleCreateEvent(idea)}
                              className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors"
                            >
                              Create Event
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Regenerate Button */}
                <div className="text-center">
                  <button
                    onClick={generateIdeas}
                    disabled={loading}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Generate More Ideas
                  </button>
                </div>
              </div>
            ) : (
              /* Loading or Error State */
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                {loading ? (
                  <div className="space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Generating ideas...</h3>
                    <p className="text-gray-600">Our AI is finding the perfect activities for you</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Icon name="star" size="xl" className="mx-auto text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">No ideas yet</h3>
                    <p className="text-gray-600">Enter a location and click "Generate Ideas" to get started</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
