import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './HostDashboard.css';

// ------------------------------------------------------------------
// Static data — swap these out for API calls when you add a backend
// ------------------------------------------------------------------

const stats = [
  { label: 'TOTAL EVENTS',    value: '24',    badge: '+12%', badgeType: 'up' },
  { label: 'TOTAL RSVPS',     value: '1,482', badge: '+5%',  badgeType: 'up' },
  { label: 'PENDING INVITES', value: '86',    badge: 'High',  badgeType: 'warn' },
  { label: 'CHECKED-IN',      value: '312',   badge: 'Stable',badgeType: 'ok'  },
];

const quickActions = [
  {
    label: 'Create New Event',
    desc:  'Set up a new celebration in minutes',
    icon:  <PlusIcon />,
    href:  '/host/create-event',
  },
  {
    label: 'Scan QR Code',
    desc:  'Instantly check-in arriving guests',
    icon:  <QRIcon />,
    href:  '/scan-qr',
  },
  {
    label: 'View Gallery',
    desc:  'Review AI-curated memories',
    icon:  <GalleryIcon />,
    href:  '/gallery',
  },
];

const activities = [
  {
    name:     'Bolaji Ogundele',
    action:   'confirmed RSVP',
    event:    "Amara & David's Wedding",
    time:     '2 mins ago',
    type:     'rsvp',
    badge:    'Attending',
  },
  {
    name:     'Kemi Adeyemi',
    action:   'checked in',
    event:    'Corporate AI Summit',
    time:     '15 mins ago',
    type:     'checkin',
    timeOnly: '10:42 AM',
  },
  {
    name:   '12 new memories uploaded',
    action: '',
    event:  "Amara & David's Wedding",
    time:   '1 hour ago',
    type:   'gallery',
    extra:  '+10',
  },
];

const TABS = ['All', 'RSVPs', 'Check-ins'];

// ------------------------------------------------------------------

export default function HostDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activities.filter(a => {
    if (activeTab === 'RSVPs')     return a.type === 'rsvp';
    if (activeTab === 'Check-ins') return a.type === 'checkin';
    return true;
  });

  return (
    <div className="app-layout">
      <Sidebar role="host" user={{ name: 'Amara', plan: 'Host Account' }} />

      <main className="main-content">
        <div className="dashboard-inner">

          {/* ── Greeting ── */}
          <div className="dashboard-greeting">
            <div className="greeting-center">
              <h1 className="dashboard-heading">
                Welcome back, <span className="highlight">Amara!</span>
              </h1>
              <p className="dashboard-sub">You have 2 events active this week.</p>
            </div>
            <div className="dashboard-header-icons">
              <button className="icon-btn" onClick={() => navigate('/notifications')}>
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

          {/* ── Stats row ── */}
          <div className="stats-row">
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-card-label">{s.label}</span>
                  <span className={`stat-badge stat-badge--${s.badgeType}`}>{s.badge}</span>
                </div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-rule" />
              </div>
            ))}
          </div>

          {/* ── Body ── */}
          <div className="dashboard-cols">

            {/* LEFT column */}
            <div className="dashboard-col-main">

              <div className="section-row">
                <span className="section-label-sm">Active Events</span>
                <button className="view-all-btn" onClick={() => navigate('/host/home')}>
                  View All →
                </button>
              </div>

              {/* Featured event card */}
              <div className="active-event-card">
                <img
                  src="/host.png"
                  alt="Amara & David's Wedding"
                  className="active-event-img"
                />
                <div className="active-event-overlay">
                  <span className="badge-starting">Starting in 4 Days</span>
                  <div className="active-event-bottom">
                    <div>
                      <h3 className="active-event-title">Amara &amp; David's Wedding</h3>
                      <div className="active-event-meta">
                        <span className="meta-group">
                          <span className="meta-label">RSVPS</span>
                          <span className="meta-val">248 / 300</span>
                        </span>
                        <span className="meta-group">
                          <span className="meta-label">PHOTOS</span>
                          <span className="meta-val">142</span>
                        </span>
                      </div>
                    </div>
                    <div className="response-pill">
                      <span className="response-pct">96%</span>
                      <span className="response-lbl">Response Rate</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent activity */}
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
                      {a.badge    && <span className="badge-attending">{a.badge}</span>}
                      {a.timeOnly && <span className="activity-time-only">{a.timeOnly}</span>}
                      {a.extra    && (
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

            {/* RIGHT column */}
            <div className="dashboard-col-side">
              <div className="section-label-sm" style={{ marginBottom: 14 }}>Quick Actions</div>
              <div className="quick-actions">
                {quickActions.map((q, i) => (
                  <button
                    key={i}
                    className="quick-action-btn"
                    onClick={() => navigate(q.href)}
                  >
                    <div className="quick-action-icon">{q.icon}</div>
                    <div>
                      <div className="quick-action-label">{q.label}</div>
                      <div className="quick-action-desc">{q.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="upgrade-banner">
                <div className="upgrade-title">Upgrade to Diamond</div>
                <p className="upgrade-desc">
                  Get unlimited AI storage and premium 4K memory reels for your events.
                </p>
                <button className="upgrade-link-btn">Explore Plans →</button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────

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