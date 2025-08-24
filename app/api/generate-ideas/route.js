import { NextResponse } from 'next/server';

// Google Places API configuration for New Zealand
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request) {
  try {
    const { location, filters } = await request.json();

    if (!location) {
      return NextResponse.json({ 
        success: false, 
        error: 'Location is required' 
      }, { status: 400 });
    }

    // Validate filters
    const validFilters = ['pub', 'restaurant', 'sports', 'pool', 'live music', 'concert', 'music festival'];
    const selectedFilters = filters?.filter(f => validFilters.includes(f)) || [];

    // First, get the coordinates for the location using Google Geocoding API
    const coordinates = await getLocationCoordinates(location);
    
    if (!coordinates) {
      return NextResponse.json({ 
        success: false, 
        error: 'Location not found. Please try a different location in New Zealand.' 
      }, { status: 400 });
    }

    // Get real places from Google Places API
    const places = await getNearbyPlaces(coordinates, selectedFilters);
    
    // Generate intelligent suggestions using OpenAI
    const aiSuggestions = await generateAISuggestions(location, selectedFilters, places);
    
    // Combine real places with AI suggestions
    const ideas = combineIdeas(places, aiSuggestions, selectedFilters);

    return NextResponse.json({
      success: true,
      ideas,
      location,
      filters: selectedFilters,
      coordinates
    });

  } catch (error) {
    console.error('Error generating ideas:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate ideas. Please try again.' 
    }, { status: 500 });
  }
}

async function getLocationCoordinates(location) {
  try {
    // Add "New Zealand" to the search to ensure we get NZ results
    const searchQuery = `${location}, New Zealand`;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}&region=nz`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      // Verify it's in New Zealand
      const isInNZ = result.address_components.some(component => 
        component.types.includes('country') && component.long_name === 'New Zealand'
      );
      
      if (isInNZ) {
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
}

async function getNearbyPlaces(coordinates, filters) {
  const places = [];
  const radius = 5000; // 5km radius
  
  // Map our filters to Google Places types
  const placeTypes = {
    restaurant: ['restaurant', 'food'],
    pub: ['bar', 'night_club'],
    sports: ['gym', 'stadium', 'park'],
    pool: ['swimming_pool', 'health'],
    'live music': ['bar', 'night_club', 'establishment'],
    concert: ['stadium', 'establishment'],
    'music festival': ['establishment']
  };

  try {
    for (const filter of filters) {
      const types = placeTypes[filter] || ['establishment'];
      
      for (const type of types) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${radius}&type=${type}&key=${GOOGLE_PLACES_API_KEY}&region=nz`
        );
        
        const data = await response.json();
        
        if (data.results) {
          // Get detailed information for each place
          const detailedPlaces = await Promise.all(
            data.results.slice(0, 3).map(async (place) => {
              const details = await getPlaceDetails(place.place_id);
              return {
                ...place,
                ...details,
                category: filter
              };
            })
          );
          
          places.push(...detailedPlaces);
        }
      }
    }
    
    return places;
  } catch (error) {
    console.error('Error getting nearby places:', error);
    return [];
  }
}

async function getPlaceDetails(placeId) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,opening_hours,rating,price_level,website,reviews&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    const data = await response.json();
    return data.result || {};
  } catch (error) {
    console.error('Error getting place details:', error);
    return {};
  }
}

async function generateAISuggestions(location, filters, places) {
  if (!OPENAI_API_KEY) {
    return [];
  }

  try {
    const prompt = `Generate 4-6 unique activity ideas for a group in ${location}, New Zealand. 
    
Available real places in the area: ${places.map(p => p.name).join(', ')}
Selected interests: ${filters.join(', ')}

For each idea, provide:
- A creative title
- Detailed description including why it's good for groups
- Estimated cost in NZD
- Duration
- Category (one of: ${filters.join(', ')})

Focus on:
- New Zealand culture and activities
- Group-friendly experiences
- Seasonal appropriateness
- Local events and attractions
- Mix of indoor and outdoor activities

Format as JSON array with properties: title, description, category, estimatedCost, duration`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides activity suggestions for groups in New Zealand. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      try {
        const suggestions = JSON.parse(content);
        return Array.isArray(suggestions) ? suggestions : [];
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return [];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return [];
  }
}

function combineIdeas(places, aiSuggestions, filters) {
  const ideas = [];
  
  // Convert real places to idea format
  places.forEach(place => {
    const costLevel = place.price_level || 2;
    const estimatedCost = getCostEstimate(costLevel);
    const duration = getDurationEstimate(place.category);
    
    ideas.push({
      title: place.name,
      description: `Visit ${place.name} - ${place.formatted_address || 'a local favorite'}. ${place.rating ? `Rated ${place.rating}/5 stars.` : ''}`,
      category: place.category,
      estimatedCost,
      duration,
      isRealPlace: true,
      placeId: place.place_id,
      address: place.formatted_address,
      rating: place.rating,
      website: place.website
    });
  });
  
  // Add AI suggestions
  aiSuggestions.forEach(suggestion => {
    ideas.push({
      ...suggestion,
      isRealPlace: false
    });
  });
  
  // Shuffle and limit to 8 ideas
  return shuffleArray(ideas).slice(0, 8);
}

function getCostEstimate(priceLevel) {
  switch (priceLevel) {
    case 1: return '$10-25 per person';
    case 2: return '$20-50 per person';
    case 3: return '$40-80 per person';
    case 4: return '$80+ per person';
    default: return '$20-50 per person';
  }
}

function getDurationEstimate(category) {
  switch (category) {
    case 'restaurant': return '1-2 hours';
    case 'pub': return '2-4 hours';
    case 'sports': return '1-3 hours';
    case 'pool': return '2-4 hours';
    case 'live music': return '2-4 hours';
    case 'concert': return '3-5 hours';
    case 'music festival': return '4-8 hours';
    default: return '2-3 hours';
  }
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
