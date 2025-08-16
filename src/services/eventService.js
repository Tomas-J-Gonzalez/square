// Event Service for managing events with Supabase persistence
// Provides CRUD operations for events with proper error handling and validation

// API helper function
const callEventsAPI = async (action, data = {}, userEmail) => {
  // Require userEmail parameter for all API calls
  if (!userEmail) {
    throw new Error('User email is required for all event operations');
  }

  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      userEmail,
      ...data
    })
  });

  console.log('Event service - API response status:', response.status);
  console.log('Event service - API response headers:', response.headers);

  // Check if response is ok
  if (!response.ok) {
    console.error('Event service - API response not ok:', response.status, response.statusText);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  // Get response text first to debug
  const responseText = await response.text();
  console.log('Event service - API response text:', responseText);

  // Try to parse JSON
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (parseError) {
    console.error('Event service - JSON parse error:', parseError);
    console.error('Event service - Response text that failed to parse:', responseText);
    throw new Error(`Invalid JSON response from API: ${responseText}`);
  }
  
  if (!result.success) {
    throw new Error(result.error || 'API call failed');
  }
  
  return result;
};

/**
 * Event structure
 * @typedef {Object} Event
 * @property {string} id - Unique event identifier
 * @property {string} title - Event title
 * @property {string} date - Event date (YYYY-MM-DD)
 * @property {string} time - Event time (HH:MM)
 * @property {string} dateTime - Combined date and time (ISO string)
 * @property {string} location - Event location (optional)
 * @property {string} decisionMode - How to decide on flakes: 'vote', 'chance', 'game', 'none'
 * @property {string} punishment - Punishment for flakes
 * @property {Array} participants - List of friends
 * @property {string} status - Event status: 'active', 'completed', 'cancelled'
 * @property {string} createdAt - Creation timestamp (ISO string)
 * @property {string} updatedAt - Last update timestamp (ISO string)
 * @property {Array} flakes - List of flake names
 * @property {Object|null} winner - Winner participant object
 * @property {Object|null} loser - Loser participant object
 */

/**
 * Friend structure
 * @typedef {Object} Participant
 * @property {string} id - Unique friend identifier
 * @property {string} name - Friend name
 * @property {string} email - Friend email
 * @property {string} message - Friend message
 * @property {string} joinedAt - Join timestamp (ISO string)
 */

/**
 * Creates a new event object
 * @param {Object} eventData - Event data
 * @returns {Event} New event object
 */
const createEvent = (eventData) => {
  // Validate required fields
  if (!eventData.title?.trim()) {
    throw new Error('Event title is required');
  }
  if (!eventData.date) {
    throw new Error('Event date is required');
  }
  if (!eventData.time) {
    throw new Error('Event time is required');
  }
  if (!eventData.decisionMode) {
    throw new Error('Decision mode is required');
  }
  if (!eventData.punishment?.trim()) {
    throw new Error('Punishment is required');
  }

  return {
    id: eventData.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: eventData.title.trim(),
    date: eventData.date,
    time: eventData.time,
    location: eventData.location?.trim() || '',
    decisionMode: eventData.decisionMode,
    punishment: eventData.punishment.trim(),
    participants: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    flakes: [],
    winner: null,
    loser: null
  };
};

/**
 * Gets all events from the API for the current user
 * @param {string} userEmail - User email (required)
 * @returns {Promise<Array<Event>>} Array of events
 */
const getEvents = async (userEmail) => {
  try {
    const result = await callEventsAPI('getEvents', {}, userEmail);
    
    // Convert API format to event format
    return (result.events || []).map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      decisionMode: event.decision_mode,
      punishment: event.punishment,
      participants: [], // Will be fetched separately
      status: 'active', // Default status since it's not in database
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      flakes: [],
      winner: null,
      loser: null
    }));
  } catch (error) {
    console.error('Error in getEvents:', error);
    return [];
  }
};

/**
 * Gets the active event (only one can be active at a time)
 * @param {string} userEmail - User email (required)
 * @returns {Promise<Event|null>} Active event or null
 */
const getActiveEvent = async (userEmail) => {
  try {
    const events = await getEvents(userEmail);
    return events.find(event => event.status === 'active') || null;
  } catch (error) {
    console.error('Error getting active event:', error);
    return null;
  }
};

/**
 * Creates a new event via the API
 * @param {Object} eventData - Event data
 * @param {string} userEmail - User email (required)
 * @returns {Promise<Event>} Created event
 * @throws {Error} If there's already an active event
 */
const createNewEvent = async (eventData, userEmail) => {
  try {
    const result = await callEventsAPI('createEvent', { eventData }, userEmail);
    
    // Convert from API response to event format
    return {
      id: result.event.id,
      title: result.event.title,
      date: result.event.date,
      time: result.event.time,
      location: result.event.location,
      decisionMode: result.event.decision_mode,
      punishment: result.event.punishment,
      participants: [],
      status: result.event.status || 'active',
      createdAt: result.event.created_at,
      updatedAt: result.event.updated_at,
      flakes: [],
      winner: null,
      loser: null
    };
  } catch (error) {
    console.error('Error in createNewEvent:', error);
    throw error;
  }
};

/**
 * Updates an event via the API
 * @param {string} eventId - Event ID
 * @param {Object} updates - Updates to apply
 * @param {string} userEmail - User email (required)
 * @returns {Promise<Event>} Updated event
 * @throws {Error} If event not found
 */
const updateEvent = async (eventId, updates, userEmail) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }

  try {
    const result = await callEventsAPI('updateEvent', { eventId, updates }, userEmail);
    
    // Convert back to event format
    return {
      id: result.event.id,
      title: result.event.title,
      date: result.event.date,
      time: result.event.time,
      location: result.event.location,
      decisionMode: result.event.decision_mode,
      punishment: result.event.punishment,
      participants: [],
      status: 'active', // Default status since it's not in database
      createdAt: result.event.created_at,
      updatedAt: result.event.updated_at,
      flakes: [],
      winner: null,
      loser: null
    };
  } catch (error) {
    console.error('Error in updateEvent:', error);
    throw error;
  }
};

/**
 * Deletes an event completely via the API
 * @param {string} eventId - Event ID
 * @param {string} userEmail - Optional user email (will be retrieved from localStorage if not provided)
 * @returns {Promise<boolean>} Success status
 * @throws {Error} If event not found
 */
const deleteEvent = async (eventId, userEmail = null) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }

  try {
    await callEventsAPI('deleteEvent', { eventId }, userEmail);
    return true;
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    throw error;
  }
};

/**
 * Cancels an event via the API
 * @param {string} eventId - Event ID
 * @param {string} userEmail - User email (required)
 * @returns {Promise<Event>} Cancelled event
 * @throws {Error} If event not found
 */
const cancelEvent = async (eventId, userEmail) => {
  return updateEvent(eventId, { status: 'cancelled' }, userEmail);
};

/**
 * Completes an event via the API
 * @param {string} eventId - Event ID
 * @param {string} userEmail - User email (required)
 * @returns {Promise<Event>} Completed event
 * @throws {Error} If event not found
 */
const completeEvent = async (eventId, userEmail) => {
  return updateEvent(eventId, { status: 'completed' }, userEmail);
};

/**
 * Adds a participant to an event
 * @param {string} eventId - Event ID
 * @param {Object} participantData - Participant data
 * @returns {Promise<Event>} Updated event
 * @throws {Error} If event not found
 */
const addParticipant = async (eventId, participantData) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }
  if (!participantData.name?.trim()) {
    throw new Error('Participant name is required');
  }

  try {
    // Add participant via RSVP API
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        name: participantData.name.trim(),
        email: participantData.email?.trim() || null,
        willAttend: true,
        message: participantData.message?.trim() || null
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to add participant');
    }

    // Return the updated event (this would need userEmail, but we don't have it in this context)
    // For now, return a success indicator
    return { success: true };
  } catch (error) {
    console.error('Error in addParticipant:', error);
    throw error;
  }
};

/**
 * Removes a participant from an event
 * @param {string} eventId - Event ID
 * @param {string} participantId - Participant ID
 * @returns {Promise<Event>} Updated event
 * @throws {Error} If event or participant not found
 */
const removeParticipant = async (eventId, participantId) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }
  if (!participantId) {
    throw new Error('Participant ID is required');
  }

  try {
    // For now, we'll use a direct API call to update the RSVP
    // This could be moved to a dedicated API endpoint later
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        participantId,
        willAttend: false
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to remove participant');
    }

    // Return the updated event (this would need userEmail, but we don't have it in this context)
    // For now, return a success indicator
    return { success: true };
  } catch (error) {
    console.error('Error in removeParticipant:', error);
    throw error;
  }
};

/**
 * Gets past events (completed or cancelled)
 * @param {string} userEmail - User email (required)
 * @returns {Promise<Array<Event>>} Array of past events
 */
const getPastEvents = async (userEmail) => {
  try {
    const events = await getEvents(userEmail);
    return events.filter(event => event.status === 'completed' || event.status === 'cancelled');
  } catch (error) {
    console.error('Error in getPastEvents:', error);
    return [];
  }
};

/**
 * Validates event data
 * @param {Object} eventData - Event data to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
const validateEventData = (eventData) => {
  if (!eventData) {
    throw new Error('Event data is required');
  }
  
  if (!eventData.title?.trim()) {
    throw new Error('Event title is required');
  }
  
  if (!eventData.date) {
    throw new Error('Event date is required');
  }
  
  if (!eventData.time) {
    throw new Error('Event time is required');
  }
  
  if (!eventData.decisionMode) {
    throw new Error('Decision mode is required');
  }
  
  if (!eventData.punishment?.trim()) {
    throw new Error('Punishment is required');
  }
  
  return true;
};

export const eventService = {
  getEvents,
  getActiveEvent,
  createNewEvent,
  updateEvent,
  deleteEvent,
  cancelEvent,
  completeEvent,
  addParticipant,
  removeParticipant,
  getPastEvents,
  validateEventData
};
