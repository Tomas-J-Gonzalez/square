# New Zealand Places API Setup Guide

## Overview
This guide will help you set up the APIs needed for the "What are we doing?" feature to provide real New Zealand location-based recommendations.

## Required APIs

### 1. Google Places API
**Purpose**: Get real places, coordinates, and detailed information about venues in New Zealand.

**Setup Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
   - Maps JavaScript API
4. Create API credentials:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Restrict the API key to:
     - Places API
     - Geocoding API
     - Maps JavaScript API
   - Set application restrictions to "HTTP referrers" and add your domain
5. Copy the API key

**Environment Variable**:
```bash
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

**Cost**: 
- First $200/month free
- Places API: $17 per 1000 requests
- Geocoding API: $5 per 1000 requests

### 2. OpenAI API
**Purpose**: Generate intelligent, contextual activity suggestions based on location and user preferences.

**Setup Steps**:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and add billing information
3. Generate an API key:
   - Go to "API Keys" → "Create new secret key"
   - Copy the key (starts with `sk-`)
4. Set usage limits in billing settings

**Environment Variable**:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Cost**:
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- Very cost-effective for this use case

## Alternative APIs (Optional)

### 3. Eventfinda API (New Zealand Events)
**Purpose**: Get real events happening in New Zealand locations.

**Setup**:
- Visit [Eventfinda API](https://www.eventfinda.co.nz/api/v2/index)
- Free tier available
- Provides events, venues, and ticketing information

### 4. Zomato API (Restaurant Data)
**Purpose**: Enhanced restaurant recommendations with reviews and menus.

**Setup**:
- Visit [Zomato API](https://developers.zomato.com/)
- Free tier: 1000 requests/day
- Provides restaurant ratings, menus, and photos

## Environment Variables Setup

Add these to your `.env.local` file:

```bash
# Required APIs
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional APIs
EVENTFINDA_API_KEY=your_eventfinda_api_key_here
ZOMATO_API_KEY=your_zomato_api_key_here
```

## Vercel Deployment

For Vercel deployment, add these environment variables in your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with the appropriate value
4. Redeploy your application

## API Usage Limits & Optimization

### Google Places API
- **Quota**: 100,000 requests/day (free tier)
- **Optimization**: 
  - Cache results for 24 hours
  - Use radius-based searches efficiently
  - Implement request batching

### OpenAI API
- **Quota**: Based on your billing plan
- **Optimization**:
  - Cache AI responses for similar queries
  - Use shorter prompts when possible
  - Implement rate limiting

## Testing the Integration

1. **Test Location Search**:
   ```bash
   curl -X POST http://localhost:3000/api/generate-ideas \
     -H "Content-Type: application/json" \
     -d '{"location": "Auckland CBD", "filters": ["restaurant", "pub"]}'
   ```

2. **Verify New Zealand Results**:
   - All results should be in New Zealand
   - Coordinates should be within NZ bounds
   - Addresses should include NZ formatting

## Error Handling

The API includes comprehensive error handling for:
- Invalid locations
- API rate limits
- Network failures
- Invalid responses

## Cost Estimation

**Monthly costs for 1000 users**:
- Google Places API: ~$50-100
- OpenAI API: ~$10-20
- **Total**: ~$60-120/month

## Security Considerations

1. **API Key Protection**:
   - Never expose API keys in client-side code
   - Use environment variables
   - Implement proper CORS policies

2. **Rate Limiting**:
   - Implement user-based rate limiting
   - Cache responses to reduce API calls
   - Monitor usage and set alerts

3. **Data Privacy**:
   - Don't store user location data unnecessarily
   - Implement proper data retention policies
   - Follow NZ privacy laws

## Monitoring & Analytics

Set up monitoring for:
- API response times
- Error rates
- Usage patterns
- Cost tracking

## Support & Troubleshooting

### Common Issues:
1. **"Location not found"**: Ensure location is in New Zealand
2. **"API quota exceeded"**: Check usage limits and implement caching
3. **"Invalid API key"**: Verify environment variables are set correctly

### Debug Mode:
Enable debug logging by setting:
```bash
DEBUG_PLACES_API=true
```

This will log detailed API requests and responses for troubleshooting.

## Next Steps

1. Set up the APIs following this guide
2. Test with New Zealand locations
3. Monitor usage and costs
4. Optimize based on user feedback
5. Consider adding more NZ-specific data sources

## Resources

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [New Zealand Tourism Data](https://www.tourismnewzealand.com/)
- [Eventfinda API Documentation](https://www.eventfinda.co.nz/api/v2/index)
