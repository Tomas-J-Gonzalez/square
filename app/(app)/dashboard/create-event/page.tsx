'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering for authenticated pages
export const dynamic = 'force-dynamic';

interface EventFormData {
  title: string;
  date: string;
  time: string;
  location: string;
  eventType: 'in-person' | 'virtual';
  eventDetails: string;
  punishment: string;
  customPunishment: string;
  access: 'public' | 'private';
  pageVisibility: 'public' | 'private';
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
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: '',
    time: '',
    location: '',
    eventType: 'in-person',
    eventDetails: '',
    punishment: '',
    customPunishment: '',
    access: 'private',
    pageVisibility: 'private'
  });

  // Load pre-filled data from idea generation if available
  useEffect(() => {
    const ideaData = sessionStorage.getItem('ideaData');
    if (ideaData) {
      try {
        const parsedData = JSON.parse(ideaData);
        setFormData(prev => ({
          ...prev,
          title: parsedData.title || '',
          location: parsedData.location || '',
          eventDetails: parsedData.description || ''
        }));
        // Clear the session storage after using it
        sessionStorage.removeItem('ideaData');
      } catch (err) {
        console.error('Error parsing idea data:', err);
      }
    }
  }, []);

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
        invited_by: user.email,
        access: formData.access,
        pageVisibility: formData.pageVisibility
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createEvent', eventData }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to the event's "I'm hosting" page instead of dashboard
        router.push(`/dashboard/event/${data.event.id}`);
      } else {
        setError(data.error || 'Failed to create event');
      }
    } catch (_err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
    
    // Handle location suggestions
    if (field === 'location') {
      const locationValue = value as string;
      if (locationValue.trim().length > 2) {
        const suggestions = generateLocationSuggestions(locationValue);
        setLocationSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow valid date format YYYY-MM-DD
    if (value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      handleInputChange('date', value);
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
    setFormData(prev => ({ ...prev, location: selectedLocation }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Create New Event</h1>
        <p className="text-base sm:text-lg text-gray-600">
          Plan your next gathering and set up the rules for participants.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-8">

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
            <div className="relative">
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
                onBlur={() => {
                  // Delay hiding suggestions to allow for clicks
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                placeholder="Enter event location"
                aria-invalid={formData.location.trim() === '' ? 'true' : 'false'}
                autoComplete="off"
              />
              
              {/* Location Suggestions Dropdown */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectLocation(suggestion)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-inset transition-colors"
                      onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
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


          </div>

          {/* Access Control Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Event Access Settings</h2>
            
            {/* RSVP Access Control */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="publicRsvp"
                  checked={formData.access === 'public'}
                  onChange={(e) => handleInputChange('access', e.target.checked ? 'public' : 'private')}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="publicRsvp" className="text-sm font-medium text-gray-700">
                    Public Event (anyone with link can RSVP)
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    When unchecked, only invited participants can RSVP to your event.
                  </p>
                </div>
              </div>
            </div>

            {/* Event Page Visibility Control */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="publicPage"
                  checked={formData.pageVisibility === 'public'}
                  onChange={(e) => handleInputChange('pageVisibility', e.target.checked ? 'public' : 'private')}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="publicPage" className="text-sm font-medium text-gray-700">
                    Create Public Event Page (anyone with link can view details)
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    When unchecked, only invited participants and you can view the event page.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
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
