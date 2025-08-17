import { NextResponse } from 'next/server';

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

    // For now, we'll use a simple AI-like response system
    // In production, you'd integrate with OpenAI, Google Places API, or similar
    const ideas = generateIdeas(location, selectedFilters);

    return NextResponse.json({
      success: true,
      ideas,
      location,
      filters: selectedFilters
    });

  } catch (error) {
    console.error('Error generating ideas:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate ideas' 
    }, { status: 500 });
  }
}

function generateIdeas(location, filters) {
  const ideas = [];
  
  // Base ideas that work for any location
  const baseIdeas = [
    {
      title: "Local Food Adventure",
      description: "Explore the best local restaurants and cafes in the area",
      category: "restaurant",
      estimatedCost: "$20-50 per person",
      duration: "2-4 hours"
    },
    {
      title: "Bar Hopping Tour",
      description: "Visit multiple pubs and bars to experience the local nightlife",
      category: "pub",
      estimatedCost: "$30-80 per person",
      duration: "3-5 hours"
    }
  ];

  // Filter-specific ideas
  const filterIdeas = {
    restaurant: [
      {
        title: "Culinary Walking Tour",
        description: "Sample dishes from different restaurants in the area",
        category: "restaurant",
        estimatedCost: "$40-100 per person",
        duration: "2-3 hours"
      }
    ],
    pub: [
      {
        title: "Craft Beer Tasting",
        description: "Visit local breweries and pubs for craft beer sampling",
        category: "pub",
        estimatedCost: "$25-60 per person",
        duration: "2-4 hours"
      }
    ],
    sports: [
      {
        title: "Local Sports Game",
        description: "Watch a local sports team play",
        category: "sports",
        estimatedCost: "$20-100 per person",
        duration: "2-3 hours"
      },
      {
        title: "Outdoor Sports Activity",
        description: "Play basketball, soccer, or other outdoor sports",
        category: "sports",
        estimatedCost: "$0-30 per person",
        duration: "1-3 hours"
      }
    ],
    pool: [
      {
        title: "Swimming & Pool Games",
        description: "Visit a local pool for swimming and pool games",
        category: "pool",
        estimatedCost: "$10-25 per person",
        duration: "2-4 hours"
      }
    ],
    "live music": [
      {
        title: "Live Music Venue",
        description: "Check out local live music performances",
        category: "live music",
        estimatedCost: "$15-50 per person",
        duration: "2-4 hours"
      }
    ],
    concert: [
      {
        title: "Concert Night",
        description: "Attend a concert at a local venue",
        category: "concert",
        estimatedCost: "$30-150 per person",
        duration: "3-5 hours"
      }
    ],
    "music festival": [
      {
        title: "Music Festival",
        description: "Attend a local music festival",
        category: "music festival",
        estimatedCost: "$50-200 per person",
        duration: "4-8 hours"
      }
    ]
  };

  // Add base ideas
  ideas.push(...baseIdeas);

  // Add filter-specific ideas
  filters.forEach(filter => {
    if (filterIdeas[filter]) {
      ideas.push(...filterIdeas[filter]);
    }
  });

  // Add location-specific ideas
  const locationIdeas = generateLocationSpecificIdeas(location, filters);
  ideas.push(...locationIdeas);

  // Shuffle and limit to 8 ideas
  return shuffleArray(ideas).slice(0, 8);
}

function generateLocationSpecificIdeas(location, filters) {
  const ideas = [];
  const locationLower = location.toLowerCase();

  // Add some location-specific ideas based on common patterns
  if (locationLower.includes('park') || locationLower.includes('outdoor')) {
    ideas.push({
      title: "Park Picnic & Games",
      description: "Enjoy a picnic with outdoor games and activities",
      category: "sports",
      estimatedCost: "$10-30 per person",
      duration: "2-4 hours"
    });
  }

  if (locationLower.includes('downtown') || locationLower.includes('city')) {
    ideas.push({
      title: "Downtown Exploration",
      description: "Walk around downtown and discover hidden gems",
      category: "restaurant",
      estimatedCost: "$20-60 per person",
      duration: "2-4 hours"
    });
  }

  if (locationLower.includes('beach') || locationLower.includes('coast')) {
    ideas.push({
      title: "Beach Day Activities",
      description: "Enjoy beach sports, swimming, and beachside dining",
      category: "sports",
      estimatedCost: "$15-50 per person",
      duration: "3-6 hours"
    });
  }

  return ideas;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
