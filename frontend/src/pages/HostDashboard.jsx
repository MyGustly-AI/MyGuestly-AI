import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { listEventsRequest } from '../api/events';
import { listGuestsRequest } from '../api/guests';
import { useAuth } from '../context/AuthContext';
import './HostDashboard.css';

// TEMP: Recent Activity has no backend route yet (no activity/feed endpoint exists
// in the backend as of this build). Replace this with a real feed once the
// teammate adds an activity log route. Remove this block entirely if you'd
// rather not show fake data in the meantime.
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
  const [activeTab, setActiveTab] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pendingInvites, setPendingInvites] = useState(null);
  const [checkedInCount, setCheckedInCount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await listEventsRequest({ limit: 5 });
        const list = result?.data ?? result?.events ?? result ?? [];
        setEvents(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.message || 'Could not load events.');
      } finally {
        setLoading(false);
      }
    })();
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
    {
      label: 'PENDING INVITES',
      value: statsLoading ? '...' : pendingInvites === null ? '—' : String(pendingInvites),
      badge: '',
      badgeType: 'warn',
    },
    {
      label: 'CHECKED-IN',
      value: statsLoading ? '...' : checkedInCount === null ? '—' : String(checkedInCount),
      badge: '',
      badgeType: 'ok',
    },
  ];

  const filtered = activities.filter(a => {
    if (activeTab === 'RSVPs') return a.type === 'rsvp';
    if (activeTab === 'Check-ins') return a.type === 'checkin';
    return true;
  });

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
                src={user?.avatarUrl || user?.coverUrl || '/profile.png'}
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
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-rule" />
              </div>
            ))}
          </div>

          <div className="dashboard-cols">

            <div className="dashboard-col-main">

              <div className="section-row">
                <span className="section-label-sm">Active Events</span>
                <button className="view-all-btn" onClick={() => navigate('/host/home')}>
                  View All →
                </button>
              </div>

              {loading && (
                <div className="active-event-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading events...
                </div>
              )}

              {!loading && !featuredEvent && (
                <div className="active-event-card" style={{ padding: 32, textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>You haven't created any events yet.</p>
                  <button className="btn-primary" onClick={() => navigate('/host/create-event')}>Create Your First Event</button>
                </div>
              )}

              {!loading && featuredEvent && (
                <div
                  className="active-event-card"
                  onClick={() => navigate('/host/invitation', { state: { eventId: featuredEvent.id } })}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={featuredEvent.coverUrl || '/host.png'}
                    alt={featuredEvent.title}
                    className="active-event-img"
                  />
                  <div className="active-event-overlay">
                    <span className="badge-starting">{featuredEvent.status || 'Draft'}</span>
                    <div className="active-event-bottom">
                      <div>
                        <h3 className="active-event-title">{featuredEvent.title}</h3>
                        <div className="active-event-meta">
                          <span className="meta-group">
                            <span className="meta-label">RSVPS</span>
                            <span className="meta-val">{featuredEvent.confirmedGuests || 0} / {featuredEvent.maxGuests}</span>
                          </span>
                          <span className="meta-group">
                            <span className="meta-label">VENUE</span>
                            <span className="meta-val">{featuredEvent.venueName}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="section-row" style={{ marginTop: 28 }}>
                <span className="section-label-sm">Recent Activity</span>
                <div className="activity-tabs">
                  {TABS.map(t => (
                    <button
                      key={t}
                      className={`activity-tab${activeTab === t ? ' activity-tab--active' : ''}`}
                      onClick={() => setActiveTab(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="activity-list">
                {filtered.map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className={`activity-avatar-wrap activity-avatar--${a.type}`}>
                      <ActivityIcon type={a.type} />
                    </div>
                    <div className="activity-text">
                      <div className="activity-name">
                        {a.name}{a.action ? ` ${a.action}` : ''}
                      </div>
                      <div className="activity-meta">{a.event} · {a.time}</div>
                    </div>
                    <div className="activity-right">
                      {a.badge && <span className="badge-attending">{a.badge}</span>}
                      {a.timeOnly && <span className="activity-time-only">{a.timeOnly}</span>}
                      {a.extra && (
                        <div className="gallery-chips">
                          <span className="gallery-dot" />
                          <span className="gallery-dot" />
                          <span className="gallery-extra">{a.extra}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button className="view-full-log-btn">View Full Activity Log</button>
            </div>

            <div className="dashboard-col-side">
              <div className="section-label-sm" style={{ marginBottom: 14 }}>Quick Actions</div>
              <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => navigate('/host/create-event')}>
                  <div className="quick-action-icon"><PlusIcon /></div>
                  <div>
                    <div className="quick-action-label">Create New Event</div>
                    <div className="quick-action-desc">Set up a new celebration in minutes</div>
                  </div>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/scan-qr')}>
                  <div className="quick-action-icon"><QRIcon /></div>
                  <div>
                    <div className="quick-action-label">Scan QR Code</div>
                    <div className="quick-action-desc">Instantly check-in arriving guests</div>
                  </div>
                </button>
                <button className="quick-action-btn" onClick={() => navigate('/gallery')}>
                  <div className="quick-action-icon"><GalleryIcon /></div>
                  <div>
                    <div className="quick-action-label">View Gallery</div>
                    <div className="quick-action-desc">Review AI-curated memories</div>
                  </div>
                </button>
              </div>

              <div className="upgrade-banner">
                <div className="upgrade-title">Upgrade to Diamond</div>
                <p className="upgrade-desc">
                  Get unlimited AI storage and premium 4K memory reels for your events.
                </p>
                <button className="upgrade-link-btn" onClick={() => navigate('/pricing')}>Explore Plans →</button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function ActivityIcon({ type }) {
  if (type === 'rsvp') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    );
  }
  if (type === 'checkin') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v8M8 12h8"/>
    </svg>
  );
}

function QRIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>
  );
}