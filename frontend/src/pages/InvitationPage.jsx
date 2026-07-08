import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { listEventsRequest } from '../api/events';
import {
  listGuestsRequest,
  addGuestRequest,
  importGuestsRequest,
  sendAllInvitesRequest,
} from '../api/guests';
export default function InvitationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.state?.eventId;

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || '');
  const [guests, setGuests] = useState([]);
  const [step] = useState(2);

  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [invitingAll, setInvitingAll] = useState(false);
  const [error, setError] = useState(null);
  const [addError, setAddError] = useState(null);

  const fileInputRef = useRef(null);

  // Load events on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await listEventsRequest({ limit: 50 });
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
  }, []);

  // Load guests when event changes
  useEffect(() => {
    if (!selectedEventId) {
      setGuests([]);
      return;
    }

    (async () => {
      try {
        const data = await listGuestsRequest(selectedEventId, { limit: 100 });
        const list = data?.data || data?.guests || data || [];
        setGuests(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.message || 'Could not load guests.');
      }
    })();
  }, [selectedEventId]);

  // Handle add guest manually
  const handleAddGuest = async () => {
    if (!fullName.trim() || !contact.trim()) {
      setAddError('Please enter name and email/phone.');
      return;
    }
    if (!selectedEventId) {
      setAddError('Please select an event first.');
      return;
    }

    setAddError(null);
    setAdding(true);
    try {
      const isEmail = contact.includes('@');
      await addGuestRequest(selectedEventId, {
        fullName: fullName.trim(),
        email: isEmail ? contact.trim() : undefined,
        phone: isEmail ? undefined : contact.trim(),
      });
      setFullName('');
      setContact('');
      // Reload guests
      const data = await listGuestsRequest(selectedEventId);
      setGuests(data?.data || data?.guests || data || []);
    } catch (err) {
      setAddError(err.message || 'Could not add guest.');
    } finally {
      setAdding(false);
    }
  };

  // Handle file import
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEventId) return;

    setImporting(true);
    setError(null);
    try {
      await importGuestsRequest(selectedEventId, file);
      const data = await listGuestsRequest(selectedEventId);
      setGuests(data?.data || data?.guests || data || []);
    } catch (err) {
      setError(err.message || 'Could not import guests.');
    } finally {
      setImporting(false);
    }
  };

  // Handle send all invites
  const handleInviteAll = async () => {
    if (!selectedEventId) return;

    setInvitingAll(true);
    setError(null);
    try {
      await sendAllInvitesRequest(selectedEventId);
      const data = await listGuestsRequest(selectedEventId);
      setGuests(data?.data || data?.guests || data || []);
    } catch (err) {
      setError(err.message || 'Could not send invitations.');
    } finally {
      setInvitingAll(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const confirmedGuests = guests.filter(
    (g) => g.status === 'RSVP_CONFIRMED' || g.status === 'ACCEPTED'
  ).length;

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
                    {step > i ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
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
            <div className="card invitation-import">
              <h3 className="inv-section-title">Import Guests</h3>
              <p className="inv-section-sub">Drag and drop your file here or browse files.</p>

              {/* Event selector if multiple events */}
              {events.length > 1 && (
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="label">Select Event</label>
                  <select
                    className="input-field"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                  >
                    <option value="">Choose event...</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* File upload */}
              <div className="upload-drop">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ color: 'var(--text-light)' }}
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17,8 12,3 7,8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p>{importing ? 'Importing...' : 'Upload CSV or Excel'}</p>
                <small>Drag and drop your file here</small>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={handleFileSelected}
                />
                <button
                  className="btn-outline"
                  style={{ marginTop: 10, fontSize: 12, padding: '8px 18px' }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing || !selectedEventId}
                >
                  Browse Files
                </button>
              </div>

              <div className="inv-divider">
                <span>OR MANUALLY ADD</span>
              </div>

              {/* Manual add form */}
              <div className="form-group">
                <label className="label">Full Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g., Adekunle Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={adding}
                />
              </div>
              <div className="form-group" style={{ marginTop: 10 }}>
                <label className="label">Email or Phone</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="email@example.com or +2348..."
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  disabled={adding}
                />
              </div>

              {addError && <div className="auth-error" style={{ marginTop: 10 }}>{addError}</div>}

              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                onClick={handleAddGuest}
                disabled={adding || !selectedEventId}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                {adding ? 'Adding...' : 'Add Guest'}
              </button>
            </div>

            {/* Guest List */}
            <div className="card invitation-list">
              <div className="inv-list-header">
                <div>
                  <h3 className="inv-section-title">Guests ({guests.length})</h3>
                  <p className="inv-section-sub">
                    {confirmedGuests} guests already confirmed.
                  </p>
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: 12, padding: '8px 14px' }}
                  onClick={handleInviteAll}
                  disabled={invitingAll || !selectedEventId || guests.length === 0}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {invitingAll ? 'Sending...' : 'Invite All'}
                </button>
              </div>

              <div className="inv-table">
                <div className="inv-table-head">
                  <span>Guest Name</span>
                  <span>Contact</span>
                  <span>Status</span>
                </div>

                {loading && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                    Loading guests...
                  </div>
                )}

                {!loading && guests.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                    No guests added yet.
                  </div>
                )}

                {!loading &&
                  guests.slice(0, 5).map((g, i) => {
                    const status = g.status || 'PENDING';
                    const name = g.fullName || g.name || 'Unknown';
                    const contactInfo = g.email || g.phone || g.contact || '—';
                    const init = name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();

                    return (
                      <div key={g.id || i} className="inv-table-row">
                        <div className="inv-guest">
                          <div className="inv-avatar">{init}</div>
                          <span className="inv-name">{name}</span>
                        </div>
                        <span className="inv-contact">{contactInfo}</span>
                        <span
                          className={`badge ${
                            status === 'RSVP_CONFIRMED' || status === 'ACCEPTED'
                              ? 'badge-success'
                              : 'badge-purple'
                          }`}
                        >
                          {status === 'RSVP_CONFIRMED' || status === 'ACCEPTED'
                            ? 'RSVP Confirmed'
                            : 'Invitation Sent'}
                        </span>
                      </div>
                    );
                  })}

                <button
                  className="view-all-btn"
                  style={{ margin: '10px auto', display: 'block' }}
                  onClick={() => navigate('/host/guest-list', { state: { eventId: selectedEventId } })}
                  disabled={!selectedEventId}
                >
                  View All Guests
                </button>
              </div>
            </div>
          </div>

          <div className="inv-step-nav">
            <button className="btn-ghost" onClick={() => navigate('/host/create-event')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Previous Step
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate('/host/guest-list', { state: { eventId: selectedEventId } })}
              disabled={!selectedEventId}
            >
              Review & Finalise
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}