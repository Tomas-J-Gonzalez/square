import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import Icon from '../components/Icon';

const Invite = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', willAttend: 'yes' });
  const [submitting, setSubmitting] = useState(false);

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
  }, [eventId]);

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
        const { error } = await supabase.from('event_rsvps').insert({
          event_id: eventId,
          name: form.name.trim(),
          will_attend: form.willAttend === 'yes'
        });
        if (error) throw error;
      } catch (_) {
        // ignore if supabase not configured
      }
      navigate(`/event/${eventId}`);
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default Invite;


