import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { participationService } from '../services/participationService';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';

const Home = () => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [participatingEvents, setParticipatingEvents] = useState([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load active event (events user is organizing)
        const event = eventService.getActiveEvent();
        setActiveEvent(event);
        
        // Load events user is participating in
        if (currentUser?.email) {
          // Sync with server first
          await participationService.syncServerParticipations(currentUser.email);
          
          // Get local participations
          const participations = participationService.getUserParticipations(currentUser.email);
          setParticipatingEvents(participations);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentUser]);

  const handleCancelEvent = async () => {
    if (!activeEvent) return;
    
    if (window.confirm('Are you sure you want to cancel this event? It will be marked as cancelled.')) {
      setIsCancelling(true);
      try {
        eventService.cancelEvent(activeEvent.id);
        setActiveEvent(null);
        alert('Event cancelled successfully!');
      } catch (error) {
        console.error('Error cancelling event:', error);
        alert('Error cancelling event. Please try again.');
      } finally {
        setIsCancelling(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="section-container">
          <div className="text-center">
            <Icon name="spinner" style="solid" size="xl" className="animate-spin text-pink-500 mx-auto mb-16" />
            <p className="text-gray-600">Loading your events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-container">
        <div className="section-header">
          <h1 className="section-title">Be there or be square</h1>
          <p className="section-subtitle">
            Never get flaked on again! Create events and let fate decide the punishment for flakes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-32 mb-32">
          {/* Events I'm Organizing */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center">
                <Icon name="crown" style="solid" size="sm" className="mr-8 text-pink-500" />
                Events I'm Organizing
              </h2>
            </div>
            
            {activeEvent ? (
              <div className="space-y-16">
                <div className="p-16 bg-pink-50 rounded-md border border-pink-200">
                  <h3 className="font-semibold text-gray-900 mb-8">{activeEvent.title}</h3>
                  <div className="flex items-center space-x-16 mb-12">
                    <span className="flex items-center text-sm text-gray-600">
                      <Icon name="calendar" style="solid" size="sm" className="mr-4" />
                      {new Date(activeEvent.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center text-sm text-gray-600">
                      <Icon name="users" style="solid" size="sm" className="mr-4" />
                      {activeEvent.participants.length} participants
                    </span>
                  </div>
                  <div className="flex gap-12">
                    <Link to={`/event/${activeEvent.id}`} className="btn btn-primary btn-sm">
                      Manage Event
                    </Link>
                    <button 
                      onClick={handleCancelEvent}
                      disabled={isCancelling}
                      className="btn btn-secondary btn-sm"
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel Event'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-24">
                <Icon name="calendar-times" style="solid" size="xl" className="text-gray-400 mx-auto mb-16" />
                <p className="text-gray-600 mb-16">You're not organizing any events yet.</p>
                <Link to="/create" className="btn btn-primary btn-sm">
                  Create Your First Event
                </Link>
              </div>
            )}
          </div>

          {/* Events I'm Part Of */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center">
                <Icon name="user-friends" style="solid" size="sm" className="mr-8 text-pink-500" />
                Events I'm Part Of
              </h2>
            </div>
            
            {participatingEvents.length > 0 ? (
              <div className="space-y-12">
                {participatingEvents.map((participation) => (
                  <div key={participation.id} className="p-16 bg-pink-50 rounded-md border border-pink-200">
                    <h3 className="font-semibold text-gray-900 mb-8">{participation.eventTitle}</h3>
                    <div className="flex items-center space-x-16 mb-8">
                      <span className="flex items-center text-sm text-gray-600">
                        <Icon name="calendar" style="solid" size="sm" className="mr-4" />
                        {new Date(participation.eventDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center text-sm text-gray-600">
                        <Icon name="user" style="solid" size="sm" className="mr-4" />
                        {participation.organizerName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-8 py-4 rounded-full text-xs font-medium ${
                        participation.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {participation.status === 'confirmed' ? 'Confirmed' : 'Declined'}
                      </span>
                      <Link to={`/event/${participation.eventId}`} className="btn btn-secondary btn-sm">
                        View Event
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <Icon name="user-friends" style="solid" size="xl" className="text-gray-400 mx-auto mb-16" />
                <p className="text-gray-600 mb-16">You haven't joined any events yet.</p>
                <p className="text-sm text-gray-500">Use an invitation link to join an event!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-32">
          {/* Create Event Card */}
          <div className="card">
            <Link to="/create" className="card-link">
              <div className="card-content">
                <div className="card-icon" style={{ backgroundColor: '#ec4899' }}>
                  <Icon name="plus" style="solid" size="xl" />
                </div>
                <h3 className="card-title">Create Event</h3>
                <p className="card-description">
                  Set up a new event and choose how to decide who gets punished for flaking.
                </p>
                <div className="card-action">
                  Get Started
                  <Icon name="arrow-right" style="solid" size="sm" className="card-action-icon" />
                </div>
              </div>
            </Link>
          </div>

          {/* Past Events Card */}
          <div className="card">
            <Link to="/past" className="card-link">
              <div className="card-content">
                <div className="card-icon" style={{ backgroundColor: '#ec4899' }}>
                  <Icon name="history" style="solid" size="xl" />
                </div>
                <h3 className="card-title">Past Events</h3>
                <p className="card-description">
                  See who flaked and what happened to them.
                </p>
                <div className="card-action">
                  View History
                  <Icon name="arrow-right" style="solid" size="sm" className="card-action-icon" />
                </div>
              </div>
            </Link>
          </div>

          {/* Profile Card */}
          <div className="card">
            <Link to="/profile" className="card-link">
              <div className="card-content">
                <div className="card-icon" style={{ backgroundColor: '#ec4899' }}>
                  <Icon name="user" style="solid" size="xl" />
                </div>
                <h3 className="card-title">Profile</h3>
                <p className="card-description">
                  Manage your account settings and preferences.
                </p>
                <div className="card-action">
                  View Profile
                  <Icon name="arrow-right" style="solid" size="sm" className="card-action-icon" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
