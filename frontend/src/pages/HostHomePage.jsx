import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../api/components/Sidebar';
import { listEventsRequest } from '../api/events';
import { useAuth } from '../context/AuthContext';
import './HostHomePage.css';

export default function HostHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('Home');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navLinks = ['Home', 'Explore', 'History'];

  useEffect(() => {
    (async () => {
      try {
        const status = activeNav === 'History' ? 'completed' : undefined;
        const result = await listEventsRequest({ limit: 12, status });
        const list = result?.data ?? result?.events ?? result ?? [];
        setEvents(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.message || 'Could not load events.');
      } finally {
        setLoading(false);
      }
    })();
  }, [activeNav]);

  const totalConfirmed = events.reduce((sum, e) => sum + (e.confirmedGuests || 0), 0);
  const upcomingCount = events.filter((e) => e.status !== 'completed' && e.status !== 'ended').length;

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getEventBadge = (e) => {
    if (e.status === 'completed' || e.status === 'ended') return 'History';
    if (!e.startDate) return 'Upcoming';
    const daysAway = Math.ceil((new Date(e.startDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysAway > 0 && daysAway <= 60) return `In ${daysAway} Days`;
    return 'Upcoming';
  };

  return (
    <div className="app-layout">
      <Sidebar role="host" user={{ name: user?.fullName || 'Host', plan: 'Host Account' }} />

      <main className="main-content">

        <header className="home-topbar">
          <nav className="home-topbar-nav">
            {navLinks.map(n => (
              <button
                key={n}
                className={`home-nav-link${activeNav === n ? ' active' : ''}`}
                onClick={() => setActiveNav(n)}
              >
                {n}
              </button>
            ))}
          </nav>
          <div className="home-topbar-right">
            <button className="icon-btn" onClick={() => navigate('/notifications')}>
              <BellIcon />
            </button>
            <img
              src="/profile.png"
              alt="User"
              className="header-avatar"
              onClick={() => navigate('/profile')}
            />
          </div>
        </header>

        <div className="page-inner home-inner">

          <div className="home-greeting-row">
            <div>
              <h1 className="page-heading">
                Welcome back, <span className="highlight">{user?.fullName || 'Host'}</span>
              </h1>
              <p className="page-sub">
                {loading
                  ? 'Loading your events...'
                  : `You have ${upcomingCount} event${upcomingCount === 1 ? '' : 's'} coming up with a total of ${totalConfirmed} guests confirmed.`}
              </p>
            </div>
          </div>

          <div className="home-cta-row">
            <button
              className="cta-card cta-card-primary"
              onClick={() => navigate('/host/create-event')}
            >
              <PlusIcon />
              <div>
                <span className="cta-card-title">Host New Event</span>
                <small className="cta-card-sub">Launch a royal gathering</small>
              </div>
            </button>

            <button
              className="cta-card cta-card-outline"
              onClick={() => navigate('/host/guest-list')}
            >
              <ListIcon />
              <div>
                <span className="cta-card-title">View Events</span>
                <small className="cta-card-sub">Manage your collections</small>
              </div>
            </button>
          </div>

          <div className="section-row">
            <span className="section-label-sm">{activeNav === 'History' ? 'Past Events' : 'Upcoming Events'}</span>
            <button className="view-all-btn">View All Events</button>
          </div>

          {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

          {loading && (
            <p style={{ color: 'var(--text-light)' }}>Loading events...</p>
          )}

          {!loading && events.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>No events yet.</p>
              <button className="btn-primary" onClick={() => navigate('/host/create-event')}>Create Your First Event</button>
            </div>
          )}

          {!loading && events.length > 0 && (
            <div className="events-grid">
              {events.map((e) => {
                const badge = getEventBadge(e);
                const total = e.maxGuests || 0;
                const confirmed = e.confirmedGuests || 0;
                const rsvpPct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

                return (
                  <div
                    key={e.id}
                    className="event-card"
                    onClick={() => navigate('/host/invitation', { state: { eventId: e.id } })}
                  >
                    <div className="event-card-img-wrap">
                      <img src={e.coverUrl || '/host.png'} alt={e.title} className="event-card-img" />
                      <span className={`event-badge ${getBadgeClass(badge)}`}>
                        {badge}
                      </span>
                    </div>
                    <div className="event-card-body">
                      <div className="event-card-date">
                        <CalSmIcon />
                        {formatDate(e.startDate)}
                      </div>
                      <h3 className="event-card-title">{e.title}</h3>

                      {badge === 'History' ? (
                        <div className="event-card-history-tag">
                          {confirmed} / {total} Guests attended
                        </div>
                      ) : (
                        <>
                          <div className="event-card-rsvp-row">
                            <span className="event-card-rsvp-label">RSVP Progress</span>
                            <span className="event-card-rsvp-pct">{rsvpPct}%</span>
                          </div>
                          <div className="progress-bar-wrap">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${rsvpPct}%` }}
                            />
                          </div>
                          <p className="event-card-count">{confirmed} / {total} Guests confirmed</p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function getBadgeClass(type) {
  if (type === 'History')   return 'badge-history';
  if (type === 'Upcoming')  return 'badge-upcoming';
  return 'badge-days';
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v8M8 12h8"/>
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}

function CalSmIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  );
}