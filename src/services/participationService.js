// Participation Service for managing events that users are participating in
// This handles events from server RSVPs and local participation

const PARTICIPATION_STORAGE_KEY = 'be-there-or-be-square-participations';

/**
 * Participation structure
 * @typedef {Object} Participation
 * @property {string} eventId - Event ID
 * @property {string} eventTitle - Event title
 * @property {string} eventDate - Event date
 * @property {string} eventTime - Event time
 * @property {string} eventLocation - Event location
 * @property {string} organizerName - Name of the event organizer
 * @property {string} participantName - Name of the participant
 * @property {string} participantEmail - Email of the participant
 * @property {string} status - Participation status: 'confirmed', 'declined'
 * @property {string} message - Optional message from participant
 * @property {string} joinedAt - Join timestamp (ISO string)
 * @property {string} source - Source of participation: 'local', 'server'
 */

/**
 * Gets all participations from localStorage
 * @returns {Array<Participation>} Array of participations
 */
const getParticipations = () => {
  try {
    const participations = localStorage.getItem(PARTICIPATION_STORAGE_KEY);
    return participations ? JSON.parse(participations) : [];
  } catch (error) {
    console.error('Error reading participations from localStorage:', error);
    return [];
  }
};

/**
 * Saves participations to localStorage
 * @param {Array<Participation>} participations - Participations to save
 */
const saveParticipations = (participations) => {
  try {
    if (!Array.isArray(participations)) {
      throw new Error('Participations must be an array');
    }
    localStorage.setItem(PARTICIPATION_STORAGE_KEY, JSON.stringify(participations));
  } catch (error) {
    console.error('Error saving participations to localStorage:', error);
    throw new Error('Failed to save participations');
  }
};

/**
 * Adds a participation record
 * @param {Object} participationData - Participation data
 * @returns {Participation} Created participation
 */
const addParticipation = (participationData) => {
  const participations = getParticipations();
  
  // Check if already participating in this event
  const existingIndex = participations.findIndex(p => 
    p.eventId === participationData.eventId && 
    p.participantEmail === participationData.participantEmail
  );
  
  if (existingIndex !== -1) {
    // Update existing participation
    participations[existingIndex] = {
      ...participations[existingIndex],
      ...participationData,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Add new participation
    const newParticipation = {
      id: `participation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...participationData,
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    participations.push(newParticipation);
  }
  
  saveParticipations(participations);
  return participations[existingIndex !== -1 ? existingIndex : participations.length - 1];
};

/**
 * Gets participations for a specific user
 * @param {string} userEmail - User's email
 * @returns {Array<Participation>} Array of user's participations
 */
const getUserParticipations = (userEmail) => {
  const participations = getParticipations();
  return participations.filter(p => p.participantEmail === userEmail);
};

/**
 * Gets participations for a specific event
 * @param {string} eventId - Event ID
 * @returns {Array<Participation>} Array of event participations
 */
const getEventParticipations = (eventId) => {
  const participations = getParticipations();
  return participations.filter(p => p.eventId === eventId);
};

/**
 * Removes a participation
 * @param {string} eventId - Event ID
 * @param {string} participantEmail - Participant email
 * @returns {boolean} Success status
 */
const removeParticipation = (eventId, participantEmail) => {
  const participations = getParticipations();
  const index = participations.findIndex(p => 
    p.eventId === eventId && p.participantEmail === participantEmail
  );
  
  if (index === -1) {
    return false;
  }
  
  participations.splice(index, 1);
  saveParticipations(participations);
  return true;
};

/**
 * Syncs server RSVPs with local participations
 * @param {string} userEmail - User's email
 * @returns {Promise<Array<Participation>>} Updated participations
 */
const syncServerParticipations = async (userEmail) => {
  try {
    const { supabase } = await import('../../lib/supabaseClient');
    
    // Get all RSVPs for this user from server
    const { data: rsvps } = await supabase
      .from('event_rsvps')
      .select(`
        event_id,
        name,
        will_attend,
        created_at,
        events (
          title,
          date,
          time,
          location,
          invited_by
        )
      `)
      .eq('name', userEmail.split('@')[0]); // Match by name part of email
    
    if (!Array.isArray(rsvps)) return getUserParticipations(userEmail);
    
    // Convert server RSVPs to participations
    const serverParticipations = rsvps.map(rsvp => ({
      eventId: rsvp.event_id,
      eventTitle: rsvp.events?.title || 'Unknown Event',
      eventDate: rsvp.events?.date || '',
      eventTime: rsvp.events?.time || '',
      eventLocation: rsvp.events?.location || '',
      organizerName: rsvp.events?.invited_by || 'Unknown',
      participantName: rsvp.name,
      participantEmail: userEmail,
      status: rsvp.will_attend ? 'confirmed' : 'declined',
      message: rsvp.will_attend ? 'Confirmed attendance' : 'Cannot attend',
      joinedAt: rsvp.created_at,
      source: 'server'
    }));
    
    // Merge with existing local participations
    const localParticipations = getUserParticipations(userEmail);
    const merged = [...localParticipations];
    
    serverParticipations.forEach(serverPart => {
      const existingIndex = merged.findIndex(p => p.eventId === serverPart.eventId);
      if (existingIndex === -1) {
        merged.push(serverPart);
      }
    });
    
    // Save merged participations
    const allParticipations = getParticipations();
    const userParticipations = allParticipations.filter(p => p.participantEmail !== userEmail);
    saveParticipations([...userParticipations, ...merged]);
    
    return merged;
  } catch (error) {
    console.error('Error syncing server participations:', error);
    return getUserParticipations(userEmail);
  }
};

/**
 * Clears all participations (for testing/reset)
 */
const clearAllParticipations = () => {
  try {
    localStorage.removeItem(PARTICIPATION_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing participations:', error);
    throw new Error('Failed to clear participations');
  }
};

export const participationService = {
  getParticipations,
  addParticipation,
  getUserParticipations,
  getEventParticipations,
  removeParticipation,
  syncServerParticipations,
  clearAllParticipations
};
