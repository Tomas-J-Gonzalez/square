// Event Service for managing events with localStorage persistence
// Provides CRUD operations for events with proper error handling and validation

const STORAGE_KEY = 'show-up-or-else-events';

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
    dateTime: eventData.dateTime,
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
 * Gets all events from localStorage
 * @returns {Array<Event>} Array of events
 */
const getEvents = () => {
  try {
    const events = localStorage.getItem(STORAGE_KEY);
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('Error reading events from localStorage:', error);
    return [];
  }
};

/**
 * Saves events to localStorage
 * @param {Array<Event>} events - Events to save
 */
const saveEvents = (events) => {
  try {
    if (!Array.isArray(events)) {
      throw new Error('Events must be an array');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving events to localStorage:', error);
    throw new Error('Failed to save events');
  }
};

/**
 * Gets the active event (only one can be active at a time)
 * @returns {Event|null} Active event or null
 */
const getActiveEvent = () => {
  const events = getEvents();
  return events.find(event => event.status === 'active') || null;
};

/**
 * Creates a new event
 * @param {Object} eventData - Event data
 * @returns {Event} Created event
 * @throws {Error} If there's already an active event
 */
const createNewEvent = (eventData) => {
  const events = getEvents();
  
  // Check if there's already an active event
  const activeEvent = events.find(event => event.status === 'active');
  if (activeEvent) {
    throw new Error(`There is already an active event. Please cancel or complete the current event first. [View Current Event](/event/${activeEvent.id})`);
  }
  
  const newEvent = createEvent(eventData);
  events.push(newEvent);
  saveEvents(events);
  
  return newEvent;
};

/**
 * Updates an event
 * @param {string} eventId - Event ID
 * @param {Object} updates - Updates to apply
 * @returns {Event} Updated event
 * @throws {Error} If event not found
 */
const updateEvent = (eventId, updates) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }

  const events = getEvents();
  const eventIndex = events.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) {
    throw new Error('Event not found');
  }
  
  events[eventIndex] = {
    ...events[eventIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveEvents(events);
  return events[eventIndex];
};

/**
 * Deletes an event completely
 * @param {string} eventId - Event ID
 * @returns {boolean} Success status
 * @throws {Error} If event not found
 */
const deleteEvent = (eventId) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }

  const events = getEvents();
  const eventIndex = events.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) {
    throw new Error('Event not found');
  }
  
  events.splice(eventIndex, 1);
  saveEvents(events);
  
  return true;
};

/**
 * Cancels an active event (marks as cancelled)
 * @param {string} eventId - Event ID
 * @returns {Event} Cancelled event
 */
const cancelEvent = (eventId) => {
  return updateEvent(eventId, { status: 'cancelled' });
};

/**
 * Completes an event
 * @param {string} eventId - Event ID
 * @param {Object} result - Event result
 * @returns {Event} Completed event
 */
const completeEvent = (eventId, result) => {
  return updateEvent(eventId, {
    status: 'completed',
    winner: result.winner,
    loser: result.loser,
    flakes: result.flakes || []
  });
};

/**
 * Adds a friend to an event
 * @param {string} eventId - Event ID
 * @param {Object} participantData - Friend data
 * @returns {Event} Updated event
 * @throws {Error} If event not found or invalid friend data
 */
const addParticipant = (eventId, participantData) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }
  if (!participantData?.name?.trim()) {
    throw new Error('Friend name is required');
  }
  // Email and message are optional to support guest RSVPs and quick adds

  const events = getEvents();
  const eventIndex = events.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) {
    throw new Error('Event not found');
  }
  
  const participant = {
    id: `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: participantData.name.trim(),
    email: (participantData.email || '').trim(),
    message: (participantData.message || '').trim(),
    joinedAt: new Date().toISOString()
  };
  
  events[eventIndex].participants.push(participant);
  events[eventIndex].updatedAt = new Date().toISOString();
  
  saveEvents(events);
  return events[eventIndex];
};

/**
 * Removes a friend from an event
 * @param {string} eventId - Event ID
 * @param {string} participantId - Friend ID
 * @returns {Event} Updated event
 * @throws {Error} If event or friend not found
 */
const removeParticipant = (eventId, participantId) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }
  if (!participantId) {
    throw new Error('Friend ID is required');
  }

  const events = getEvents();
  const eventIndex = events.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) {
    throw new Error('Event not found');
  }
  
  const participantIndex = events[eventIndex].participants.findIndex(
    p => p.id === participantId
  );
  
  if (participantIndex === -1) {
    throw new Error('Friend not found');
  }
  
  events[eventIndex].participants.splice(participantIndex, 1);
  events[eventIndex].updatedAt = new Date().toISOString();
  
  saveEvents(events);
  return events[eventIndex];
};

/**
 * Gets past events (completed or cancelled)
 * @returns {Array<Event>} Array of past events
 */
const getPastEvents = () => {
  const events = getEvents();
  return events.filter(event => event.status === 'completed' || event.status === 'cancelled');
};

/**
 * Clears all events (for testing/reset)
 */
const clearAllEvents = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing events:', error);
    throw new Error('Failed to clear events');
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
  clearAllEvents,
  validateEventData
};
