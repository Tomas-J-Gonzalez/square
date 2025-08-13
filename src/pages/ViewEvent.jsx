import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import Icon from '../components/Icon';

const ViewEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [isDeciding, setIsDeciding] = useState(false);
  const [result, setResult] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const loadEvent = () => {
      const events = eventService.getEvents();
      const foundEvent = events.find(e => e.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        alert('Event not found!');
        navigate('/');
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
      setNewParticipant({ name: '', email: '', message: '' });
    } catch (error) {
      alert('Error adding participant: ' + error.message);
    } finally {
      setIsAddingParticipant(false);
    }
  };

  const handleRemoveParticipant = (participantId) => {
    if (window.confirm('Are you sure you want to remove this participant?')) {
      const updatedEvent = eventService.removeParticipant(eventId, participantId);
      setEvent(updatedEvent);
    }
  };

  const handleMakeDecision = async () => {
    if (event.participants.length < 2) {
      alert('You need at least 2 participants to make a decision.');
      return;
    }

    setIsDeciding(true);
    
    // Simulate decision process
    setTimeout(() => {
      let result;
      const participants = [...event.participants];
      
      switch (event.decisionMode) {
        case 'vote':
          // Simulate voting - randomly select winner and loser
          const voteLoser = participants[Math.floor(Math.random() * participants.length)];
          const voteWinner = participants.find(p => p.id !== voteLoser.id);
          result = { winner: voteWinner, loser: voteLoser, type: 'vote' };
          break;
          
        case 'chance':
          // Random selection
          const randomIndex = Math.floor(Math.random() * participants.length);
          const chanceLoser = participants[randomIndex];
          const chanceWinner = participants.find(p => p.id !== chanceLoser.id);
          result = { winner: chanceWinner, loser: chanceLoser, type: 'chance' };
          break;
          
        case 'game':
          // Simple game simulation - random winner
          const gameWinner = participants[Math.floor(Math.random() * participants.length)];
          const gameLoser = participants.find(p => p.id !== gameWinner.id);
          result = { winner: gameWinner, loser: gameLoser, type: 'game' };
          break;
          
        case 'none':
          // No group decision - event creator decides
          const noneLoser = participants[Math.floor(Math.random() * participants.length)];
          const noneWinner = participants.find(p => p.id !== noneLoser.id);
          result = { winner: noneWinner, loser: noneLoser, type: 'none' };
          break;
          
        default:
          result = null;
      }
      
      setResult(result);
      setIsDeciding(false);
    }, 2000);
  };

  const handleCompleteEvent = () => {
    if (result) {
      const completedEvent = eventService.completeEvent(eventId, result);
      setEvent(completedEvent);
      alert('Event completed! Check Past Events to see the results.');
      navigate('/');
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

  if (!event) {
    return (
      <div className="section">
        <div className="section-container">
          <div className="text-center">
            <p>Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-container">
        {/* Event Header */}
        <div className="section-header">
          <h1 className="section-title">{event.title}</h1>
          <div className="flex items-center justify-center space-x-16 mb-24">
            <span className="flex items-center text-sm text-subtle">
              <Icon name="calendar" style="solid" size="sm" className="mr-4" />
              {new Date(event.dateTime).toLocaleDateString()}
            </span>
            <span className="flex items-center text-sm text-subtle">
              <Icon name="clock" style="solid" size="sm" className="mr-4" />
              {new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {event.location && (
              <span className="flex items-center text-sm text-subtle">
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
          {/* Participants Section */}
          <div className="card">
            <h2 className="card-title mb-24">Participants ({event.participants.length})</h2>
            
            {/* Add Participant Form */}
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
                  {isAddingParticipant ? 'Adding...' : 'Add Participant'}
                </button>
              </div>
            </form>

            {/* Participants List */}
            <div className="space-y-16">
              {event.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-16 bg-gray-50 rounded-md">
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
              ))}
            </div>
          </div>

          {/* Decision Section */}
          <div className="card">
            <h2 className="card-title mb-24">Event Decision</h2>
            
            {!result ? (
              <div>
                <div className="mb-24">
                  <p className="text-sm text-gray-600 mb-16">
                    Decision Mode: <span className="font-medium">{event.decisionMode}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Punishment: <span className="font-medium">{event.punishment}</span>
                  </p>
                </div>
                
                <button
                  onClick={handleMakeDecision}
                  disabled={isDeciding || event.participants.length < 2}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isDeciding ? (
                    <>
                      <Icon name="spinner" style="solid" size="sm" className="animate-spin mr-8" />
                      Making Decision...
                    </>
                  ) : (
                    'Make Decision'
                  )}
                </button>
                
                {event.participants.length < 2 && (
                  <p className="text-sm text-gray-500 mt-16 text-center">
                    Need at least 2 participants to make a decision
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-24">
                  <h3 className="text-lg font-semibold mb-16">Decision Made!</h3>
                  <div className="bg-green-50 border border-green-200 rounded-md p-16 mb-16">
                    <p className="text-green-800">
                      <strong>Winner:</strong> {result.winner.name}
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-md p-16">
                    <p className="text-red-800">
                      <strong>Flake:</strong> {result.loser.name}
                    </p>
                    <p className="text-sm text-red-600 mt-4">
                      Punishment: {event.punishment}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleCompleteEvent}
                  className="btn btn-primary btn-lg"
                >
                  Complete Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEvent;
