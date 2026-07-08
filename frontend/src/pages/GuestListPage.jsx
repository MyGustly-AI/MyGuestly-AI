import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import { listEventsRequest } from '../api/events';
import {
  listGuestsRequest,
  addGuestRequest,
  deleteGuestRequest,
  updateGuestRsvpRequest,
} from '../api/guests';
import './GuestListPage.css';

const RSVP_OPTIONS = [
  { value: 'PENDING', label: 'PENDING' },
  { value: 'RSVP_CONFIRMED', label: 'ATTENDING' },
  { value: 'RSVP_DECLINED', label: 'DECLINED' },
];

function normalizeStatus(status) {
  if (status === 'RSVP_CONFIRMED' || status === 'ATTENDING' || status === 'ACCEPTED') return 'RSVP_CONFIRMED';
  if (status === 'RSVP_DECLINED' || status === 'DECLINED') return 'RSVP_DECLINED';
  return 'PENDING';
}

export default function GuestListPage() {
  const location = useLocation();
  const locationEventId = location.state?.eventId;

  // State
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(locationEventId || '');
  const [guests, setGuests] = useState([]);

  const [eventsLoading, setEventsLoading] = useState(true);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addError, setAddError] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  // Fetch events on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await listEventsRequest({ limit: 100 });
        const eventList = data?.data || data || [];
        setEvents(eventList);
        if (eventList.length > 0 && !selectedEventId) {
          setSelectedEventId(eventList[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve events.');
      } finally {
        setEventsLoading(false);
      }
    })();
  }, []);

  // Fetch guests when event changes
  useEffect(() => {
    if (!selectedEventId) {
      setGuests([]);
      return;
    }

    (async () => {
      setGuestsLoading(true);
      setError(null);
      try {
        const query = statusFilter !== 'ALL' ? { status: statusFilter } : {};
        const data = await listGuestsRequest(selectedEventId, query);
        setGuests(data?.data || data?.guests || data || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve guest list.');
      } finally {
        setGuestsLoading(false);
      }
    })();
  }, [selectedEventId, statusFilter]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Filtered & memoized guests
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const name = g.fullName || g.name || '';
      const email = g.email || g.phone || g.contact || '';
      const status = normalizeStatus(g.status);

      const matchesSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
        status.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = statusFilter === 'ALL' || status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [guests, search, statusFilter]);

  // Summary stats
  const summary = useMemo(() => {
    const total = guests.length;
    const attending = guests.filter((g) => normalizeStatus(g.status) === 'RSVP_CONFIRMED').length;
    const pending = guests.filter((g) => normalizeStatus(g.status) === 'PENDING').length;
    const declined = guests.filter((g) => normalizeStatus(g.status) === 'RSVP_DECLINED').length;
    return [
      { label: 'Total Guests', value: total, color: 'var(--primary)' },
      { label: 'Attending', value: attending, color: 'var(--success)' },
      { label: 'Pending', value: pending, color: 'var(--warning)' },
      { label: 'Declined', value: declined, color: 'var(--danger)' },
    ];
  }, [guests]);

  const handleRsvpChange = async (guestId, newStatus) => {
    setActionError(null);
    setUpdatingId(guestId);
    const prevGuests = guests;
    setGuests((gs) => gs.map((g) => (g.id === guestId ? { ...g, status: newStatus } : g)));
    try {
      await updateGuestRsvpRequest(selectedEventId, guestId, { status: newStatus });
    } catch (err) {
      setGuests(prevGuests);
      setActionError(err.message || 'Could not update RSVP status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle remove guest
  const handleRemoveGuest = async (guestId) => {
    if (!window.confirm('Remove this guest?')) return;
    
    setActionError(null);
    setRemovingId(guestId);
    const prevGuests = guests;
    setGuests((gs) => gs.filter((g) => g.id !== guestId));
    try {
      await deleteGuestRequest(selectedEventId, guestId);
    } catch (err) {
      setGuests(prevGuests);
      setActionError(err.message || 'Could not remove guest.');
    } finally {
      setRemovingId(null);
    }
  };

  // Handle add guest
  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setAddError('Full Name is required.');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setAddError('Please provide either an Email or Phone number.');
      return;
    }

    setAddError(null);
    setAddLoading(true);
    try {
      const payload = { fullName };
      if (email.trim()) payload.email = email.trim();
      if (phone.trim()) payload.phone = phone.trim();

      const newGuestResponse = await addGuestRequest(selectedEventId, payload);
      const addedGuest = newGuestResponse?.guest || newGuestResponse;

      setGuests((prev) => [addedGuest, ...prev]);

      setFullName('');
      setEmail('');
      setPhone('');
      setShowAddModal(false);
    } catch (err) {
      setAddError(err.message || 'Failed to add guest.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar role="host" />
      <main className="main-content">
        <AppHeader
          links={[
            { label: 'Timeline', href: '/timeline' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'RSVP', href: '/host/guest-list' },
            { label: 'Help', href: '#' },
          ]}
          active="RSVP"
        />
        <div className="page-inner guestlist-outer">
          <div className="guestlist-top">
            <div>
              <h1 className="page-heading">Guest List Management</h1>
              <p className="page-sub" style={{ marginTop: 4 }}>
                {selectedEvent ? (
                  <>
                    <span className="badge badge-purple" style={{ fontSize: 11, marginRight: 6 }}>
                      {selectedEvent.eventCategory || 'Event'}
                    </span>
                    {selectedEvent.title} • {guests.length} Guests Listed
                  </>
                ) : (
                  'Select an event to manage attendees.'
                )}
              </p>
            </div>
            <div className="guestlist-top-actions">
              {events.length > 1 && (
                <select
                  className="input-field"
                  style={{ width: 200, fontSize: 12, height: 38 }}
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="">Select an event...</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              )}
              <button
                className="btn-primary"
                style={{ fontSize: 12, padding: '9px 16px' }}
                onClick={() => setShowAddModal(true)}
                disabled={!selectedEventId}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Add Guest
              </button>
            </div>
          </div>

          {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
          {actionError && <div className="auth-error" style={{ marginBottom: 16 }}>{actionError}</div>}

          {/* Summary Cards */}
          <div className="summary-row">
            {summary.map((c, i) => (
              <div key={i} className="summary-card">
                <div className="summary-value" style={{ color: c.color }}>
                  {guestsLoading ? '...' : c.value}
                </div>
                <div className="summary-label">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="guestlist-controls">
            <div className="input-icon-wrap" style={{ flex: 1, maxWidth: 360 }}>
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="input-field input-with-icon"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: 'var(--white)' }}
              />
            </div>
            <select
              className="input-field"
              style={{ width: 160 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All RSVP Status</option>
              <option value="RSVP_CONFIRMED">Attending</option>
              <option value="PENDING">Pending</option>
              <option value="RSVP_DECLINED">Declined</option>
            </select>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="guest-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" />
                  </th>
                  <th>Guest Name</th>
                  <th>Contact Info</th>
                  <th>RSVP Status</th>
                  <th style={{ width: '100px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {guestsLoading && (
                  <tr>
                    <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading guest list...
                    </td>
                  </tr>
                )}

                {!guestsLoading && filteredGuests.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                      {search || statusFilter !== 'ALL' ? 'No guests match filters.' : 'No guests invited yet.'}
                    </td>
                  </tr>
                )}

                {!guestsLoading && filteredGuests.map((g) => {
                  const name = g.fullName || g.name || 'Unknown';
                  const contactInfo = g.email || g.phone || '—';
                  const status = normalizeStatus(g.status);
                  const avatar = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <tr key={g.id}>
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>
                        <div className="guest-cell">
                          <div className="guest-avatar-sm">{avatar}</div>
                          <div>
                            <div className="guest-name">{name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="guest-email">{contactInfo}</td>
                      <td>
                        <select
                          className={`badge badge-select ${
                            status === 'RSVP_CONFIRMED' ? 'badge-success' :
                            status === 'RSVP_DECLINED' ? 'badge-declined' : 'badge-warning'
                          }`}
                          value={status}
                          disabled={updatingId === g.id}
                          onChange={(e) => handleRsvpChange(g.id, e.target.value)}
                        >
                          {RSVP_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="guest-actions">
                          <button
                            className="table-action-btn"
                            title="Remove"
                            disabled={removingId === g.id}
                            onClick={() => handleRemoveGuest(g.id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6" />
                              <path d="m19,6-.867,13.142A2,2,0,0,1,16.138,21H7.862a2,2,0,0,1-1.995-1.858L5,6m5,0V4a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="table-footer">
              <span>
                Showing {filteredGuests.length} of {guests.length} guests
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => window.history.back()}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Invite New Guest</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddGuest}>
              <div className="form-group">
                <label className="label">Full Name *</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. Adekunle Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={addLoading}
                />
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="label">Email Address</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={addLoading}
                />
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="label">Phone Number (E.164 format)</label>
                <input
                  className="input-field"
                  type="tel"
                  placeholder="e.g. +2348032454760"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={addLoading}
                />
              </div>

              {addError && <div className="auth-error" style={{ marginTop: 12 }}>{addError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowAddModal(false)}
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={addLoading}>
                  {addLoading ? 'Adding...' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}