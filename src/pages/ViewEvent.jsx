import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { eventService } from '../services/eventService';
import Icon from '../components/Icon';
import { useModal } from '../hooks/useModal';
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
  const [participants, setParticipants] = useState([]);
  const [isOrganizer, setIsOrganizer] = useState(false);
  
  // Use the modal hook
  const { modal, showModal, showConfirmModal } = useModal();

  // Fetch participants from Supabase
  const fetchParticipants = async () => {
    try {
      const { supabase } = await import('../../lib/supabaseClient');
      if (!supabase) {
        console.warn('Supabase not configured, cannot fetch participants');
        return [];
      }

      const { data, error } = await supabase
        .from('event_rsvps')
        .select('id, name, email, will_attend, message, created_at')
        .eq('event_id', eventId)
        .eq('will_attend', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching participants:', error);
        return [];
      }

      if (!Array.isArray(data)) {
        return [];
      }

      // Convert to participant format
      const participantList = data.map(rsvp => ({
        id: rsvp.id,
        name: rsvp.name,
        email: rsvp.email || `${rsvp.name.replace(/\s+/g, '').toLowerCase()}@guest.local`,
        message: rsvp.message || 'Confirmed attendance',
        joinedAt: rsvp.created_at,
        status: 'pending' // Default status for new participants
      }));

      console.log('Fetched participants from Supabase:', participantList);
      return participantList;
    } catch (error) {
      console.error('Error in fetchParticipants:', error);
      return [];
    }
  };

  // Load event and participants
  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        setError(null);
        
        // First try to find event in local events (user is organizer)
        const events = eventService.getEvents();
        let foundEvent = events.find(e => e.id === eventId);
        
        if (foundEvent) {
          // User is organizing this event
          setEvent(foundEvent);
          setIsOrganizer(true);
          
          // Fetch participants from Supabase
          const participantList = await fetchParticipants();
          setParticipants(participantList);
          
          // Initialize attendance status for existing participants
          const initialStatus = {};
          participantList.forEach(participant => {
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
                location: eventData.location,
                decisionMode: eventData.decision_mode || 'none',
                punishment: eventData.punishment || '',
                dateTime: eventData.dateTime || `${eventData.date}T${eventData.time}`,
                participants: [], // Will be populated by fetchParticipants
                status: 'active',
                createdAt: eventData.created_at,
                updatedAt: eventData.updated_at
              };
              
              setEvent(serverEvent);
              setIsOrganizer(false); // User is a participant, not organizer
              
              // Fetch participants from Supabase
              const participantList = await fetchParticipants();
              setParticipants(participantList);
              
              // Initialize attendance status
              const initialStatus = {};
              participantList.forEach(participant => {
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
  }, [eventId, router]);

  // Poll for new participants every 10 seconds (for organizers)
  useEffect(() => {
    if (!isOrganizer || !eventId) return;

    const interval = setInterval(async () => {
      const newParticipants = await fetchParticipants();
      setParticipants(newParticipants);
      
      // Initialize attendance status for new participants
      const newStatus = {};
      newParticipants.forEach(participant => {
        if (!attendanceStatus[participant.id]) {
          newStatus[participant.id] = 'pending';
        }
      });
      
      if (Object.keys(newStatus).length > 0) {
        setAttendanceStatus(prev => ({ ...prev, ...newStatus }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [eventId, isOrganizer, attendanceStatus]);

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
      // Submit to Supabase
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          name: newParticipant.name.trim(),
          email: newParticipant.email.trim() || null,
          willAttend: true,
          message: newParticipant.message.trim() || 'Added by organizer'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh participants list
        const newParticipants = await fetchParticipants();
        setParticipants(newParticipants);
        
        // Add new participant to attendance status
        const newParticipantId = result.participant.id;
        setAttendanceStatus(prev => ({
          ...prev,
          [newParticipantId]: 'pending'
        }));
        
        setNewParticipant({ name: '', email: '', message: '' });
        
        showModal({
          title: 'Success',
          message: 'Participant added successfully!',
          type: 'success'
        });
      } else {
        showModal({
          title: 'Error',
          message: result.error || 'Failed to add participant',
          type: 'error'
        });
      }
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
      onConfirm: async () => {
        try {
          // Remove from Supabase (set will_attend to false)
          const { supabase } = await import('../../lib/supabaseClient');
          if (supabase) {
            await supabase
              .from('event_rsvps')
              .update({ will_attend: false })
              .eq('id', participantId);
          }
          
          // Refresh participants list
          const newParticipants = await fetchParticipants();
          setParticipants(newParticipants);
          
          // Remove from attendance status
          const newStatus = { ...attendanceStatus };
          delete newStatus[participantId];
          setAttendanceStatus(newStatus);
          
          showModal({
            title: 'Success',
            message: 'Participant removed successfully!',
            type: 'success'
          });
        } catch (error) {
          console.error('Error removing participant:', error);
          showModal({
            title: 'Error',
            message: 'Failed to remove participant',
            type: 'error'
          });
        }
      },
      onCancel: hideModal
    });
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
            onConfirm: () => router.push('/')
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

  const handleShare = (platform) => {
    const eventUrl = `${window.location.origin}/invite/${eventId}`;
    const text = `You're invited to ${event.title}! ${eventUrl}`;
    
    let shareUrl;
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct share URL, so we'll copy to clipboard
        navigator.clipboard.writeText(text);
        showModal({
          title: 'Link Copied!',
          message: 'Event link copied to clipboard. You can paste it in Instagram.',
          type: 'success'
        });
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleAttendanceChange = (participantId, status) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [participantId]: status
    }));
  };

  const handleCompleteEvent = async () => {
    showModal({
      title: 'Complete Event',
      message: 'Are you sure you want to complete this event? This will archive it and show the final results.',
      type: 'confirm',
      showCancel: true,
      confirmText: 'Complete Event',
      cancelText: 'Keep Active',
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          eventService.completeEvent(eventId, attendanceStatus);
          showModal({
            title: 'Event Completed',
            message: 'Event completed successfully! You can view the results in Past Events.',
            type: 'success',
            onConfirm: () => router.push('/past')
          });
        } catch (error) {
          console.error('Error completing event:', error);
          showModal({
            title: 'Error',
            message: 'Error completing event. Please try again.',
            type: 'error'
          });
        } finally {
          setIsProcessing(false);
        }
      },
      onCancel: hideModal
    });
  };

  if (loading) {
    return (
      <div className="section">
        <div className="section-container text-center">
          <Icon name="spinner" style="solid" size="xl" className="animate-spin text-pink-500 mx-auto mb-16" />
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="section-container text-center">
          <Icon name="exclamation-triangle" style="solid" size="xl" className="text-red-500 mx-auto mb-16" />
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => router.push('/')} 
            className="btn btn-primary btn-md mt-16"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="section">
        <div className="section-container text-center">
          <Icon name="exclamation-triangle" style="solid" size="xl" className="text-red-500 mx-auto mb-16" />
          <p className="text-gray-600">Event not found</p>
          <button 
            onClick={() => router.push('/')} 
            className="btn btn-primary btn-md mt-16"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate attendance statistics
  const pendingCount = participants.filter(p => 
    !attendanceStatus[p.id] || attendanceStatus[p.id] === 'pending'
  ).length;

  const attendedCount = participants.filter(p => 
    attendanceStatus[p.id] === 'attended'
  ).length;

  const flakedCount = participants.filter(p => 
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
            </div>
          )}
        </div>

        {/* Organizer Controls */}
        {isOrganizer && (
          <div className="card mb-32">
            <div className="card-header">
              <h2 className="card-title flex items-center">
                <Icon name="crown" style="solid" size="sm" className="mr-8 text-pink-500" />
                Event Management
              </h2>
            </div>
            
            <div className="card-content">
              {/* Add Participant Form */}
              <form onSubmit={handleAddParticipant} className="mb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
                  <div>
                    <label className="form-label" htmlFor="participantName">Name *</label>
                    <input
                      id="participantName"
                      type="text"
                      className="form-input"
                      value={newParticipant.name}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Friend's name"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="participantEmail">Email</label>
                    <input
                      id="participantEmail"
                      type="email"
                      className="form-input"
                      value={newParticipant.email}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="friend@email.com"
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="participantMessage">Message</label>
                    <input
                      id="participantMessage"
                      type="text"
                      className="form-input"
                      value={newParticipant.message}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Optional message"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm flex items-center justify-center"
                  disabled={isAddingParticipant}
                >
                  {isAddingParticipant ? (
                    <>
                      <Icon name="spinner" style="solid" size="sm" className="animate-spin mr-4" />
                      Adding...
                    </>
                  ) : (
                    'Add Friend'
                  )}
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-12">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="btn btn-secondary btn-sm flex items-center"
                >
                  <Icon name="share" style="solid" size="sm" className="mr-4" />
                  Share Invitation
                </button>
                <button
                  onClick={handleCompleteEvent}
                  disabled={isProcessing}
                  className="btn btn-success btn-sm flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Icon name="spinner" style="solid" size="sm" className="animate-spin mr-4" />
                      Completing Event...
                    </>
                  ) : (
                    'Complete Event'
                  )}
                </button>
                <button
                  onClick={handleCancelEvent}
                  disabled={isCancelling}
                  className="btn btn-danger btn-sm flex items-center justify-center"
                >
                  {isCancelling ? (
                    <>
                      <Icon name="spinner" style="solid" size="sm" className="animate-spin mr-4" />
                      Cancelling Event...
                    </>
                  ) : (
                    'Cancel Event'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Participants List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center">
              <Icon name="users" style="solid" size="sm" className="mr-8 text-pink-500" />
              Participants ({participants.length})
            </h2>
            {isOrganizer && (
              <p className="text-sm text-gray-600">
                Pending: {pendingCount} | Attended: {attendedCount} | Flaked: {flakedCount}
              </p>
            )}
          </div>
          
          <div className="card-content">
            {participants.length === 0 ? (
              <div className="text-center py-24">
                <Icon name="user-friends" style="solid" size="xl" className="text-gray-400 mx-auto mb-16" />
                <p className="text-gray-600">No participants yet.</p>
                {isOrganizer && (
                  <p className="text-sm text-gray-500 mt-8">
                    Add friends above or share the event link to get RSVPs.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-16">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-16 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-12 mb-4">
                        <h3 className="font-semibold text-gray-900">{participant.name}</h3>
                        {participant.email && (
                          <span className="text-sm text-gray-600">({participant.email})</span>
                        )}
                      </div>
                      {participant.message && (
                        <p className="text-sm text-gray-600">{participant.message}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Joined: {new Date(participant.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-12">
                      {/* Attendance Status (Organizer Only) */}
                      {isOrganizer && (
                        <select
                          value={attendanceStatus[participant.id] || 'pending'}
                          onChange={(e) => handleAttendanceChange(participant.id, e.target.value)}
                          className="form-input text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="attended">Attended</option>
                          <option value="flaked">Flaked</option>
                        </select>
                      )}
                      
                      {/* Remove Button (Organizer Only) */}
                      {isOrganizer && (
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="btn btn-danger btn-sm"
                          aria-label={`Remove ${participant.name} from event`}
                          type="button"
                        >
                          <Icon name="times" style="solid" size="sm" />
                          <span className="text-sm">Remove participant</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {modal.isOpen && <Modal {...modal} />}
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Share Event Invitation</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="modal-close"
                aria-label="Close modal"
              >
                <Icon name="times" style="solid" size="sm" />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-message mb-16">
                Share this link with your friends to invite them to your event:
              </p>
              <div className="flex gap-8">
                <input
                  type="text"
                  value={`${window.location.origin}/invite/${eventId}`}
                  readOnly
                  className="form-input flex-1"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/invite/${eventId}`);
                    showModal({
                      title: 'Link Copied!',
                      message: 'The invitation link has been copied to your clipboard.',
                      type: 'success'
                    });
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Copy Link
                </button>
              </div>
              <div className="mt-16 flex gap-8">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/invite/${eventId}`;
                    const text = `Join me at ${event?.title || 'my event'}! ${url}`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
                  }}
                  className="btn btn-secondary btn-sm flex-1"
                >
                  <Icon name="twitter" style="brands" size="sm" className="mr-4" />
                  Twitter
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/invite/${eventId}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
                  }}
                  className="btn btn-secondary btn-sm flex-1"
                >
                  <Icon name="facebook" style="brands" size="sm" className="mr-4" />
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEvent;
