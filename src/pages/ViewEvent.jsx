import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import Icon from '../components/Icon';

const ViewEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
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
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const loadEvent = () => {
      try {
        setLoading(true);
        setError(null);
        
        const events = eventService.getEvents();
        const foundEvent = events.find(e => e.id === eventId);
        
        if (foundEvent) {
          setEvent(foundEvent);
          // Initialize attendance status for existing participants
          const initialStatus = {};
          foundEvent.participants.forEach(participant => {
            initialStatus[participant.id] = participant.status || 'pending'; // pending, attended, flaked
          });
          setAttendanceStatus(initialStatus);
        } else {
          setError('Event not found!');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Error loading event. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, navigate]);

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newParticipant.name.trim() || !newParticipant.email.trim() || !newParticipant.message.trim()) {
      alert('Please fill in all required fields: name, email, and message.');
      return;
    }

    setIsAddingParticipant(true);
    try {
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
      alert('Error adding participant: ' + error.message);
    } finally {
      setIsAddingParticipant(false);
    }
  };

  const handleRemoveParticipant = (participantId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      try {
        const updatedEvent = eventService.removeParticipant(eventId, participantId);
        setEvent(updatedEvent);
        // Remove from attendance status
        setAttendanceStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[participantId];
          return newStatus;
        });
      } catch (error) {
        console.error('Error removing participant:', error);
        alert('Error removing participant: ' + error.message);
      }
    }
  };

  const handleAttendanceChange = (participantId, status) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [participantId]: status
    }));
  };

  const handleCompleteEvent = async () => {
    if (event.participants.length === 0) {
      alert('You need at least one friend to complete the event.');
      return;
    }

    // Check if all participants have been marked
    const pendingParticipants = event.participants.filter(p => 
      !attendanceStatus[p.id] || attendanceStatus[p.id] === 'pending'
    );

    if (pendingParticipants.length > 0) {
      alert('Please mark attendance for all friends before completing the event.');
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
      alert('Event completed! Check Past Events to see the results.');
      navigate('/');
    } catch (error) {
      console.error('Error completing event:', error);
      alert('Error completing event: ' + error.message);
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
        alert('Event link copied to clipboard! You can paste it in your Instagram story or post.');
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
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
              onClick={() => navigate('/')} 
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
          <h1 className="section-title">{event.title}</h1>
          <div className="flex items-center justify-center space-x-16 mb-24">
            <span className="flex items-center text-sm text-gray-600">
              <Icon name="calendar" style="solid" size="sm" className="mr-4" />
              {new Date(event.dateTime || event.date).toLocaleDateString()}
            </span>
            <span className="flex items-center text-sm text-gray-600">
              <Icon name="clock" style="solid" size="sm" className="mr-4" />
              {new Date(event.dateTime || event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {event.location && (
              <span className="flex items-center text-sm text-gray-600">
                <Icon name="map-marker-alt" style="solid" size="sm" className="mr-4" />
                {event.location}
              </span>
            )}
          </div>
          
          {/* Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="btn btn-secondary btn-sm"
          >
            <Icon name="share" style="solid" size="sm" className="mr-4" />
            Share Event
          </button>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-32 max-w-md w-full mx-16">
              <div className="flex justify-between items-center mb-24">
                <h3 className="text-lg font-semibold">Share Event</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Icon name="times" style="solid" size="md" />
                </button>
              </div>
              <div className="space-y-16">
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full btn btn-secondary flex items-center justify-center"
                >
                  <Icon name="twitter" style="brands" size="md" className="mr-8" />
                  Share on Twitter
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full btn btn-secondary flex items-center justify-center"
                >
                  <Icon name="facebook" style="brands" size="md" className="mr-8" />
                  Share on Facebook
                </button>
                <button
                  onClick={() => handleShare('instagram')}
                  className="w-full btn btn-secondary flex items-center justify-center"
                >
                  <Icon name="instagram" style="brands" size="md" className="mr-8" />
                  Copy Link for Instagram
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
          {/* Friends Section */}
          <div className="card">
            <h2 className="card-title mb-24">Friends ({event.participants.length})</h2>
            
            {/* Add Friend Form */}
            <form onSubmit={handleAddParticipant} className="mb-32">
              <div className="space-y-16">
                <div>
                  <label htmlFor="name" className="form-label">Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
                    className="form-input"
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="form-label">Message *</label>
                  <textarea
                    id="message"
                    value={newParticipant.message}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, message: e.target.value }))}
                    className="form-input"
                    placeholder="Enter a message"
                    rows="3"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAddingParticipant}
                  className="btn btn-primary btn-sm"
                >
                  {isAddingParticipant ? 'Adding...' : 'Add Friend'}
                </button>
              </div>
            </form>

            {/* Friends List */}
            <div className="space-y-16">
              {event.participants.map((participant) => (
                <div key={participant.id} className="p-16 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <div className="font-medium">{participant.name}</div>
                      <div className="text-sm text-gray-600">{participant.email}</div>
                      {participant.message && (
                        <div className="text-sm text-gray-500 mt-4">"{participant.message}"</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveParticipant(participant.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Icon name="times" style="solid" size="sm" />
                    </button>
                  </div>
                  
                  {/* Attendance Status */}
                  <div className="flex items-center space-x-16">
                    <span className="text-sm text-gray-600">Status:</span>
                    <div className="flex space-x-8">
                      <button
                        onClick={() => handleAttendanceChange(participant.id, 'attended')}
                        className={`flex items-center space-x-4 px-12 py-4 rounded-md text-sm font-medium transition-colors ${
                          attendanceStatus[participant.id] === 'attended'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
                        }`}
                      >
                        <Icon name="check-circle" style="solid" size="sm" />
                        <span>Attended</span>
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(participant.id, 'flaked')}
                        className={`flex items-center space-x-4 px-12 py-4 rounded-md text-sm font-medium transition-colors ${
                          attendanceStatus[participant.id] === 'flaked'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
                        }`}
                      >
                        <Icon name="times-circle" style="solid" size="sm" />
                        <span>Flaked</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Summary Section */}
          <div className="card">
            <h2 className="card-title mb-24">Event Summary</h2>
            
            <div className="space-y-24">
              {/* Attendance Stats */}
              <div className="grid grid-cols-3 gap-16 text-center">
                <div className="p-16 bg-gray-50 rounded-md">
                  <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="p-16 bg-green-50 rounded-md">
                  <div className="text-2xl font-bold text-green-600">{attendedCount}</div>
                  <div className="text-sm text-green-500">Attended</div>
                </div>
                <div className="p-16 bg-red-50 rounded-md">
                  <div className="text-2xl font-bold text-red-600">{flakedCount}</div>
                  <div className="text-sm text-red-500">Flaked</div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-16">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-8">Decision Mode:</h4>
                  <p className="text-sm text-gray-600">{event.decisionMode}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-8">Punishment:</h4>
                  <p className="text-sm text-gray-600">{event.punishment}</p>
                </div>
              </div>

              {/* Complete Event Button */}
              <button
                onClick={handleCompleteEvent}
                disabled={isProcessing || pendingCount > 0}
                className="btn btn-primary btn-lg w-full"
              >
                {isProcessing ? (
                  <>
                    <Icon name="spinner" style="solid" size="sm" className="animate-spin mr-8" />
                    Completing Event...
                  </>
                ) : (
                  'Complete Event'
                )}
              </button>
              
              {pendingCount > 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Please mark attendance for all friends before completing the event
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEvent;
