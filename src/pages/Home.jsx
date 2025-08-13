import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import Icon from '../components/Icon';

const Home = () => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load active event on component mount
    const event = eventService.getActiveEvent();
    setActiveEvent(event);
  }, []);

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

  return (
    <div className="section">
      <div className="section-container">
        <div className="section-header">
          <h1 className="section-title">Be there or be square</h1>
          <p className="section-subtitle">
            Never get flaked on again! Create events and let fate decide the punishment for flakes.
          </p>
        </div>

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

          {/* View/Join Event Card */}
          <div className="card">
            {activeEvent ? (
              <div>
                <div className="card-content">
                  <div className="card-icon" style={{ backgroundColor: '#ec4899' }}>
                    <Icon name="calendar-check" style="solid" size="xl" />
                  </div>
                  <h3 className="card-title">Active Event</h3>
                  <p className="card-description">{activeEvent.title}</p>
                  <div className="flex items-center justify-center space-x-16 mb-24">
                    <span className="flex items-center text-sm text-subtle">
                      <Icon name="calendar" style="solid" size="sm" className="mr-4" />
                      {new Date(activeEvent.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center text-sm text-subtle">
                      <Icon name="users" style="solid" size="sm" className="mr-4" />
                      {activeEvent.participants.length} participants
                    </span>
                  </div>
                  <div className="flex justify-center gap-16">
                    <Link to={`/event/${activeEvent.id}`} className="btn btn-primary btn-sm">
                      View Event
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
              <div className="card-content">
                <div className="card-icon" style={{ backgroundColor: '#ec4899' }}>
                  <Icon name="calendar-times" style="solid" size="xl" />
                </div>
                <h3 className="card-title">No Active Event</h3>
                <p className="card-description">
                  Create an event or join one with an invite link.
                </p>
                <div className="card-action">
                  Create One
                  <Icon name="arrow-right" style="solid" size="sm" className="card-action-icon" />
                </div>
              </div>
            )}
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
        </div>
      </div>
    </div>
  );
};

export default Home;
