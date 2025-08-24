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
    const lowerInput = input.toLowerCase();
    
    // Specific street and location suggestions based on input
    const specificLocations = [
      // Auckland Streets
      'Queen Street, Auckland CBD',
      'Karangahape Road, Auckland',
      'Ponsonby Road, Auckland',
      'Dominion Road, Auckland',
      'Mount Eden Road, Auckland',
      'Newmarket, Auckland',
      'Parnell, Auckland',
      'Devonport, Auckland',
      'Takapuna, Auckland',
      'Mission Bay, Auckland',
      'St Heliers, Auckland',
      'Kohimarama, Auckland',
      'Remuera, Auckland',
      'Epsom, Auckland',
      'Mount Albert, Auckland',
      'Sandringham, Auckland',
      'Kingsland, Auckland',
      'Grey Lynn, Auckland',
      'Westmere, Auckland',
      'Herne Bay, Auckland',
      'Freemans Bay, Auckland',
      'Parnell Rise, Auckland',
      'Symonds Street, Auckland',
      'Great North Road, Auckland',
      'Great South Road, Auckland',
      'Manukau Road, Auckland',
      'Tamaki Drive, Auckland',
      'Lake Road, Auckland',
      'Hurstmere Road, Auckland',
      'Anzac Avenue, Auckland',
      'Customs Street, Auckland',
      'Shortland Street, Auckland',
      'High Street, Auckland',
      'Vulcan Lane, Auckland',
      'Fort Street, Auckland',
      'Quay Street, Auckland',
      'Fanshawe Street, Auckland',
      'Beaumont Street, Auckland',
      'Jellicoe Street, Auckland',
      'Halsey Street, Auckland',
      'Madden Street, Auckland',
      'Tyler Street, Auckland',
      'Daldy Street, Auckland',
      'Fish Lane, Auckland',
      'Gore Street, Auckland',
      'Galway Street, Auckland',
      'Cook Street, Auckland',
      'Wellesley Street, Auckland',
      'Wakefield Street, Auckland',
      'Victoria Street, Auckland',
      'Albert Street, Auckland',
      'Elliott Street, Auckland',
      'Lorne Street, Auckland',
      'Rutland Street, Auckland',
      'Durham Street, Auckland',
      'Wyndham Street, Auckland',
      'Gore Street, Auckland',
      'Galway Street, Auckland',
      'Cook Street, Auckland',
      'Wellesley Street, Auckland',
      'Wakefield Street, Auckland',
      'Victoria Street, Auckland',
      'Albert Street, Auckland',
      'Elliott Street, Auckland',
      'Lorne Street, Auckland',
      'Rutland Street, Auckland',
      'Durham Street, Auckland',
      'Wyndham Street, Auckland',
      
      // Wellington Streets
      'Cuba Street, Wellington',
      'Lambton Quay, Wellington',
      'Courtenay Place, Wellington',
      'Willis Street, Wellington',
      'Manners Street, Wellington',
      'Featherston Street, Wellington',
      'The Terrace, Wellington',
      'Ghuznee Street, Wellington',
      'Vivian Street, Wellington',
      'Taranaki Street, Wellington',
      'Kent Terrace, Wellington',
      'Cambridge Terrace, Wellington',
      'Adelaide Road, Wellington',
      'Newtown, Wellington',
      'Island Bay, Wellington',
      'Lyall Bay, Wellington',
      'Oriental Bay, Wellington',
      'Mount Victoria, Wellington',
      'Kelburn, Wellington',
      'Aro Valley, Wellington',
      'Brooklyn, Wellington',
      'Karori, Wellington',
      'Wadestown, Wellington',
      'Khandallah, Wellington',
      'Ngaio, Wellington',
      'Kaiwharawhara, Wellington',
      'Crofton Downs, Wellington',
      'Northland, Wellington',
      'Wilton, Wellington',
      'Berhampore, Wellington',
      'Mount Cook, Wellington',
      'Te Aro, Wellington',
      'Thorndon, Wellington',
      'Pipitea, Wellington',
      'Lambton, Wellington',
      'Kaiwharawhara, Wellington',
      'Crofton Downs, Wellington',
      'Northland, Wellington',
      'Wilton, Wellington',
      'Berhampore, Wellington',
      'Mount Cook, Wellington',
      'Te Aro, Wellington',
      'Thorndon, Wellington',
      'Pipitea, Wellington',
      'Lambton, Wellington',
      
      // Christchurch Streets
      'Colombo Street, Christchurch',
      'Cashel Street, Christchurch',
      'High Street, Christchurch',
      'Manchester Street, Christchurch',
      'Lichfield Street, Christchurch',
      'Tuam Street, Christchurch',
      'St Asaph Street, Christchurch',
      'Moorhouse Avenue, Christchurch',
      'Bealey Avenue, Christchurch',
      'Papanui Road, Christchurch',
      'Riccarton Road, Christchurch',
      'Fendalton Road, Christchurch',
      'Merivale, Christchurch',
      'Fendalton, Christchurch',
      'Riccarton, Christchurch',
      'Addington, Christchurch',
      'Sydenham, Christchurch',
      'Woolston, Christchurch',
      'Linwood, Christchurch',
      'New Brighton, Christchurch',
      'Sumner, Christchurch',
      'Lyttelton, Christchurch',
      'Akaroa, Christchurch',
      'Rangiora, Christchurch',
      'Kaiapoi, Christchurch',
      'Rolleston, Christchurch',
      'Lincoln, Christchurch',
      'Belfast, Christchurch',
      'Shirley, Christchurch',
      'Burwood, Christchurch',
      'Parklands, Christchurch',
      'Bromley, Christchurch',
      'Hornby, Christchurch',
      'Sockburn, Christchurch',
      'Islington, Christchurch',
      'Yaldhurst, Christchurch',
      'West Melton, Christchurch',
      'Darfield, Christchurch',
      'Leeston, Christchurch',
      'Southbridge, Christchurch',
      'Dunsandel, Christchurch',
      'Rakaia, Christchurch',
      'Ashburton, Christchurch',
      'Geraldine, Christchurch',
      'Temuka, Christchurch',
      'Timaru, Christchurch',
      'Oamaru, Christchurch',
      'Palmerston, Christchurch',
      'Waikouaiti, Christchurch',
      'Dunedin, Christchurch',
      'Mosgiel, Christchurch',
      'Balclutha, Christchurch',
      'Milton, Christchurch',
      'Lawrence, Christchurch',
      'Roxburgh, Christchurch',
      'Alexandra, Christchurch',
      'Cromwell, Christchurch',
      'Wanaka, Christchurch',
      'Queenstown, Christchurch',
      'Arrowtown, Christchurch',
      'Glenorchy, Christchurch',
      'Te Anau, Christchurch',
      'Manapouri, Christchurch',
      'Milford Sound, Christchurch',
      'Franz Josef, Christchurch',
      'Fox Glacier, Christchurch',
      'Haast, Christchurch',
      'Wanaka, Christchurch',
      'Cromwell, Christchurch',
      'Alexandra, Christchurch',
      'Roxburgh, Christchurch',
      'Lawrence, Christchurch',
      'Milton, Christchurch',
      'Balclutha, Christchurch',
      'Mosgiel, Christchurch',
      'Dunedin, Christchurch',
      'Waikouaiti, Christchurch',
      'Palmerston, Christchurch',
      'Oamaru, Christchurch',
      'Timaru, Christchurch',
      'Temuka, Christchurch',
      'Geraldine, Christchurch',
      'Ashburton, Christchurch',
      'Rakaia, Christchurch',
      'Dunsandel, Christchurch',
      'Southbridge, Christchurch',
      'Leeston, Christchurch',
      'Darfield, Christchurch',
      'West Melton, Christchurch',
      'Yaldhurst, Christchurch',
      'Islington, Christchurch',
      'Sockburn, Christchurch',
      'Hornby, Christchurch',
      'Bromley, Christchurch',
      'Parklands, Christchurch',
      'Burwood, Christchurch',
      'Shirley, Christchurch',
      'Belfast, Christchurch',
      'Lincoln, Christchurch',
      'Rolleston, Christchurch',
      'Kaiapoi, Christchurch',
      'Rangiora, Christchurch',
      'Akaroa, Christchurch',
      'Lyttelton, Christchurch',
      'Sumner, Christchurch',
      'New Brighton, Christchurch',
      'Linwood, Christchurch',
      'Woolston, Christchurch',
      'Sydenham, Christchurch',
      'Addington, Christchurch',
      'Riccarton, Christchurch',
      'Fendalton, Christchurch',
      'Merivale, Christchurch',
      'Fendalton Road, Christchurch',
      'Riccarton Road, Christchurch',
      'Papanui Road, Christchurch',
      'Bealey Avenue, Christchurch',
      'Moorhouse Avenue, Christchurch',
      'St Asaph Street, Christchurch',
      'Tuam Street, Christchurch',
      'Lichfield Street, Christchurch',
      'Manchester Street, Christchurch',
      'High Street, Christchurch',
      'Cashel Street, Christchurch',
      'Colombo Street, Christchurch',
    ];
    
    // Filter locations that match the input
    const matchingLocations = specificLocations.filter(location => 
      location.toLowerCase().includes(lowerInput)
    );
    
    // Add some general area suggestions if input is short
    const generalAreas = [
      'Auckland CBD',
      'Wellington CBD', 
      'Christchurch CBD',
      'Queenstown Central',
      'Dunedin Central',
      'Hamilton Central',
      'Tauranga Central',
      'Napier Central',
      'Rotorua Central',
      'New Plymouth Central',
      'Palmerston North Central',
      'Whangarei Central',
      'Invercargill Central',
      'Nelson Central',
      'Whanganui Central',
      'Gisborne Central',
      'Timaru Central',
      'Taupo Central',
      'Whakatane Central',
      'Blenheim Central',
      'Oamaru Central',
      'Greymouth Central',
      'Hokitika Central',
      'Wanaka Central',
      'Te Anau Central',
      'Picton Central',
      'Kaikoura Central',
      'Franz Josef Village',
      'Fox Glacier Village',
      'Milford Sound Terminal',
      'Mount Cook Village',
      'Lake Tekapo Village',
      'Twizel Central',
      'Omarama Central',
    ];
    
    // Combine specific matches with general areas if input is short
    if (lowerInput.length <= 3) {
      const generalMatches = generalAreas.filter(area => 
        area.toLowerCase().includes(lowerInput)
      );
      return [...matchingLocations, ...generalMatches].slice(0, 8);
    }
    
    return matchingLocations.slice(0, 8);
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {ideas.map((idea, index) => (
                    <article
                      key={index}
                      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 group focus-within:ring-2 focus-within:ring-pink-500 focus-within:ring-offset-2"
                      tabIndex={0}
                      role="article"
                      aria-labelledby={`idea-title-${index}`}
                    >
                      <div className="p-6">
                        {/* Header with icon and badges */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div
                              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg"
                              style={{ backgroundColor: getCategoryColor(idea.category) }}
                              aria-hidden="true"
                            >
                              {getCategoryIcon(idea.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 
                                id={`idea-title-${index}`}
                                className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors duration-200"
                              >
                                {idea.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {idea.category}
                              </p>
                            </div>
                          </div>
                          
                          {/* Badges */}
                          {idea.isRealPlace && (
                            <div className="flex flex-col items-end space-y-1">
                              {idea.rating && (
                                <div className="flex items-center space-x-1 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-full">
                                  <Icon name="star" size="sm" className="text-yellow-600" aria-hidden="true" />
                                  <span className="text-xs font-semibold text-yellow-800" aria-label={`Rating: ${idea.rating} out of 5 stars`}>
                                    {idea.rating}
                                  </span>
                                </div>
                              )}
                              <div className="bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                                <span className="text-xs font-semibold text-green-800">Verified Place</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">
                          {idea.description}
                        </p>

                        {/* Address for real places */}
                        {idea.isRealPlace && idea.address && (
                          <div className="flex items-start space-x-2 text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                            <Icon name="map-pin" size="sm" className="text-gray-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <span className="leading-relaxed">{idea.address}</span>
                          </div>
                        )}

                        {/* Details */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Icon name="clock" size="sm" className="text-gray-500" aria-hidden="true" />
                              <span aria-label={`Duration: ${idea.duration}`}>{idea.duration}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Icon name="dollar-sign" size="sm" className="text-gray-500" aria-hidden="true" />
                              <span aria-label={`Estimated cost: ${idea.estimatedCost}`}>{idea.estimatedCost}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end space-x-3">
                          {idea.isRealPlace && (
                            <button
                              onClick={() => handleViewDetails(idea)}
                              className="inline-flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 focus:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                              aria-label={`View details and website for ${idea.title}`}
                            >
                              <Icon name="external-link" size="sm" className="mr-2" aria-hidden="true" />
                              View Details
                            </button>
                          )}
                          <button
                            onClick={() => handleCreateEvent(idea)}
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg text-sm font-semibold hover:from-pink-600 hover:to-pink-700 focus:from-pink-600 focus:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transform hover:scale-105"
                            aria-label={`Create event for ${idea.title}`}
                          >
                            <Icon name="plus" size="sm" className="mr-2" aria-hidden="true" />
                            Create Event
                          </button>
                        </div>
                      </div>
                    </article>
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
