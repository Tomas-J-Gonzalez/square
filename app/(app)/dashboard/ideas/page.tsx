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
  isRealPlace?: boolean;
  placeId?: string;
  address?: string;
  rating?: number;
  website?: string;
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
  const [generationCount, setGenerationCount] = useState(0);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const MAX_GENERATIONS = 4;

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    
    if (value.trim().length > 2) {
      // Generate smart suggestions based on input
      const suggestions = generateLocationSuggestions(value);
      setLocationSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const generateLocationSuggestions = (input: string): string[] => {
    const popularLocations = [
      'Auckland CBD', 'Auckland Central', 'Auckland North Shore', 'Auckland West', 'Auckland South',
      'Wellington CBD', 'Wellington Waterfront', 'Wellington Central', 'Wellington East',
      'Christchurch CBD', 'Christchurch Central', 'Christchurch North', 'Christchurch South',
      'Queenstown', 'Queenstown Central', 'Queenstown Airport', 'Queenstown Hill',
      'Dunedin', 'Dunedin Central', 'Dunedin North', 'Dunedin South',
      'Hamilton', 'Hamilton Central', 'Hamilton East', 'Hamilton West',
      'Tauranga', 'Tauranga Central', 'Tauranga Mount', 'Tauranga Papamoa',
      'Napier', 'Napier Central', 'Napier Hill', 'Napier Waterfront',
      'Rotorua', 'Rotorua Central', 'Rotorua Lake', 'Rotorua Thermal',
      'New Plymouth', 'New Plymouth Central', 'New Plymouth Coastal',
      'Palmerston North', 'Palmerston North Central', 'Palmerston North University',
      'Whangarei', 'Whangarei Central', 'Whangarei Heads',
      'Invercargill', 'Invercargill Central', 'Invercargill South',
      'Nelson', 'Nelson Central', 'Nelson Tahunanui',
      'Whanganui', 'Whanganui Central', 'Whanganui River',
      'Gisborne', 'Gisborne Central', 'Gisborne Beach',
      'Timaru', 'Timaru Central', 'Timaru Caroline Bay',
      'Taupo', 'Taupo Central', 'Taupo Lake', 'Taupo Thermal',
      'Whakatane', 'Whakatane Central', 'Whakatane Beach',
      'Blenheim', 'Blenheim Central', 'Blenheim Wine',
      'Oamaru', 'Oamaru Central', 'Oamaru Victorian',
      'Greymouth', 'Greymouth Central', 'Greymouth Coast',
      'Hokitika', 'Hokitika Central', 'Hokitika Beach',
      'Wanaka', 'Wanaka Central', 'Wanaka Lake',
      'Te Anau', 'Te Anau Central', 'Te Anau Lake',
      'Picton', 'Picton Central', 'Picton Harbour',
      'Kaikoura', 'Kaikoura Central', 'Kaikoura Coast',
      'Franz Josef', 'Franz Josef Glacier', 'Franz Josef Village',
      'Fox Glacier', 'Fox Glacier Village', 'Fox Glacier Terminal',
      'Milford Sound', 'Milford Sound Terminal', 'Milford Sound Cruise',
      'Mount Cook', 'Mount Cook Village', 'Mount Cook National Park',
      'Lake Tekapo', 'Lake Tekapo Village', 'Lake Tekapo Observatory',
      'Twizel', 'Twizel Central', 'Twizel Lake',
      'Omarama', 'Omarama Central', 'Omarama Gliding',
      'Cromwell', 'Cromwell Central', 'Cromwell Fruit',
      'Arrowtown', 'Arrowtown Central', 'Arrowtown Historic',
      'Glenorchy', 'Glenorchy Central', 'Glenorchy Lake',
      'Te Anau', 'Te Anau Central', 'Te Anau Lake',
      'Manapouri', 'Manapouri Central', 'Manapouri Lake',
      'Stewart Island', 'Stewart Island Oban', 'Stewart Island Halfmoon Bay'
    ];

    const inputLower = input.toLowerCase();
    const filtered = popularLocations.filter(location => 
      location.toLowerCase().includes(inputLower)
    );

    // Sort by relevance (exact matches first, then partial matches)
    const sorted = filtered.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      if (aLower.startsWith(inputLower) && !bLower.startsWith(inputLower)) return -1;
      if (bLower.startsWith(inputLower) && !aLower.startsWith(inputLower)) return 1;
      
      return aLower.localeCompare(bLower);
    });

    return sorted.slice(0, 8); // Return top 8 suggestions
  };

  const selectLocation = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const generateIdeas = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    if (generationCount >= MAX_GENERATIONS) {
      setError(`You've reached the maximum of ${MAX_GENERATIONS} idea generations. Please upgrade your account for unlimited access.`);
      return;
    }

    setLoading(true);
    setError('');
    setIdeas([]);
    setHasGenerated(true);
    setGenerationCount(prev => prev + 1);

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
        // Revert the count if the request failed
        setGenerationCount(prev => prev - 1);
      }
    } catch (err) {
      setError('Failed to generate ideas. Please try again.');
      // Revert the count if the request failed
      setGenerationCount(prev => prev - 1);
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
      location: idea.isRealPlace ? idea.address || location : location,
      category: idea.category
    };
    
    // Store in sessionStorage for the create event page to use
    sessionStorage.setItem('ideaData', JSON.stringify(eventData));
    router.push('/dashboard/create-event');
  };

  const handleViewDetails = (idea: Idea) => {
    if (idea.isRealPlace && idea.website) {
      window.open(idea.website, '_blank');
    } else if (idea.isRealPlace && idea.placeId) {
      // Open Google Maps
      window.open(`https://www.google.com/maps/place/?q=place_id:${idea.placeId}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            aria-label="Go back"
          >
            <Icon name="arrow-right" size="lg" className="rotate-180" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">What are we doing?</h1>
            <p className="text-sm sm:text-base text-gray-600">Get AI-powered activity ideas for your next adventure</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Panel - Input & Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:sticky lg:top-24">
              {/* Location Input */}
              <div className="mb-6">
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-3">
                  Where in New Zealand?
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
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onFocus={() => {
                      if (locationSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicking on them
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder="e.g., Auckland CBD, Wellington Waterfront, Queenstown"
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                    aria-describedby="location-help"
                    autoComplete="off"
                  />
                  
                  {/* Location Suggestions Dropdown */}
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => selectLocation(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-pink-50 focus:bg-pink-50 focus:outline-none transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon name="map-pin" size="sm" className="text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p id="location-help" className="mt-2 text-xs text-gray-500">
                  Enter a location to get personalized recommendations
                </p>
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Popular locations:</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {['Auckland CBD', 'Wellington', 'Christchurch', 'Queenstown', 'Dunedin', 'Hamilton', 'Tauranga', 'Napier'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => selectLocation(suggestion)}
                        className="text-xs bg-gray-100 hover:bg-pink-100 text-gray-700 hover:text-pink-700 px-3 py-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1"
                        aria-label={`Select ${suggestion} as location`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  What interests you?
                </label>
                <div className="space-y-3">
                  {FILTER_OPTIONS.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => handleFilterToggle(filter.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 ${
                        selectedFilters.includes(filter.id)
                          ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300 text-pink-700 shadow-md'
                          : 'bg-white/70 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      aria-pressed={selectedFilters.includes(filter.id)}
                      aria-label={`${selectedFilters.includes(filter.id) ? 'Deselect' : 'Select'} ${filter.label}`}
                    >
                      <span className="text-2xl">{filter.icon}</span>
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
                disabled={loading || !location.trim() || generationCount >= MAX_GENERATIONS}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                aria-describedby="generate-help"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating ideas...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Icon name="zap" size="md" />
                    <span>Generate Ideas</span>
                  </div>
                )}
              </button>
              
              {/* Generation Counter */}
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500">
                  {generationCount > 0 ? (
                    <span>
                      Used {generationCount} of {MAX_GENERATIONS} generations
                      {generationCount >= MAX_GENERATIONS && (
                        <span className="block mt-1 text-red-500 font-medium">
                          Limit reached - upgrade for unlimited access
                        </span>
                      )}
                    </span>
                  ) : (
                    <span>Free tier: {MAX_GENERATIONS} generations per session</span>
                  )}
                </p>
              </div>
              
              <p id="generate-help" className="mt-2 text-xs text-gray-500 text-center">
                {!location.trim() ? 'Enter a location to get started' : 
                 generationCount >= MAX_GENERATIONS ? 'Upgrade your account for unlimited generations' :
                 'Click to generate personalized activity ideas'}
              </p>

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
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                    <Icon name="lightbulb" size="xl" className="text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Ready to discover amazing activities?
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                    Enter a location and select your interests to get personalized activity suggestions powered by AI.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-50">
                      <Icon name="map-pin" size="sm" />
                      <span>Location-based</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-50">
                      <Icon name="star" size="sm" />
                      <span>Cost estimates</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-50">
                      <Icon name="clock" size="sm" />
                      <span>Duration info</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-50">
                      <Icon name="users" size="sm" />
                      <span>Group friendly</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : ideas.length > 0 ? (
              /* Results State */
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    Ideas for {location}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    {selectedFilters.length > 0 
                      ? `Based on your interests: ${selectedFilters.join(', ')}`
                      : 'Here are some great activities to try:'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {ideas.map((idea, index) => (
                    <div
                      key={index}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border border-white/20 group"
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div
                          className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl shadow-lg"
                          style={{ backgroundColor: getCategoryColor(idea.category) }}
                        >
                          {getCategoryIcon(idea.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-2 sm:space-y-0">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">
                              {idea.title}
                            </h3>
                            {idea.isRealPlace && (
                              <div className="flex items-center space-x-1">
                                {idea.rating && (
                                  <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                                    <Icon name="star" size="sm" className="text-yellow-600" />
                                    <span className="text-xs font-medium text-yellow-800">{idea.rating}</span>
                                  </div>
                                )}
                                <div className="bg-green-100 px-2 py-1 rounded-full">
                                  <span className="text-xs font-medium text-green-800">Real Place</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-3 sm:mb-4 leading-relaxed">
                            {idea.description}
                          </p>
                          {idea.isRealPlace && idea.address && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500 mb-3">
                              <Icon name="map-pin" size="sm" />
                              <span className="truncate">{idea.address}</span>
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
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
                            <div className="flex items-center space-x-2">
                              {idea.isRealPlace && (
                                <button
                                  onClick={() => handleViewDetails(idea)}
                                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                                  aria-label={`View details for ${idea.title}`}
                                >
                                  View Details
                                </button>
                              )}
                              <button
                                onClick={() => handleCreateEvent(idea)}
                                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1"
                                aria-label={`Create event for ${idea.title}`}
                              >
                                Create Event
                              </button>
                            </div>
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
                    disabled={loading || generationCount >= MAX_GENERATIONS}
                    className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
                    aria-label="Generate more activity ideas"
                  >
                    {generationCount >= MAX_GENERATIONS ? (
                      <span>Generation Limit Reached</span>
                    ) : (
                      <span>Generate More Ideas</span>
                    )}
                  </button>
                  {generationCount >= MAX_GENERATIONS && (
                    <p className="mt-2 text-xs text-red-500">
                      You've used all {MAX_GENERATIONS} free generations. Upgrade for unlimited access.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Loading or Error State */
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-12 text-center">
                {loading ? (
                  <div className="space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Generating ideas...</h3>
                    <p className="text-sm sm:text-base text-gray-600">Our AI is finding the perfect activities for you</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Icon name="star" size="xl" className="mx-auto text-gray-400" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">No ideas yet</h3>
                    <p className="text-sm sm:text-base text-gray-600">Enter a location and click "Generate Ideas" to get started</p>
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
