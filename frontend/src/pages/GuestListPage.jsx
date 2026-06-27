import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import { listEventsRequest } from '../api/events';
import { listGuestsRequest, addGuestRequest, deleteGuestRequest } from '../api/guests';
import './GuestListPage.css';

export default function GuestListPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [guests, setGuests] = useState([]);
  
  // Loading states
  const [eventsLoading, setEventsLoading] = useState(true);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addError, setAddError] = useState(null);

  // Fetch all events on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await listEventsRequest();
        const eventList = data?.data || data || [];
        setEvents(eventList);
        if (eventList.length > 0) {
          setSelectedEventId(eventList[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve events.');
      } finally {
        setEventsLoading(false);
      }
    })();
  }, []);

  // Fetch guests whenever selectedEventId or statusFilter changes
  useEffect(() => {
    if (!selectedEventId) return;

    (async () => {
      setGuestsLoading(true);
      setError(null);
      try {
        const query = {};
        if (statusFilter !== 'ALL') {
          query.status = statusFilter; // matches backend status expectation
        }
        const data = await listGuestsRequest(selectedEventId, query);
        setGuests(data?.data || data || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve guest list.');
      } finally {
        setGuestsLoading(false);
      }
    })();
  }, [selectedEventId, statusFilter]);

  // Handle Add Guest Submission
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
    setActionLoading(true);
    try {
      const payload = { fullName };
      if (email.trim()) payload.email = email.trim();
      if (phone.trim()) payload.phone = phone.trim();

      const newGuestResponse = await addGuestRequest(selectedEventId, payload);
      const addedGuest = newGuestResponse?.guest || newGuestResponse;

      // Optimistically prepend the guest
      setGuests((prev) => [addedGuest, ...prev]);

      // Reset form & close modal
      setFullName('');
      setEmail('');
      setPhone('');
      setShowAddModal(false);
    } catch (err) {
      setAddError(err.message || 'Failed to add guest.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Guest
  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm('Are you sure you want to remove this guest?')) return;
    
    setActionLoading(true);
    try {
      await deleteGuestRequest(selectedEventId, guestId);
      setGuests((prev) => prev.filter((g) => g.id !== guestId));
    } catch (err) {
      alert(err.message || 'Failed to delete guest.');
    } finally {
      setActionLoading(false);
    }
  };

  // Count summaries dynamically based on the current guests list
  const getCounts = () => {
    const total = guests.length;
    const attending = guests.filter((g) => g.invitation?.status === 'ACCEPTED').length;
    const pending = guests.filter((g) => !g.invitation || g.invitation.status === 'PENDING').length;
    const declined = guests.filter((g) => g.invitation?.status === 'DECLINED').length;

    return { total, attending, pending, declined };
  };

  const counts = getCounts();

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Filter guests locally by search string
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      !search ||
      g.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (g.email && g.email.toLowerCase().includes(search.toLowerCase())) ||
      (g.phone && g.phone.includes(search));
    return matchesSearch;
  });

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
                    {selectedEvent.title} • {counts.total} Guests Listed
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

          {/* Summary Cards */}
          <div className="summary-row">
            <div className="summary-card">
              <div className="summary-value" style={{ color: 'var(--primary)' }}>
                {eventsLoading || guestsLoading ? '...' : counts.total}
              </div>
              <div className="summary-label">Total Guests</div>
            </div>
            <div className="summary-card">
              <div className="summary-value" style={{ color: 'var(--success)' }}>
                {eventsLoading || guestsLoading ? '...' : counts.attending}
              </div>
              <div className="summary-label">Attending</div>
            </div>
            <div className="summary-card">
              <div className="summary-value" style={{ color: 'var(--warning)' }}>
                {eventsLoading || guestsLoading ? '...' : counts.pending}
              </div>
              <div className="summary-label">Pending</div>
            </div>
            <div className="summary-card">
              <div className="summary-value" style={{ color: 'var(--danger)' }}>
                {eventsLoading || guestsLoading ? '...' : counts.declined}
              </div>
              <div className="summary-label">Declined</div>
            </div>
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
              style={{ width: 180 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All RSVP Status</option>
              <option value="CONFIRMED">Attending</option>
              <option value="PENDING">Pending</option>
              <option value="DECLINED">Declined</option>
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
                  <th>Invitation Link</th>
                  <th style={{ width: '100px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {guestsLoading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      Loading guest list...
                    </td>
                  </tr>
                ) : filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      {search || statusFilter !== 'ALL' ? 'No guests match filters.' : 'No guests invited yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((g) => {
                    const status = g.invitation?.status || 'PENDING';
                    const init = g.fullName ? g.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'G';
                    return (
                      <tr key={g.id}>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td>
                          <div className="guest-cell">
                            <div className="guest-avatar-sm">{init}</div>
                            <div>
                              <div className="guest-name">{g.fullName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="guest-email">{g.email || g.phone || '—'}</td>
                        <td>
                          <span
                            className={`badge ${
                              status === 'ACCEPTED' || status === 'CHECKED_IN'
                                ? 'badge-success'
                                : status === 'PENDING'
                                ? 'badge-warning'
                                : 'badge-declined'
                            }`}
                          >
                            {status === 'ACCEPTED' ? 'ATTENDING' : status}
                          </span>
                        </td>
                        <td>
                          {g.invitation?.token ? (
                            <a
                              href={`/rsvp/${selectedEvent?.eventCode}/${g.invitation.token}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                            >
                              RSVP Link
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>None</span>
                          )}
                        </td>
                        <td>
                          <div className="guest-actions">
                            <button
                              className="table-action-btn"
                              title="Remove"
                              onClick={() => handleDeleteGuest(g.id)}
                              disabled={actionLoading}
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
                  })
                )}
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
                  placeholder="e.g. Adequate S. Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
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
                />
              </div>

              {addError && <div className="auth-error" style={{ marginTop: 12 }}>{addError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowAddModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Inviting...' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
