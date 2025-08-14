import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventService } from '../services/eventService';
import Icon from '../components/Icon';

const RSVP = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ willAttend: 'yes', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Try server first (lazy import so missing env doesn't crash app)
        let data = null;
        try {
          const { supabase } = await import('../../lib/supabaseClient');
          const resp = await supabase
            .from('events')
            .select('id,title,date,time,location,decision_mode,punishment,invited_by,created_at')
            .eq('id', eventId)
            .single();
          if (!resp.error) data = resp.data;
        } catch (_) {
          // ignore if supabase not configured
        }

        if (data) {
          setEvent({
            id: data.id,
            title: data.title,
            date: data.date,
            time: data.time,
            location: data.location,
            decisionMode: data.decision_mode,
            punishment: data.punishment,
            dateTime: `${data.date}T${data.time}`,
            invitedBy: data.invited_by || 'A friend'
          });
        } else {
          // Fallback to URL params then local
          const params = new URLSearchParams(window.location.search);
          const title = params.get('title');
          const date = params.get('date');
          const time = params.get('time');
          const location = params.get('location');
          const decision_mode = params.get('decision_mode');
          const punishment = params.get('punishment');
          const invited_by = params.get('invited_by');
          if (title && date && time && punishment) {
            setEvent({
              id: eventId,
              title,
              date,
              time,
              location,
              decisionMode: decision_mode || 'none',
              punishment,
              dateTime: `${date}T${time}`,
              invitedBy: invited_by || 'A friend'
            });
          } else {
            const events = eventService.getEvents();
            const e = events.find(ev => ev.id === eventId);
            if (!e) {
              setError('Event not found');
            } else {
              setEvent(e);
            }
          }
        }
      } catch (err) {
        setError('Unable to load event');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Add to local event participants
      const participant = {
        name: currentUser.name,
        email: currentUser.email,
        message: form.message || (form.willAttend === 'yes' ? 'Confirmed attendance' : 'Cannot attend')
      };

      // Try server write first
      try {
        const { supabase } = await import('../../lib/supabaseClient');
        // Ensure the event exists server-side
        if (event) {
          await supabase.from('events').upsert({
            id: eventId,
            title: event.title,
            date: event.date || (event.dateTime ? new Date(event.dateTime).toISOString().slice(0,10) : null),
            time: event.time || (event.dateTime ? new Date(event.dateTime).toTimeString().slice(0,5) : null),
            location: event.location || null,
            decision_mode: event.decisionMode || 'none',
            punishment: event.punishment || '',
            invited_by: event.invitedBy || 'Organizer'
          });
        }
        
        // Add RSVP to server
        await supabase.from('event_rsvps').insert({
          event_id: eventId,
          name: currentUser.name,
          will_attend: form.willAttend === 'yes'
        });
      } catch (_) {
        // ignore if supabase not configured
      }

      // Add to local event
      eventService.addParticipant(eventId, participant);
      
      setSubmitted(true);
      
      // Redirect to event page after a short delay
      setTimeout(() => {
        navigate(`/event/${eventId}`);
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to submit RSVP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="section-container text-center">
          <Icon name="spinner" style="solid" size="xl" className="animate-spin text-pink-500 mx-auto mb-16" />
          <p className="text-gray-600">Loading invitation…</p>
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
            onClick={() => navigate('/')} 
            className="btn btn-primary btn-md mt-16"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-container max-w-xl mx-auto">
        <div className="card">
          {submitted ? (
            <div className="text-center">
              <Icon name="check-circle" style="solid" size="xl" className="text-green-500 mx-auto mb-16" />
              <h2 className="text-xl font-semibold text-gray-900 mb-8">RSVP Submitted!</h2>
              <p className="text-gray-700">Redirecting you to the event page...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">You're invited!</h1>
              <p className="text-gray-700 mb-8">{event.invitedBy} invited you to…</p>
              
              <div className="space-y-4 mb-8 text-gray-700">
                <div><span className="font-medium">Event:</span> {event.title}</div>
                <div><span className="font-medium">When:</span> {new Date(event.dateTime || `${event.date}T${event.time}`).toLocaleString()}</div>
                {event.location && (
                  <div><span className="font-medium">Where:</span> {event.location}</div>
                )}
                <div><span className="font-medium">Decision mode:</span> {event.decisionMode}</div>
                <div><span className="font-medium">Punishment for flaking:</span> {event.punishment}</div>
              </div>

              <div className="bg-blue-50 p-16 rounded-md mb-24">
                <p className="text-sm text-blue-800">
                  <Icon name="user" style="solid" size="sm" className="mr-8" />
                  You're signed in as <strong>{currentUser.name}</strong> ({currentUser.email})
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <span className="form-label">Will you attend? *</span>
                  <div className="flex gap-12 mt-2">
                    <label className="flex items-center gap-8 text-sm text-gray-700">
                      <input 
                        type="radio" 
                        name="willAttend" 
                        value="yes" 
                        checked={form.willAttend === 'yes'} 
                        onChange={handleChange} 
                      />
                      Yes, I'll be there
                    </label>
                    <label className="flex items-center gap-8 text-sm text-gray-700">
                      <input 
                        type="radio" 
                        name="willAttend" 
                        value="no" 
                        checked={form.willAttend === 'no'} 
                        onChange={handleChange} 
                      />
                      No, can't make it
                    </label>
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="message">Message (optional)</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    className="form-input" 
                    value={form.message} 
                    onChange={handleChange}
                    placeholder="Add a message for the organizer..."
                    rows="3"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-full" 
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : 'Submit RSVP'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RSVP;
