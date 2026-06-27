import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import {
  listGuestsRequest,
  deleteGuestRequest,
  rsvpRequest,
} from '../api/guests';
import './GuestListPage.css';

const RSVP_OPTIONS = [
  { value: 'PENDING', label: 'PENDING' },
  { value: 'RSVP_CONFIRMED', label: 'ATTENDING' },
  { value: 'RSVP_DECLINED', label: 'DECLINED' },
];

function normalizeStatus(status) {
  if (status === 'RSVP_CONFIRMED' || status === 'ATTENDING') return 'RSVP_CONFIRMED';
  if (status === 'RSVP_DECLINED' || status === 'DECLINED') return 'RSVP_DECLINED';
  return 'PENDING';
}

export default function GuestListPage() {
  const location = useLocation();
  const eventId = location.state?.eventId;

  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadGuests = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const result = await listGuestsRequest(eventId, { limit: 100 });
      const list = result?.data ?? result?.guests ?? result ?? [];
      setGuests(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Could not load guests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      setError('No event selected.');
      return;
    }
    loadGuests();
  }, [eventId]);

  const handleRsvpChange = async (guestId, newStatus) => {
    if (!eventId) return;
    setActionError(null);
    setUpdatingId(guestId);
    const prevGuests = guests;
    setGuests((gs) => gs.map((g) => (g.id === guestId ? { ...g, status: newStatus } : g)));
    try {
      await rsvpRequest(eventId, guestId, { status: newStatus });
      await loadGuests();
    } catch (err) {
      setGuests(prevGuests);
      setActionError(err.message || 'Could not update RSVP status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveGuest = async (guestId) => {
    if (!eventId) return;
    setActionError(null);
    setRemovingId(guestId);
    const prevGuests = guests;
    setGuests((gs) => gs.filter((g) => g.id !== guestId));
    try {
      await deleteGuestRequest(eventId, guestId);
    } catch (err) {
      setGuests(prevGuests);
      setActionError(err.message || 'Could not remove guest.');
    } finally {
      setRemovingId(null);
    }
  };

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
                <span className="badge badge-purple" style={{ fontSize: 11, marginRight: 6 }}>Premium Host</span>
                {guests.length} Guests Total
              </p>
            </div>
            <div className="guestlist-top-actions">
              <button className="btn-ghost" style={{ fontSize: 12, padding: '9px 16px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Message All
              </button>
              <button className="btn-ghost" style={{ fontSize: 12, padding: '9px 16px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export List
              </button>
              <button className="btn-primary" style={{ fontSize: 12, padding: '9px 16px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
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
                <div className="summary-value" style={{ color: c.color }}>{c.value}</div>
                <div className="summary-label">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="guestlist-controls">
            <div className="input-icon-wrap" style={{ flex: 1, maxWidth: 360 }}>
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                className="input-field input-with-icon"
                placeholder="Search by name, email or status..."
                value={search}
                onChange={e => setSearch(e.target.value)}
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
            <select className="input-field" style={{ width: 140 }}>
              <option>Filter Party</option>
              <option>VIP</option>
              <option>General</option>
            </select>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="guest-table">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Guest Name</th>
                  <th>Contact Info</th>
                  <th>RSVP Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} style={{ padding: 16, color: 'var(--text-muted)' }}>Loading guests...</td>
                  </tr>
                )}

                {!loading && filteredGuests.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 16, color: 'var(--text-muted)' }}>No guests found.</td>
                  </tr>
                )}

                {!loading && filteredGuests.map((g) => {
                  const name = g.fullName || g.name || 'Unknown';
                  const email = g.email || g.phone || g.contact || '—';
                  const status = normalizeStatus(g.status);
                  const avatar = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <tr key={g.id}>
                      <td><input type="checkbox" /></td>
                      <td>
                        <div className="guest-cell">
                          <div className="guest-avatar-sm">{avatar}</div>
                          <div>
                            <div className="guest-name">{name}</div>
                            <div className="guest-email">{email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="guest-email">{email}</td>
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
                          <button className="table-action-btn" title="Edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            className="table-action-btn"
                            title="Remove"
                            disabled={removingId === g.id}
                            onClick={() => handleRemoveGuest(g.id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="m19,6-.867,13.142A2,2,0,0,1,16.138,21H7.862a2,2,0,0,1-1.995-1.858L5,6m5,0V4a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="table-footer">
              <span>Showing {filteredGuests.length} of {guests.length} guests</span>
            </div>
          </div>

          {/* Delegate Permissions */}
          <div className="delegate-banner card">
            <div>
              <h3 className="inv-section-title">Delegate Event Permissions</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Streamline your hosting experience. Promote trusted guests to Admin status to help manage check-ins, oversee the photo gallery, and moderate guest interactions during the event.
              </p>
            </div>
            <button className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Manage Admin Roles
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}