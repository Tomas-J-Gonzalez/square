import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../hooks/useModal';
import Icon from '../components/Icon';
import Modal from '../components/Modal';

const Invite = () => {
  const router = useRouter();
  const { eventId } = router.query;
  const { currentUser } = useAuth();
  const { modal, showSuccessModal, showErrorModal } = useModal();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', willAttend: 'yes' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Public route: do not force login; if logged in we still allow the page without redirect

        // Try API first to get event data
        let data = null;
        try {
          const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'getEvent',
              eventId
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.event) {
              data = result.event;
            }
          }
        } catch (error) {
          console.error('Error fetching event from API:', error);
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
            setError('Event not found');
          }
        }
      } catch (err) {
        setError('Unable to load event');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId, currentUser, router]);

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
    setError('');
    
    try {
      // Submit RSVP to Supabase only
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          name: form.name.trim(),
          email: form.email.trim() || null,
          willAttend: form.willAttend === 'yes',
          event
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitted(true);
        showSuccessModal(
          'RSVP Submitted!',
          'Thanks for your response! Your RSVP has been submitted successfully.',
          () => {}
        );
      } else {
        setError(result.error || 'Failed to submit RSVP');
        showErrorModal('RSVP Error', result.error || 'Failed to submit RSVP');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit response';
      setError(errorMessage);
      showErrorModal('RSVP Error', errorMessage);
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
                  <input 
                    id="name" 
                    name="name" 
                    type="text" 
                    className="form-input" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor="email">Your email (optional)</label>
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    className="form-input" 
                    value={form.email} 
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>

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

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-full" 
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : 'Submit RSVP'}
                </button>

                {/* Optional: sign in or sign up */}
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-8">Already have an account?</p>
                  <div className="flex flex-col sm:flex-row gap-8 justify-center">
                    <a 
                      href={`/login?redirect=/rsvp/${eventId}${window.location.search}`} 
                      className="btn btn-secondary btn-sm"
                    >
                      Sign in and RSVP
                    </a>
                    <a href="/register" className="btn btn-outline btn-sm">
                      Create an account
                    </a>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      
      <Modal {...modal} />
    </div>
  );
};

export default Invite;


