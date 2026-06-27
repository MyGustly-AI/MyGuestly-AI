// src/pages/HostDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { listEventsRequest } from '../api/events';
import { useAuth } from '../context/AuthContext';
import './HostDashboard.css';

const activities = [
  {
    name: 'Bolaji Ogundele',
    action: 'confirmed RSVP',
    event: "Amara & David's Wedding",
    time: '2 mins ago',
    type: 'rsvp',
    badge: 'Attending',
  },
  {
    name: 'Kemi Adeyemi',
    action: 'checked in',
    event: 'Corporate AI Summit',
    time: '15 mins ago',
    type: 'checkin',
    timeOnly: '10:42 AM',
  },
  {
    name: '12 new memories uploaded',
    action: '',
    event: "Amara & David's Wedding",
    time: '1 hour ago',
    type: 'gallery',
    extra: '+10',
  },
];

const TABS = ['All', 'RSVPs', 'Check-ins'];

export default function HostDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await listEventsRequest({ limit: 5 });
        setEvents(result?.data ?? result ?? []);
      } catch (err) {
        setError(err.message || 'Could not load events.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Pending invites + checked-in are computed by pulling guest lists across
  // all of the host's events and tallying status, since there's no dedicated
  // aggregate stats endpoint yet.
  useEffect(() => {
    if (loading || events.length === 0) {
      if (!loading) setStatsLoading(false);
      return;
    }

    (async () => {
      setStatsLoading(true);
      try {
        const guestLists = await Promise.all(
          events.map((e) =>
            listGuestsRequest(e.id, { limit: 500 }).catch(() => null)
          )
        );

        let pending = 0;
        let checkedIn = 0;

        guestLists.forEach((result) => {
          if (!result) return;
          const list = result?.data ?? result?.guests ?? result ?? [];
          const guests = Array.isArray(list) ? list : [];
          guests.forEach((g) => {
            const status = g.status;
            if (!status || status === 'PENDING') pending += 1;
            if (g.checkedIn || status === 'CHECKED_IN') checkedIn += 1;
          });
        });

        setPendingInvites(pending);
        setCheckedInCount(checkedIn);
      } catch {
        setPendingInvites(null);
        setCheckedInCount(null);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, [loading, events]);

  const featuredEvent = events[0];

  const totalEvents = events.length;
  const totalRsvps = events.reduce((sum, e) => sum + (e.confirmedGuests || 0), 0);

  const stats = [
    { label: 'TOTAL EVENTS', value: loading ? '...' : String(totalEvents), badge: '', badgeType: 'up' },
    { label: 'TOTAL RSVPS', value: loading ? '...' : String(totalRsvps), badge: '', badgeType: 'up' },
    { label: 'PENDING INVITES', value: '—', badge: '', badgeType: 'warn' },
    { label: 'CHECKED-IN', value: '—', badge: '', badgeType: 'ok' },
  ];

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'var(--success)';
    if (progress >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="app-layout">
      <Sidebar role="host" user={{ name: user?.fullName || 'Host', plan: 'Host Account' }} />

      <main className="main-content">
        <div className="dashboard-inner">

          <div className="dashboard-greeting">
            <div className="greeting-center">
              <h1 className="dashboard-heading">
                Welcome back, <span className="highlight">{user?.fullName?.split(' ')[0] || 'Host'}!</span>
              </h1>
              <p className="dashboard-sub">
                {loading ? 'Loading your events...' : `You have ${totalEvents} event${totalEvents === 1 ? '' : 's'} on your dashboard.`}
              </p>
            </div>
            <div className="dashboard-header-icons">
              <button className="icon-btn" onClick={() => navigate('/notification')}>
                <BellIcon />
              </button>
              <button className="icon-btn" onClick={() => navigate('/settings')}>
                <SettingsIcon />
              </button>
              <img
                src="/profile.png"
                alt="User"
                className="header-avatar"
                onClick={() => navigate('/profile')}
              />
            </div>
          </div>

          {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="stats-row">
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-card-label">{s.label}</span>
                  {s.badge && <span className={`stat-badge stat-badge--${s.badgeType}`}>{s.badge}</span>}
                </div>
              </div>
            </div>

            {/* Events Section */}
            <div className="events-section">
              <div className="section-header">
                <h2>Active Events</h2>
                <button className="btn-ghost" onClick={() => navigate('/host/events')}>
                  View All →
                </button>
              </div>

              {loading ? (
                <div className="loading-state">Loading your events...</div>
              ) : events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎉</div>
                  <h3>You haven't created any events yet</h3>
                  <p>Start by creating your first event</p>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/host/create-event')}
                  >
                    Create Your First Event
                  </button>
                </div>
              ) : (
                <div className="events-grid">
                  {events.map(event => (
                    <div key={event.id} className="event-card">
                      <div className="event-card-header">
                        <h3 className="event-title">{event.title}</h3>
                        <span className={`badge ${getStatusBadge(event.status)}`}>
                          {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
                        </span>
                      </div>
                      
                      <p className="event-date">📅 {event.date}</p>
                      
                      <div className="rsvp-section">
                        <div className="rsvp-header">
                          <span>RSVP Progress</span>
                          <span className="rsvp-percent">{event.rsvpProgress}%</span>
                        </div>
                        <div className="progress-bar-wrap">
                          <div 
                            className="progress-bar-fill" 
                            style={{ 
                              width: `${event.rsvpProgress}%`,
                              background: getProgressColor(event.rsvpProgress)
                            }}
                          />
                        </div>
                        <p className="rsvp-count">
                          {event.confirmed.toLocaleString()} / {event.total.toLocaleString()} Guests confirmed
                        </p>
                      </div>

                      <div className="event-actions">
                        <button 
                          className="btn-outline"
                          style={{ padding: '8px 16px', fontSize: '13px' }}
                          onClick={() => navigate(`/host/event/${event.id}`)}
                        >
                          Manage
                        </button>
                        <button 
                          className="btn-ghost"
                          style={{ padding: '8px 16px', fontSize: '13px' }}
                          onClick={() => navigate(`/event/${event.id}`)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="quick-actions-grid">
                <div 
                  className="quick-action-card"
                  onClick={() => navigate('/host/create-event')}
                >
                  <span className="quick-icon">➕</span>
                  <span className="quick-label">Create Event</span>
                </div>
                <div 
                  className="quick-action-card"
                  onClick={() => navigate('/host/guest-list')}
                >
                  <span className="quick-icon">👥</span>
                  <span className="quick-label">Manage Guests</span>
                </div>
                <div 
                  className="quick-action-card"
                  onClick={() => navigate('/host/invitation')}
                >
                  <span className="quick-icon">📨</span>
                  <span className="quick-label">Send Invites</span>
                </div>
                <div 
                  className="quick-action-card"
                  onClick={() => navigate('/gallery')}
                >
                  <span className="quick-icon">🖼️</span>
                  <span className="quick-label">Gallery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
