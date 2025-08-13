// Event Service for managing events with localStorage persistence

const STORAGE_KEY = 'be-there-or-be-square-events';

// Event structure
const createEvent = (eventData) => ({
  id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  title: eventData.title,
  date: eventData.date,
  time: eventData.time,
  location: eventData.location || '',
  decisionMode: eventData.decisionMode,
  punishment: eventData.punishment,
  participants: [],
  status: 'active', // 'active', 'completed', 'cancelled'
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  flakes: [],
  winner: null,
  loser: null
});

// Get all events from localStorage
const getEvents = () => {
  try {
    const events = localStorage.getItem(STORAGE_KEY);
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('Error reading events from localStorage:', error);
    return [];
  }
};

// Save events to localStorage
const saveEvents = (events) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving events to localStorage:', error);
  }
};

// Get active event (only one can be active at a time)
const getActiveEvent = () => {
  const events = getEvents();
  return events.find(event => event.status === 'active') || null;
};

// Create a new event
const createNewEvent = (eventData) => {
  const events = getEvents();
  
  // Check if there's already an active event
  const activeEvent = events.find(event => event.status === 'active');
  if (activeEvent) {
    throw new Error('There is already an active event. Please cancel or complete the current event first.');
  }
  
  const newEvent = createEvent(eventData);
  events.push(newEvent);
  saveEvents(events);
  
  return newEvent;
};

// Update an event
const updateEvent = (eventId, updates) => {
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

// Delete/cancel an event
const deleteEvent = (eventId) => {
  const events = getEvents();
  const eventIndex = events.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) {
    throw new Error('Event not found');
  }
  
  // Remove the event completely
  events.splice(eventIndex, 1);
  saveEvents(events);
  
  return true;
};

// Cancel an active event (mark as cancelled instead of deleting)
const cancelEvent = (eventId) => {
  return updateEvent(eventId, { status: 'cancelled' });
};

// Complete an event
const completeEvent = (eventId, result) => {
  return updateEvent(eventId, {
    status: 'completed',
    winner: result.winner,
    loser: result.loser,
    flakes: result.flakes || []
  });
};

// Add participant to event
const addParticipant = (eventId, participantName) => {
  const events = getEvents();
  const eventIndex = events.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) {
    throw new Error('Event not found');
  }
  
  const participant = {
    id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: participantName,
    joinedAt: new Date().toISOString()
  };
  
  events[eventIndex].participants.push(participant);
  events[eventIndex].updatedAt = new Date().toISOString();
  
  saveEvents(events);
  return events[eventIndex];
};

// Remove participant from event
const removeParticipant = (eventId, participantId) => {
  const events = getEvents();
  const eventIndex = events.findIndex(event => event.id === eventId);
  
  if (eventIndex === -1) {
    throw new Error('Event not found');
  }
  
  events[eventIndex].participants = events[eventIndex].participants.filter(
    p => p.id !== participantId
  );
  events[eventIndex].updatedAt = new Date().toISOString();
  
  saveEvents(events);
  return events[eventIndex];
};

// Get past events (completed or cancelled)
const getPastEvents = () => {
  const events = getEvents();
  return events.filter(event => event.status === 'completed' || event.status === 'cancelled');
};

// Clear all events (for testing/reset)
const clearAllEvents = () => {
  localStorage.removeItem(STORAGE_KEY);
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
  clearAllEvents
};
