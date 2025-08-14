import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { eventService } from '../services/eventService';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

const ViewEvent = () => {
  const router = useRouter();
  const { eventId } = router.query || {};
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const latestEventRef = useRef(null);
  const [serverRsvps, setServerRsvps] = useState([]);
  const [isOrganizer, setIsOrganizer] = useState(false);
  
  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false
  });

  const showModal = (config) => {
    setModal({ ...config, isOpen: true });
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // Helper: fetch RSVPs from server and merge into local event
  const fetchAndMergeRsvps = async (baseEvent) => {
    try {
      const { supabase } = await import('../../lib/supabaseClient');
      if (!supabase) {
        console.warn('Supabase not configured, skipping server sync');
        return baseEvent;
      }
      
      // Ensure event row exists
      await supabase.from('events').upsert({
        id: eventId,
        title: baseEvent.title,
        date: baseEvent.date || (baseEvent.dateTime ? new Date(baseEvent.dateTime).toISOString().slice(0,10) : null),
        time: baseEvent.time || (baseEvent.dateTime ? new Date(baseEvent.dateTime).toTimeString().slice(0,5) : null),
        location: baseEvent.location || null,
        decision_mode: baseEvent.decisionMode || 'none',
        punishment: baseEvent.punishment || '',
        invited_by: (currentUser?.name) || 'Organizer'
      });

      const { data, error } = await supabase
        .from('event_rsvps')
        .select('name, will_attend, created_at')
        .eq('event_id', eventId);
      
      if (error) {
        console.error('Error fetching RSVPs:', error);
        return baseEvent;
      }
      
      if (!Array.isArray(data)) {
        console.warn('No RSVPs found or invalid data format');
        setServerRsvps([]);
        return baseEvent;
      }
      
      console.log('Fetched RSVPs from server:', data);
      setServerRsvps(data);
      
      // Create a map of existing participants by name (case-insensitive)
      const existingParticipants = new Map();
      baseEvent.participants.forEach(p => {
        const key = (p.name || '').trim().toLowerCase();
        if (key) existingParticipants.set(key, p);
      });
      
      const merged = [...baseEvent.participants];
      let addedAnything = false;
      
      console.log('Existing participants:', baseEvent.participants.map(p => p.name));
      console.log('Processing RSVPs:', data);
      
      data
        .filter(r => r.will_attend === true) // only confirmed attendees become participants
        .forEach(r => {
        const name = (r.name || '').trim();
        if (!name) {
          console.warn('Skipping RSVP with empty name:', r);
          return;
        }
        const key = name.toLowerCase();
        
        // Only add if not already in participants list
        if (!existingParticipants.has(key)) {
          const id = `guest_${key}_${Date.now()}`;
          const newParticipant = {
            id,
            name,
            email: `${key.replace(/\s+/g,'')}@guest.local`,
            message: r.will_attend ? 'Confirmed attendance' : 'Cannot attend',
            joinedAt: r.created_at
          };
          merged.push(newParticipant);
          addedAnything = true;
          existingParticipants.set(key, newParticipant);
          console.log('Added new participant from RSVP:', newParticipant);
        } else {
          console.log('Skipping duplicate participant:', name);
        }
      });
      
      if (addedAnything) {
        console.log('Updated event with new participants:', merged);
        const updatedEvent = { ...baseEvent, participants: merged };
        const all = eventService.getEvents();
        const idx = all.findIndex(e => e.id === eventId);
        if (idx !== -1) {
          all[idx] = updatedEvent;
          localStorage.setItem('be-there-or-be-square-events', JSON.stringify(all));
        }
        return updatedEvent;
      } else {
        console.log('No new participants added');
      }
      
      return baseEvent;
    } catch (_) {
      return baseEvent;
    }
  };

  useEffect(() => {
    if (!eventId) return;
    const loadEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to find event in local events (user is organizer)
        const events = eventService.getEvents();
        let foundEvent = events.find(e => e.id === eventId);
        
        if (foundEvent) {
          // User is organizing this event
          foundEvent = await fetchAndMergeRsvps(foundEvent);
          setEvent(foundEvent);
          latestEventRef.current = foundEvent;
          setIsOrganizer(true);
          
          // Initialize attendance status for existing participants
          const initialStatus = {};
          foundEvent.participants.forEach(participant => {
            initialStatus[participant.id] = participant.status || 'pending';
          });
          setAttendanceStatus(initialStatus);
        } else {
          // Event not found locally - try to fetch from server (user is participant)
          try {
            const { supabase } = await import('../../lib/supabaseClient');
            const { data: eventData } = await supabase
              .from('events')
              .select('*')
              .eq('id', eventId)
              .single();
            
            if (eventData) {
              // Convert server event to local format
              const serverEvent = {
                id: eventData.id,
                title: eventData.title,
                date: eventData.date,
                time: eventData.time,
                location: eventData.location || '',
                decisionMode: eventData.decision_mode || 'none',
                punishment: eventData.punishment || '',
                dateTime: eventData.dateTime || `${eventData.date}T${eventData.time}`,
                participants: [], // Will be populated by fetchAndMergeRsvps
                status: 'active',
                createdAt: eventData.created_at,
                updatedAt: eventData.updated_at
              };
              
              const mergedEvent = await fetchAndMergeRsvps(serverEvent);
              setEvent(mergedEvent);
              latestEventRef.current = mergedEvent;
              setIsOrganizer(false); // User is a participant, not organizer
              
              // Initialize attendance status
              const initialStatus = {};
              mergedEvent.participants.forEach(participant => {
                initialStatus[participant.id] = participant.status || 'pending';
              });
              setAttendanceStatus(initialStatus);
            } else {
              setError('Event not found!');
              setTimeout(() => router.push('/'), 2000);
            }
          } catch (serverError) {
            console.error('Error fetching event from server:', serverError);
            setError('Event not found!');
            setTimeout(() => router.push('/'), 2000);
          }
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Error loading event. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
    // Poll RSVPs every 10 seconds for live updates
    const interval = setInterval(async () => {
      const base = latestEventRef.current;
      if (!base) return;
      const updated = await fetchAndMergeRsvps(base);
      // If participants changed, update state
      if (updated && updated.participants.length !== base.participants.length) {
        setEvent(updated);
        latestEventRef.current = updated;
        // Initialize attendance status for new participants
        const init = {};
        updated.participants.forEach(p => {
          if (!attendanceStatus[p.id]) init[p.id] = 'pending';
        });
        if (Object.keys(init).length > 0) {
          setAttendanceStatus(prev => ({ ...prev, ...init }));
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [eventId, router]);

  // Keep ref in sync with latest event state
  useEffect(() => {
    if (event) {
      latestEventRef.current = event;
    }
  }, [event]);

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newParticipant.name.trim()) {
      showModal({
        title: 'Missing Information',
        message: 'Please enter a name for the friend.',
        type: 'error'
      });
      return;
    }

    setIsAddingParticipant(true);
    try {
      // Try server write
      try {
        const { supabase } = await import('../../lib/supabaseClient');
        await supabase.from('event_rsvps').insert({
          event_id: eventId,
          name: newParticipant.name.trim(),
          will_attend: true
        });
      } catch (_) {}

      const updatedEvent = eventService.addParticipant(eventId, newParticipant);
      setEvent(updatedEvent);
      // Add new participant to attendance status
      const newParticipantId = updatedEvent.participants[updatedEvent.participants.length - 1].id;
      setAttendanceStatus(prev => ({
        ...prev,
        [newParticipantId]: 'pending'
      }));
      setNewParticipant({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error adding participant:', error);
      showModal({
        title: 'Error',
        message: 'Error adding participant: ' + error.message,
        type: 'error'
      });
    } finally {
      setIsAddingParticipant(false);
    }
  };

  const handleRemoveParticipant = (participantId) => {
    showModal({
      title: 'Remove Friend',
      message: 'Are you sure you want to remove this friend?',
      type: 'confirm',
      showCancel: true,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      onConfirm: () => {
        try {
          const updatedEvent = eventService.removeParticipant(eventId, participantId);
          setEvent(updatedEvent);
          // Remove from attendance status
          setAttendanceStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[participantId];
            return newStatus;
          });
          hideModal();
        } catch (error) {
          console.error('Error removing participant:', error);
          showModal({
            title: 'Error',
            message: 'Error removing participant: ' + error.message,
            type: 'error'
          });
        }
      },
      onCancel: hideModal
    });
  };

  const handleAttendanceChange = (participantId, status) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [participantId]: status
    }));
  };

  const handleCancelEvent = async () => {
    showModal({
      title: 'Cancel Event',
      message: 'Are you sure you want to cancel this event? It will be marked as cancelled.',
      type: 'confirm',
      showCancel: true,
      confirmText: 'Cancel Event',
      cancelText: 'Keep Event',
      onConfirm: async () => {
        setIsCancelling(true);
        try {
          eventService.cancelEvent(eventId);
          showModal({
            title: 'Event Cancelled',
            message: 'Event cancelled successfully!',
            type: 'success',
            onConfirm: () => {
              hideModal();
              router.push('/');
            }
          });
        } catch (error) {
          console.error('Error cancelling event:', error);
          showModal({
            title: 'Error',
            message: 'Error cancelling event. Please try again.',
            type: 'error'
          });
        } finally {
          setIsCancelling(false);
        }
      },
      onCancel: hideModal
    });
  };

  const handleCompleteEvent = async () => {
    if (event.participants.length === 0) {
      showModal({
        title: 'No Friends Added',
        message: 'You need at least one friend to complete the event.',
        type: 'error'
      });
      return;
    }

    // Check if all participants have been marked
    const pendingParticipants = event.participants.filter(p => 
      !attendanceStatus[p.id] || attendanceStatus[p.id] === 'pending'
    );

    if (pendingParticipants.length > 0) {
      showModal({
        title: 'Pending Attendance',
        message: 'Please mark attendance for all friends before completing the event.',
        type: 'error'
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Determine who flaked and who attended
      const flakes = event.participants.filter(p => attendanceStatus[p.id] === 'flaked');
      const attendees = event.participants.filter(p => attendanceStatus[p.id] === 'attended');
      
      // If there are flakes, determine punishment based on decision mode
      let result = null;
      if (flakes.length > 0 && attendees.length > 0) {
        const flakeNames = flakes.map(f => f.name);
        const winner = attendees[Math.floor(Math.random() * attendees.length)];
        const loser = flakes[Math.floor(Math.random() * flakes.length)];
        
        result = {
          winner,
          loser,
          flakes: flakeNames,
          type: 'attendance'
        };
      }

      const completedEvent = eventService.completeEvent(eventId, {
        winner: result?.winner || null,
        loser: result?.loser || null,
        flakes: result?.flakes || []
      });
      
      setEvent(completedEvent);
      showModal({
        title: 'Event Completed',
        message: 'Event completed! Check Past Events to see the results.',
        type: 'success',
        onConfirm: () => {
          hideModal();
          router.push('/');
        }
      });
    } catch (error) {
      console.error('Error completing event:', error);
      showModal({
        title: 'Error',
        message: 'Error completing event: ' + error.message,
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = (platform) => {
    const eventUrl = `${window.location.origin}/event/${eventId}`;
    const text = `Join my event: ${event.title}! Be there or be square!`;
    
    let shareUrl;
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(eventUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL, so we'll copy to clipboard
        navigator.clipboard.writeText(`${text} ${eventUrl}`);
        showModal({
          title: 'Link Copied',
          message: 'Event link copied to clipboard! You can paste it in your Instagram story or post.',
          type: 'success'
        });
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyInvitationLink = () => {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).trim();
    const normalized = (/^https?:\/\//i.test(base) ? base : `https://${base}`).replace(/\/$/, '');
    const url = new URL(`${normalized}/invite/${eventId}`);
    // Embed minimal event summary for fallback rendering
    url.searchParams.set('title', event.title);
    const dt = new Date(event.dateTime || `${event.date}T${event.time}`);
    // Preserve existing structure
    url.searchParams.set('date', (event.dateTime ? new Date(event.dateTime) : dt).toISOString().slice(0,10));
    url.searchParams.set('time', (event.dateTime ? new Date(event.dateTime) : dt).toTimeString().slice(0,5));
    if (event.location) url.searchParams.set('location', event.location);
    if (event.decisionMode) url.searchParams.set('decision_mode', event.decisionMode);
    if (event.punishment) url.searchParams.set('punishment', event.punishment);
    if (currentUser?.name) url.searchParams.set('invited_by', currentUser.name);
    navigator.clipboard.writeText(url.toString());
    showModal({
      title: 'Link Copied',
      message: 'Invitation link copied to clipboard! Share it with your friends so they can RSVP.',
      type: 'success'
    });
  };

  const getAttendanceStatusIcon = (status) => {
    switch (status) {
      case 'attended': return 'check-circle';
      case 'flaked': return 'times-circle';
      default: return 'question-circle';
    }
  };

  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'attended': return 'text-green-500';
      case 'flaked': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getAttendanceStatusText = (status) => {
    switch (status) {
      case 'attended': return 'Attended';
      case 'flaked': return 'Flaked';
      default: return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="section-container">
          <div className="text-center">
            <Icon name="spinner" style="solid" size="xl" className="animate-spin text-pink-500 mx-auto mb-16" />
            <p className="text-gray-600">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="section-container">
          <div className="text-center">
            <Icon name="exclamation-triangle" style="solid" size="xl" className="text-red-500 mx-auto mb-16" />
            <h3 className="text-xl font-semibold text-gray-900 mb-16">Error</h3>
            <p className="text-gray-600 mb-24">{error}</p>
            <button 
              onClick={() => router.push('/')} 
              className="btn btn-primary btn-md"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="section">
        <div className="section-container">
          <div className="text-center">
            <p className="text-gray-600">Event not found</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = event.participants.filter(p => 
    !attendanceStatus[p.id] || attendanceStatus[p.id] === 'pending'
  ).length;

  const attendedCount = event.participants.filter(p => 
    attendanceStatus[p.id] === 'attended'
  ).length;

  const flakedCount = event.participants.filter(p => 
    attendanceStatus[p.id] === 'flaked'
  ).length;

  return (
    <div className="section">
      <div className="section-container">
        {/* Event Header */}
        <div className="section-header">
          <h1 className="section-title text-center">{event.title}</h1>
          <div className="flex flex-wrap items-center justify-center gap-16 mb-24">
            <span className="flex items-center text-sm text-gray-600">
              <Icon name="calendar" style="solid" size="sm" className="mr-4" aria-hidden="true" />
              <span>{new Date(event.dateTime || event.date).toLocaleDateString()}</span>
            </span>
            <span className="flex items-center text-sm text-gray-600">
              <Icon name="clock" style="solid" size="sm" className="mr-4" aria-hidden="true" />
              <span>{new Date(event.dateTime || event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
            {event.location && (
              <span className="flex items-center text-sm text-gray-600">
                <Icon name="map-marker-alt" style="solid" size="sm" className="mr-4" aria-hidden="true" />
                <span>{event.location}</span>
              </span>
            )}
          </div>
          
          {/* Share Options - Individual Buttons - Only show for organizers */}
          {isOrganizer && (
            <div className="flex flex-wrap items-center justify-center gap-8 mb-24">
              <button
                onClick={() => handleShare('twitter')}
                className="btn btn-secondary btn-sm flex items-center"
                aria-label="Share event on Twitter"
                type="button"
              >
                <Icon name="twitter" style="brands" size="sm" className="mr-4" aria-hidden="true" />
                Twitter
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="btn btn-secondary btn-sm flex items-center"
                aria-label="Share event on Facebook"
                type="button"
              >
                <Icon name="facebook" style="brands" size="sm" className="mr-4" aria-hidden="true" />
                Facebook
              </button>
              <button
                onClick={() => handleShare('instagram')}
                className="btn btn-secondary btn-sm flex items-center"
                aria-label="Share event on Instagram"
                type="button"
              >
                <Icon name="instagram" style="brands" size="sm" className="mr-4" aria-hidden="true" />
                Instagram
              </button>
              <button
                onClick={handleCopyInvitationLink}
                className="btn btn-secondary btn-sm flex items-center"
                aria-label="Copy invitation link to clipboard"
                type="button"
              >
                <Icon name="link" style="solid" size="sm" className="mr-4" aria-hidden="true" />
                Share Invitation Link
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-32">
          {/* Friends Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center">
                <Icon name="users" style="solid" size="sm" className="mr-8 text-pink-500" aria-hidden="true" />
                Friends ({event.participants.length})
              </h2>
            </div>
            
                        {/* Add Friend Form - Only show for organizers */}
            {isOrganizer && (
              <div className="mb-32 p-16 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-16 flex items-center">
                  <Icon name="user-plus" style="solid" size="sm" className="mr-8 text-pink-500" aria-hidden="true" />
                  Add a friend manually
                </h3>
                <form onSubmit={handleAddParticipant}>
                  <div className="space-y-16">
                    <div>
                      <label htmlFor="name" className="form-label">Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                        className="form-input"
                        placeholder="Enter name"
                        required
                        aria-describedby="name-help"
                      />
                      <div id="name-help" className="sr-only">Name is required to add a friend</div>
                    </div>
                    <div>
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={newParticipant.email}
                        onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
                        className="form-input"
                        placeholder="Enter email (optional)"
                        aria-describedby="email-help"
                      />
                      <div id="email-help" className="sr-only">Email is optional</div>
                    </div>
                    <div>
                      <label htmlFor="message" className="form-label">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        value={newParticipant.message}
                        onChange={(e) => setNewParticipant(prev => ({ ...prev, message: e.target.value }))}
                        className="form-input"
                        placeholder="Enter a message (optional)"
                        rows="3"
                        aria-describedby="message-help"
                      />
                      <div id="message-help" className="sr-only">Message is optional</div>
                    </div>
                    <button
                      type="submit"
                      disabled={isAddingParticipant}
                      className="btn btn-primary btn-sm w-full"
                    >
                      {isAddingParticipant ? (
                        <>
                          <Icon name="spinner" style="solid" size="sm" className="animate-spin mr-8" aria-hidden="true" />
                          Adding...
                        </>
                      ) : (
                         'Add Friend'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Friends List */}
            <div className="space-y-16">
              {event.participants.length === 0 ? (
                <div className="text-center py-24">
                  <Icon name="users" style="solid" size="xl" className="text-gray-400 mx-auto mb-16" aria-hidden="true" />
                  <p className="text-gray-600">No friends yet.</p>
                  {isOrganizer && (
                    <p className="text-sm text-gray-500 mt-8">Add friends manually or share the invitation link.</p>
                  )}
                </div>
              ) : (
                event.participants.map((participant) => (
                  <div key={participant.id} className="p-16 bg-white rounded-md border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-12">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{participant.name}</div>
                        {participant.email && (
                          <div className="text-sm text-gray-600 mt-4">{participant.email}</div>
                        )}
                        {participant.message && (
                          <div className="text-sm text-gray-500 mt-4 italic">"{participant.message}"</div>
                        )}
                      </div>
                      {isOrganizer && (
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="text-red-500 hover:text-red-700 p-8 rounded-md hover:bg-red-50 transition-colors ml-16 flex items-center"
                          aria-label={`Remove ${participant.name} from event`}
                          type="button"
                        >
                          <Icon name="times" style="solid" size="sm" className="mr-4" aria-hidden="true" />
                          <span className="text-sm">Remove participant</span>
                        </button>
                      )}
                    </div>
                  
                  {/* Attendance Status - Only show for organizers */}
                  {isOrganizer && (
                    <div className="attendance-row">
                      <span className="attendance-label">Attendance:</span>
                      <div className="attendance-buttons">
                        <button
                          onClick={() => handleAttendanceChange(participant.id, 'attended')}
                          className={`attendance-btn ${attendanceStatus[participant.id] === 'attended' ? 'active' : ''}`}
                          aria-pressed={attendanceStatus[participant.id] === 'attended'}
                          aria-label={`Mark ${participant.name} as attended`}
                          type="button"
                        >
                          <Icon name="check-circle" style="solid" size="sm" aria-hidden="true" />
                          <span>Attended</span>
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(participant.id, 'flaked')}
                          className={`attendance-btn ${attendanceStatus[participant.id] === 'flaked' ? 'active' : ''}`}
                          aria-pressed={attendanceStatus[participant.id] === 'flaked'}
                          aria-label={`Mark ${participant.name} as flaked`}
                          type="button"
                        >
                          <Icon name="times-circle" style="solid" size="sm" aria-hidden="true" />
                          <span>Flaked</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

            {/* Server RSVPs (live) - Only show for organizers */}
            {isOrganizer && (
              <div className="mt-24">
                <h3 className="text-sm font-medium text-gray-900 mb-12">Guest RSVPs (live)</h3>
                <div className="mb-8 p-8 bg-gray-50 rounded-md text-xs">
                  <p><strong>Debug Info:</strong></p>
                  <p>Event ID: {eventId}</p>
                  <p>Server RSVPs count: {serverRsvps.length}</p>
                  <p>Server RSVPs data: {JSON.stringify(serverRsvps, null, 2)}</p>
                </div>
                {serverRsvps.length === 0 ? (
                  <p className="text-sm text-gray-500">No RSVPs yet.</p>
                ) : (
                  <ul className="space-y-8">
                    {serverRsvps.map((r, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-800">{r.name}</span>
                        <span className={r.will_attend ? 'text-green-600' : 'text-gray-500'}>
                          {r.will_attend ? 'Will attend' : "Can't attend"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Event Summary Section */}
          <div className="card">
            <h2 className="card-title mb-24">Event Summary</h2>
            
            <div className="space-y-24">
              {/* Attendance Stats */}
            <div className="grid grid-cols-3 gap-16 text-center">
                <div className="p-16 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-center mb-2">
                    <Icon name="clock" style="solid" size="lg" className="text-gray-500" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="p-16 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-center mb-2">
                    <Icon name="check-circle" style="solid" size="lg" className="text-green-600" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold text-gray-600">{attendedCount}</div>
                  <div className="text-sm text-gray-500">Attended</div>
                </div>
                <div className="p-16 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-center mb-2">
                    <Icon name="times-circle" style="solid" size="lg" className="text-red-600" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold text-gray-600">{flakedCount}</div>
                  <div className="text-sm text-gray-500">Flaked</div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-16">
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-900">Decision Mode: </h4>
                  <p className="text-sm text-gray-600 ml-8">{event.decisionMode}</p>
                </div>
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-900">Punishment: </h4>
                  <p className="text-sm text-gray-600 ml-8">{event.punishment}</p>
                </div>
              </div>

              {/* Action Buttons - Only show for organizers */}
              {isOrganizer && (
                <div className="space-y-16">
                  <button
                    onClick={handleCompleteEvent}
                    disabled={isProcessing || pendingCount > 0}
                    className="btn btn-primary btn-lg"
                    style={{ width: '200px' }}
                    aria-describedby={pendingCount > 0 ? "complete-event-help" : undefined}
                  >
                    {isProcessing ? (
                      <>
                        <Icon name="spinner" style="solid" size="sm" className="animate-spin mr-8" aria-hidden="true" />
                        Completing Event...
                      </>
                    ) : (
                      'Complete Event'
                    )}
                  </button>
                  
                  <button
                    onClick={handleCancelEvent}
                    disabled={isCancelling}
                    className="btn btn-danger btn-lg"
                    style={{ width: '200px', marginLeft: '12px' }}
                  >
                    {isCancelling ? (
                      <>
                        <Icon name="spinner" style="solid" size="sm" className="animate-spin mr-8" aria-hidden="true" />
                        Cancelling Event...
                      </>
                    ) : (
                      'Cancel Event'
                    )}
                  </button>
                </div>
              )}
              
              {isOrganizer && pendingCount > 0 && (
                <p id="complete-event-help" className="text-sm text-gray-500 text-left">
                  Please mark attendance for all friends before completing the event
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={hideModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        showCancel={modal.showCancel}
      />
    </div>
  );
};

export default ViewEvent;
