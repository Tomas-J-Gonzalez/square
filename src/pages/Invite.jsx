import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';

const Invite = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', willAttend: 'yes' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // If user is logged in, redirect to RSVP page
        if (currentUser) {
          navigate(`/rsvp/${eventId}${window.location.search}`);
          return;
        }

        // Try server first (lazy import so missing env doesn't crash app)
        let data = null;
        try {
          const { supabase } = await import('../../lib/supabaseClient');
          if (supabase) {
            const resp = await supabase
              .from('events')
              .select('id,title,date,time,location,decision_mode,punishment,invited_by,created_at')
              .eq('id', eventId)
              .single();
            if (!resp.error) data = resp.data;
          }
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
          // Fallback to URL params then local (so public RSVP works without server)
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
  }, [eventId, currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Please provide your name');
      return;
    }
    setSubmitting(true);
    try {
      // insert RSVP to server table (best-effort, dynamic import)
      try {
        const { supabase } = await import('../../lib/supabaseClient');
        if (supabase && event) {
          // Ensure the event exists server-side (handles older events created before server upsert)
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
          
          // Insert RSVP
          const { error } = await supabase.from('event_rsvps').insert({
            event_id: eventId,
            name: form.name.trim(),
            will_attend: form.willAttend === 'yes'
          });
          if (error) throw error;
          
          console.log('RSVP submitted successfully to server');
        } else {
          console.warn('Supabase not available, RSVP not saved to server');
        }
      } catch (error) {
        console.error('Error submitting RSVP to server:', error);
        // Continue with local submission even if server fails
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="section"><div className="section-container text-center">
        <Icon name="spinner" style="solid" size="xl" className="animate-spin text-pink-500 mx-auto mb-16" />
        <p className="text-gray-600">Loading invitation…</p>
      </div></div>
    );
  }

  if (error) {
    return (
      <div className="section"><div className="section-container text-center">
        <Icon name="exclamation-triangle" style="solid" size="xl" className="text-red-500 mx-auto mb-16" />
        <p className="text-gray-600">{error}</p>
      </div></div>
    );
  }

  return (
    <div className="section">
      <div className="section-container max-w-xl mx-auto">
        <div className="card">
          {submitted ? (
            <div className="text-center">
              <Icon name="check-circle" style="solid" size="xl" className="text-green-500 mx-auto mb-16" />
              <h2 className="text-xl font-semibold text-gray-900 mb-8">Thanks for your response!</h2>
              <p className="text-gray-700">You can close this window now.</p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label" htmlFor="name">Your name *</label>
              <input id="name" name="name" type="text" className="form-input" value={form.name} onChange={handleChange} required />
            </div>

            <div>
              <span className="form-label">Will you attend? *</span>
              <div className="flex gap-12 mt-2">
                <label className="flex items-center gap-8 text-sm text-gray-700">
                  <input type="radio" name="willAttend" value="yes" checked={form.willAttend === 'yes'} onChange={handleChange} />
                  Yes, I'll be there
                </label>
                <label className="flex items-center gap-8 text-sm text-gray-700">
                  <input type="radio" name="willAttend" value="no" checked={form.willAttend === 'no'} onChange={handleChange} />
                  No, can't make it
                </label>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit RSVP'}
            </button>

            {/* Optional: sign in or sign up */}
            <div className="text-center text-sm text-gray-600">
              <p className="mb-8">Already have an account?</p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center">
                <a href={`/login?redirect=/rsvp/${eventId}${window.location.search}`} className="btn btn-secondary btn-sm">Sign in and RSVP</a>
                <a href="/register" className="btn btn-outline btn-sm">Create an account</a>
              </div>
            </div>
          </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invite;


