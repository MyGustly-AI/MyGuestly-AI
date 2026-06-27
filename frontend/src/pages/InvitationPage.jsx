import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { listEventsRequest } from '../api/events';
import { listGuestsRequest, addGuestRequest } from '../api/guests';
import './InvitationPage.css';

export default function InvitationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(location.state?.eventId || '');
  const [guests, setGuests] = useState([]);
  const [step] = useState(2);

  // States for input form
  const [fullName, setFullName] = useState('');
  const [contactInput, setContactInput] = useState('');
  
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch events list on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await listEventsRequest();
        const eventList = data?.data || data || [];
        setEvents(eventList);
        if (!selectedEventId && eventList.length > 0) {
          setSelectedEventId(eventList[0].id);
        }
      } catch (err) {
        setError(err.message || 'Could not load events.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedEventId]);

  // Fetch guest list when selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) return;

    (async () => {
      setLoading(true);
      try {
        const data = await listGuestsRequest(selectedEventId);
        setGuests(data?.data || data || []);
      } catch (err) {
        setError(err.message || 'Could not load guest list.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedEventId]);

  // Handle Manual Add Guest
  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Please enter a guest name.');
      return;
    }
    if (!contactInput.trim()) {
      alert('Please enter either an email or phone number.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = { fullName: fullName.trim() };
      const isEmail = contactInput.includes('@');
      if (isEmail) {
        payload.email = contactInput.trim();
      } else {
        // Assume phone format otherwise
        payload.phone = contactInput.trim();
      }

      const response = await addGuestRequest(selectedEventId, payload);
      const newGuest = response?.guest || response;

      // Update local state list
      setGuests((prev) => [newGuest, ...prev]);

      // Clear input fields
      setFullName('');
      setContactInput('');
    } catch (err) {
      alert(err.message || 'Failed to add guest.');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="app-layout">
      <Sidebar role="host" />
      <main className="main-content">
        <div className="page-inner invitation-outer">
          <div className="invitation-header">
            <h1 className="page-heading">Host Your Masterpiece</h1>
            <p className="page-sub">
              {selectedEvent
                ? `Let's curate your guest list for ${selectedEvent.title}.`
                : 'Select an event to invite guests.'}
            </p>
          </div>

          {/* Stepper */}
          <div className="stepper">
            {['Event Details', 'Design Invitation', 'Guest List'].map((s, i) => (
              <React.Fragment key={i}>
                <div className={`step ${step > i ? 'done' : step === i ? 'active' : ''}`}>
                  <div className="step-circle">
                    {step > i
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      : i + 1}
                  </div>
                  <span className="step-label">{s}</span>
                </div>
                {i < 2 && <div className={`step-line ${step > i ? 'done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>

          {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="invitation-cols">
            {/* Import Guests */}
            <form className="card invitation-import" onSubmit={handleAddGuest}>
              <h3 className="inv-section-title">Import Guests</h3>
              <p className="inv-section-sub">Quickly invite guests by adding details manually below.</p>
              
              <div className="form-group">
                <label className="label">Full Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g., Adequate S. Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginTop: 10 }}>
                <label className="label">Email or Phone</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="email@example.com or +23480..."
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                disabled={actionLoading || !selectedEventId}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                {actionLoading ? 'Inviting Guest...' : 'Add Guest'}
              </button>
            </form>

            {/* Guest List */}
            <div className="card invitation-list">
              <div className="inv-list-header">
                <div>
                  <h3 className="inv-section-title">Guests ({guests.length})</h3>
                  <p className="inv-section-sub">
                    {guests.filter((g) => g.invitation?.status === 'ACCEPTED').length} guests already accepted digital invitations.
                  </p>
                </div>
                {events.length > 1 && (
                  <select
                    className="input-field"
                    style={{ width: 180, fontSize: 11, height: 32, padding: '0 8px' }}
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="inv-table">
                <div className="inv-table-head">
                  <span>Guest Name</span>
                  <span>Contact</span>
                  <span>Status</span>
                </div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                    Loading guests...
                  </div>
                ) : guests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                    No guests invited yet.
                  </div>
                ) : (
                  guests.slice(0, 5).map((g, i) => {
                    const status = g.invitation?.status || 'PENDING';
                    const init = g.fullName ? g.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'G';
                    return (
                      <div key={g.id || i} className="inv-table-row">
                        <div className="inv-guest">
                          <div className="inv-avatar">{init}</div>
                          <span className="inv-name">{g.fullName}</span>
                        </div>
                        <span className="inv-contact">{g.email || g.phone}</span>
                        <span
                          className={`badge ${
                            status === 'ACCEPTED' || status === 'CHECKED_IN'
                              ? 'badge-success'
                              : status === 'PENDING'
                              ? 'badge-purple'
                              : 'badge-danger'
                          }`}
                        >
                          {status === 'ACCEPTED' ? 'RSVP Confirmed' : status === 'PENDING' ? 'Invitation Sent' : 'RSVP Declined'}
                        </span>
                      </div>
                    );
                  })
                )}
                <button
                  className="view-all-btn"
                  style={{ margin: '10px auto', display: 'block' }}
                  onClick={() => navigate('/host/guest-list')}
                  disabled={!selectedEventId}
                >
                  View All Guests
                </button>
              </div>
            </div>
          </div>

          {/* Step nav */}
          <div className="inv-step-nav">
            <button className="btn-ghost" onClick={() => navigate('/host/create-event')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              Previous Step
            </button>
            <button className="btn-primary" onClick={() => navigate('/host/guest-list')}>
              Review & Finalise
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
