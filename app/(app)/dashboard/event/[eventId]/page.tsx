'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../../../../components/Button';
import Icon from '../../../../components/Icon';
import Modal from '../../../../components/Modal';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  event_type: string;
  event_details: string;
  decision_mode: string;
  punishment: string;
  status: string;
  invited_by: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  will_attend: boolean;
  message: string;
}

export default function EventManagementPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'complete' | 'delete' | null>(null);
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '', message: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
      fetchParticipants();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getEvent', eventId }),
      });

      const data = await response.json();
      if (data.success) {
        setEvent(data.event);
      } else {
        setError(data.error || 'Failed to fetch event');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getParticipants', eventId }),
      });

      const data = await response.json();
      if (data.success) {
        setParticipants(data.participants || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const handleEventAction = async () => {
    if (!confirmAction || !event) return;
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: confirmAction === 'cancel' ? 'cancelEvent' : 
                 confirmAction === 'complete' ? 'completeEvent' : 'deleteEvent',
          eventId 
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || `Failed to ${confirmAction} event`);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const handleAddParticipant = async () => {
    if (!newParticipant.name || !newParticipant.email) return;
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addParticipant',
          eventId,
          participantData: newParticipant
        }),
      });

      const data = await response.json();
      if (data.success) {
        setParticipants(prev => [...prev, data.participant]);
        setNewParticipant({ name: '', email: '', message: '' });
        setShowAddModal(false);
      } else {
        setError(data.error || 'Failed to add participant');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeParticipant',
          participantId
        }),
      });

      const data = await response.json();
      if (data.success) {
        setParticipants(prev => prev.filter(p => p.id !== participantId));
      } else {
        setError(data.error || 'Failed to remove participant');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyInvitationLink = async () => {
    const invitationUrl = `${window.location.origin}/invite/${eventId}`;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setShowShareModal(false);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = invitationUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowShareModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="x" size="xl" className="mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Event not found</h3>
          <p className="text-gray-600 mb-6">
            The event you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const attendingParticipants = participants.filter(p => p.will_attend);
  const flakingParticipants = participants.filter(p => !p.will_attend);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{event.title}</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                {formatDate(event.date)} at {formatTime(event.time)} • {event.location}
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowShareModal(true)}
                className="flex-1 sm:flex-none"
              >
                <Icon name="share" size="sm" className="mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(true)}
                className="flex-1 sm:flex-none"
              >
                <Icon name="plus" size="sm" className="mr-2" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Event Information */}
            <div className="bg-white shadow rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Event Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Event Type</label>
                  <p className="text-gray-900 capitalize">{event.event_type}</p>
                </div>
                {event.event_details && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Event Details</label>
                    <p className="text-gray-900">{event.event_details}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Punishment for Flakers</label>
                  <p className="text-gray-900">{event.punishment}</p>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white shadow rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                <h3 className="text-lg font-medium text-gray-900">Participants</h3>
                <span className="text-sm text-gray-500">
                  {attendingParticipants.length} attending, {flakingParticipants.length} flaking
                </span>
              </div>

              {/* Attending Participants */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-green-700 mb-3">
                  Attending ({attendingParticipants.length})
                </h4>
                {attendingParticipants.length === 0 ? (
                  <p className="text-gray-500 italic">No participants yet.</p>
                ) : (
                  <div className="space-y-2">
                    {attendingParticipants.map((participant) => (
                      <div key={participant.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-green-50 rounded-lg space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{participant.name}</p>
                          <p className="text-sm text-gray-500 truncate">{participant.email}</p>
                          {participant.message && (
                            <p className="text-sm text-gray-600 mt-1 truncate">"{participant.message}"</p>
                          )}
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveParticipant(participant.id)}
                          disabled={actionLoading}
                          className="self-end sm:self-auto"
                        >
                          <Icon name="trash" size="sm" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Flaking Participants */}
              {flakingParticipants.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-red-700 mb-3">
                    Flaking ({flakingParticipants.length})
                  </h4>
                  <div className="space-y-2">
                    {flakingParticipants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{participant.name}</p>
                          <p className="text-sm text-gray-500">{participant.email}</p>
                          {participant.message && (
                            <p className="text-sm text-gray-600 mt-1">"{participant.message}"</p>
                          )}
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveParticipant(participant.id)}
                          disabled={actionLoading}
                        >
                          <Icon name="trash" size="sm" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event Actions */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Event Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="success"
                  onClick={() => {
                    setConfirmAction('complete');
                    setShowConfirmModal(true);
                  }}
                  disabled={actionLoading}
                  className="w-full"
                >
                  <Icon name="check" size="sm" className="mr-2" />
                  Complete Event
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setConfirmAction('cancel');
                    setShowConfirmModal(true);
                  }}
                  disabled={actionLoading}
                  className="w-full"
                >
                  Cancel Event
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setConfirmAction('delete');
                    setShowConfirmModal(true);
                  }}
                  disabled={actionLoading}
                  className="w-full"
                >
                  <Icon name="trash" size="sm" className="mr-2" />
                  Delete Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Event"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Share this invitation link with your friends:
          </p>
          <div className="bg-gray-50 p-3 rounded border">
            <code className="text-sm break-all">
              {`${window.location.origin}/invite/${eventId}`}
            </code>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowShareModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={copyInvitationLink}>
              <Icon name="copy" size="sm" className="mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Participant Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Participant"
      >
        <div className="space-y-4">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              required
              value={newParticipant.name}
              onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
              className="form-input"
              placeholder="Enter participant name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              required
              value={newParticipant.email}
              onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
              className="form-input"
              placeholder="Enter participant email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="message" className="form-label">Message (Optional)</label>
            <textarea
              id="message"
              value={newParticipant.message}
              onChange={(e) => setNewParticipant(prev => ({ ...prev, message: e.target.value }))}
              className="form-input"
              rows={3}
              placeholder="Add a personal message..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddParticipant}
              loading={actionLoading}
              disabled={!newParticipant.name || !newParticipant.email}
            >
              Add Participant
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Action Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={`${confirmAction?.charAt(0).toUpperCase()}${confirmAction?.slice(1)} Event`}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to {confirmAction} this event? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === 'delete' ? 'danger' : 'primary'}
              onClick={handleEventAction}
              loading={actionLoading}
            >
              {confirmAction?.charAt(0).toUpperCase()}{confirmAction?.slice(1)} Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
