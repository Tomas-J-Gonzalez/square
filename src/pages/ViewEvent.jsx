import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';

const ViewEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [votes, setVotes] = useState({});
  const [showDecision, setShowDecision] = useState(false);
  const [decisionResult, setDecisionResult] = useState(null);
  const [isDeciding, setIsDeciding] = useState(false);
  const [newParticipant, setNewParticipant] = useState('');

  // Mock event data
  useEffect(() => {
    // Simulate API call
    const mockEvent = {
      id: eventId,
      title: 'Friday Night Dinner',
      date: '2024-01-20',
      time: '19:00',
      location: 'Joe\'s Pizza, 123 Main St',
      decisionMode: 'vote',
      punishment: 'Buy Coffee',
      status: 'active',
      createdBy: 'Sarah'
    };

    const mockParticipants = [
      { id: '1', name: 'Sarah', status: 'confirmed' },
      { id: '2', name: 'Mike', status: 'confirmed' },
      { id: '3', name: 'Emma', status: 'invited' },
      { id: '4', name: 'Alex', status: 'confirmed' }
    ];

    setEvent(mockEvent);
    setParticipants(mockParticipants);
  }, [eventId]);

  const handleVote = (votedForId) => {
    setVotes(prev => ({
      ...prev,
      [eventId]: votedForId
    }));
  };

  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      const newParticipantObj = {
        id: Date.now().toString(),
        name: newParticipant.trim(),
        status: 'invited'
      };
      setParticipants(prev => [...prev, newParticipantObj]);
      setNewParticipant('');
    }
  };

  const handleMakeDecision = async () => {
    setIsDeciding(true);
    
    // Simulate decision process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let result;
    switch (event.decisionMode) {
      case 'vote':
        const voteCounts = {};
        Object.values(votes).forEach(vote => {
          voteCounts[vote] = (voteCounts[vote] || 0) + 1;
        });
        const mostVoted = Object.keys(voteCounts).reduce((a, b) => 
          voteCounts[a] > voteCounts[b] ? a : b
        );
        const voteWinner = participants.find(p => p.id === mostVoted);
        const voteLoser = participants.find(p => p.id !== mostVoted);
        result = { winner: voteWinner, loser: voteLoser, type: 'vote' };
        break;
        
      case 'chance':
        const randomIndex = Math.floor(Math.random() * participants.length);
        const chanceLoser = participants[randomIndex];
        const chanceWinner = participants.find(p => p.id !== chanceLoser.id);
        result = { winner: chanceWinner, loser: chanceLoser, type: 'chance' };
        break;
        
      case 'game':
        // Simple random for now
        const gameLoser = participants[Math.floor(Math.random() * participants.length)];
        const gameWinner = participants.find(p => p.id !== gameLoser.id);
        result = { winner: gameWinner, loser: gameLoser, type: 'game' };
        break;
        
      default:
        result = null;
    }
    
    setDecisionResult(result);
    setShowDecision(true);
    setIsDeciding(false);
  };

  const getDecisionModeIcon = (mode) => {
    switch (mode) {
      case 'vote': return 'vote-yea';
      case 'chance': return 'dice';
      case 'game': return 'gamepad';
      default: return 'question';
    }
  };

  const getDecisionModeColor = (mode) => {
    switch (mode) {
      case 'vote': return 'text-blue-500';
      case 'chance': return 'text-purple-500';
      case 'game': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (!event) {
    return (
      <Section>
        <div className="text-center">
          <Icon name="spinner" style="solid" size="2xl" className="animate-spin text-content-subtle" />
          <p className="text-body-md text-content-subtle mt-16">Loading event...</p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      {/* Event Header */}
      <div className="text-center mb-48">
        <div className="flex items-center justify-center mb-16">
          <Icon 
            name={getDecisionModeIcon(event.decisionMode)} 
            style="solid" 
            size="lg" 
            className={`mr-16 ${getDecisionModeColor(event.decisionMode)}`} 
          />
          <h1 className="text-heading-1 text-content-default">
            {event.title}
          </h1>
        </div>
        <p className="text-body-lg text-content-subtle">
          {new Date(event.date).toLocaleDateString()} at {event.time}
          {event.location && ` • ${event.location}`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-32">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-24">
          {/* Participants */}
          <Card className="p-24">
            <div className="flex items-center justify-between mb-24">
              <h2 className="text-heading-3 text-content-default">
                Participants ({participants.length})
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => document.getElementById('addParticipant').focus()}
              >
                <Icon name="plus" style="solid" size="sm" className="mr-8" />
                Add
              </Button>
            </div>

            {/* Add Participant */}
            <div className="flex mb-24">
              <input
                id="addParticipant"
                type="text"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
                placeholder="Enter participant name"
                className="flex-1 px-16 py-8 border border-border-default rounded-l-md bg-background-default text-content-default placeholder-content-subtle focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-colors duration-200"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddParticipant}
                className="rounded-l-none"
              >
                Add
              </Button>
            </div>

            {/* Participants List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {participants.map(participant => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-16 bg-background-subtle rounded-md"
                >
                  <div className="flex items-center">
                    <div className="w-32 h-32 bg-background-brand-brand-primary rounded-full flex items-center justify-center mr-12">
                      <span className="text-body-sm font-medium text-content-knockout">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-body-md text-content-default">
                      {participant.name}
                    </span>
                  </div>
                  <span className={`text-body-sm px-8 py-4 rounded-full ${
                    participant.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {participant.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Decision Interface */}
          {event.decisionMode === 'vote' && (
            <Card className="p-24">
              <h2 className="text-heading-3 text-content-default mb-24">
                Vote for the Flake
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {participants.map(participant => (
                  <label
                    key={participant.id}
                    className="flex items-center p-16 border border-border-default rounded-md cursor-pointer hover:border-border-strong transition-colors duration-200"
                  >
                    <input
                      type="radio"
                      name="vote"
                      value={participant.id}
                      checked={votes[eventId] === participant.id}
                      onChange={() => handleVote(participant.id)}
                      className="mr-12"
                    />
                    <div className="flex items-center">
                      <div className="w-32 h-32 bg-background-brand-brand-primary rounded-full flex items-center justify-center mr-12">
                        <span className="text-body-sm font-medium text-content-knockout">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-body-md text-content-default">
                        {participant.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          )}

          {/* Decision Button */}
          {!showDecision && (
            <Card className="p-24 text-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleMakeDecision}
                disabled={isDeciding || (event.decisionMode === 'vote' && !votes[eventId])}
                className="w-full md:w-auto"
              >
                {isDeciding ? (
                  <>
                    <Icon name="spinner" style="solid" size="sm" className="animate-spin mr-8" />
                    Making Decision...
                  </>
                ) : (
                  <>
                    <Icon name="gavel" style="solid" size="sm" className="mr-8" />
                    Make Decision
                  </>
                )}
              </Button>
            </Card>
          )}

          {/* Decision Result */}
          {showDecision && decisionResult && (
            <Card className="p-24 text-center">
              <div className="mb-24">
                <Icon name="trophy" style="solid" size="2xl" className="text-yellow-500 mb-16" />
                <h3 className="text-heading-3 text-content-default mb-8">
                  Decision Made!
                </h3>
                <p className="text-body-lg text-content-subtle">
                  {decisionResult.loser.name} is the flake!
                </p>
              </div>
              
              <div className="bg-background-subtle rounded-md p-24 mb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                  <div>
                    <h4 className="text-heading-4 text-green-600 mb-8">Winner</h4>
                    <p className="text-body-lg font-medium text-content-default">
                      {decisionResult.winner.name}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-heading-4 text-red-600 mb-8">Loser</h4>
                    <p className="text-body-lg font-medium text-content-default">
                      {decisionResult.loser.name}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-md p-16">
                <h4 className="text-heading-4 text-red-600 mb-8">Punishment</h4>
                <p className="text-body-lg font-medium text-content-default">
                  {event.punishment}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-24">
          {/* Event Info */}
          <Card className="p-24">
            <h3 className="text-heading-4 text-content-default mb-16">
              Event Details
            </h3>
            <div className="space-y-16">
              <div className="flex items-center">
                <Icon name="calendar" style="solid" size="sm" className="text-content-subtle mr-12" />
                <span className="text-body-sm text-content-subtle">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <Icon name="clock" style="solid" size="sm" className="text-content-subtle mr-12" />
                <span className="text-body-sm text-content-subtle">{event.time}</span>
              </div>
              {event.location && (
                <div className="flex items-center">
                  <Icon name="map-marker-alt" style="solid" size="sm" className="text-content-subtle mr-12" />
                  <span className="text-body-sm text-content-subtle">{event.location}</span>
                </div>
              )}
              <div className="flex items-center">
                <Icon name="user" style="solid" size="sm" className="text-content-subtle mr-12" />
                <span className="text-body-sm text-content-subtle">Created by {event.createdBy}</span>
              </div>
            </div>
          </Card>

          {/* Share */}
          <Card className="p-24">
            <h3 className="text-heading-4 text-content-default mb-16">
              Share Event
            </h3>
            <div className="space-y-12">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                <Icon name="copy" style="solid" size="sm" className="mr-8" />
                Copy Link
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=Join my event: ${event.title}&url=${window.location.href}`, '_blank')}
              >
                <Icon name="twitter" style="brands" size="sm" className="mr-8" />
                Share on Twitter
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
};

export default ViewEvent;
