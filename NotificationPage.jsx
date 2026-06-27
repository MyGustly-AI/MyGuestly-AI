import React, { useState } from 'react';
import AppHeader from '../components/AppHeader';
import './NotificationPage.css';

const TABS = ['All', 'Rr VPs', 'Photo Uploads', 'Mentions'];

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'rsvp',
    title: 'New RSVP from Alexander Sterling',
    text: '"Looking forward to the gala! Wouldn\'t miss it for the world. Please note the dietary preference for vegan options."',
    time: '2 mins ago',
    unread: true,
    actions: [
      { label: 'View RSVP', variant: 'primary' },
      { label: 'Reply', variant: 'ghost' },
    ],
  },
  {
    id: 2,
    type: 'photo',
    title: 'Isabella Moore shared 12 new photos',
    text: null,
    time: '45 mins ago',
    unread: false,
    photos: true,
    photoExtra: 10,
    actions: [{ label: 'Open Gallery', variant: 'primary' }],
  },
  {
    id: 3,
    type: 'mention',
    title: 'You were mentioned in a comment',
    text: '@JulianVance: "@You The seating arrangement for the Royal Suite looks perfect! Should we confirm the floral centerpieces?"',
    time: '2 hours ago',
    unread: false,
    actions: [{ label: 'Go to Comment', variant: 'primary' }],
  },
  {
    id: 4,
    type: 'insight',
    title: 'Weekly Event Insight',
    text: 'Your "Grand Winter Gala" event has reached 95% RSVP capacity. Consider opening the waitlist for additional guests.',
    time: 'Yesterday',
    unread: false,
    actions: [{ label: 'View Analytics', variant: 'primary' }],
  },
];

const NAV_ITEMS = [
  {
    key: 'all', label: 'All Notifications',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
  {
    key: 'rsvps', label: 'RSVPs',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    key: 'photos', label: 'Photo Uploads',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  },
  {
    key: 'mentions', label: 'Mentions',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    key: 'settings', label: 'Settings',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

function NotifIcon({ type }) {
  const map = {
    rsvp:    { bg: '#ede9fe', stroke: '#7c3aed', path: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#7c3aed" stroke="none"/> },
    photo:   { bg: '#ede9fe', stroke: '#7c3aed', path: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></> },
    mention: { bg: '#ede9fe', stroke: '#7c3aed', path: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/> },
    insight: { bg: '#ede9fe', stroke: '#7c3aed', path: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/> },
  };
  const { bg, stroke, path } = map[type] || map.insight;
  return (
    <div className="ni-circle" style={{ background: bg }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
        {path}
      </svg>
    </div>
  );
}

export default function NotificationPage() {
  const [activeNav, setActiveNav] = useState('all');
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div className="notif-root">
      {/* ── Left Sidebar ── */}
      <aside className="notif-sidebar">
        {/* Logo */}
        <div className="notif-logo">
          <span className="logo-my">My</span>
          <span className="logo-guestly"> Guestly </span>
          <span className="logo-ai">Ai</span>
        </div>

        <div className="notif-sidebar-heading">Activity Center</div>
        <div className="notif-sidebar-sub">Manage your royal alerts</div>

        <nav className="notif-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`notif-nav-btn ${activeNav === item.key ? 'active' : ''}`}
              onClick={() => setActiveNav(item.key)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="notif-sidebar-footer">
          <button className="notif-help-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Help Support
          </button>
        </div>
      </aside>

      {/* ── Right Side ── */}
      <div className="notif-right">
        {/* Top bar */}
        <header className="notif-topbar">
          <span className="notif-topbar-link">Dashboard</span>
          <div className="notif-topbar-actions">
            <button className="notif-icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            <button className="notif-icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <div className="notif-avatar-sm" />
            <button className="notif-create-btn">Create Event</button>
          </div>
        </header>

        {/* Content */}
        <div className="notif-content">
          <div className="notif-content-header">
            <div>
              <h1 className="notif-title">Notifications</h1>
              <p className="notif-subtitle">Stay updated with your guests and event milestones.</p>
            </div>
            <button className="notif-mark-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Mark all as read
            </button>
          </div>

          {/* Tabs */}
          <div className="notif-tabs">
            {TABS.map(t => (
              <button
                key={t}
                className={`notif-tab ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="notif-list">
            {NOTIFICATIONS.map(n => (
              <div key={n.id} className={`notif-card ${n.unread ? 'unread' : ''}`}>
                <div className="notif-card-row">
                  <NotifIcon type={n.type} />
                  <div className="notif-card-body">
                    <div className="notif-card-title">{n.title}</div>
                    {n.text && <p className="notif-card-text">{n.text}</p>}

                    {n.photos && (
                      <div className="notif-photo-strip">
                        <div className="notif-photo-thumb" style={{ background: 'linear-gradient(135deg,#3b1f5e,#5c2d8a)' }} />
                        <div className="notif-photo-thumb" style={{ background: 'linear-gradient(135deg,#4a2870,#7c3aed)' }} />
                        <div className="notif-photo-more">+{n.photoExtra}</div>
                      </div>
                    )}

                    <div className="notif-actions">
                      {n.actions.map((a, i) =>
                        a.variant === 'primary'
                          ? <button key={i} className="notif-btn-primary">{a.label}</button>
                          : <button key={i} className="notif-btn-ghost">{a.label}</button>
                      )}
                    </div>
                  </div>

                  <div className="notif-card-meta">
                    <span className="notif-time">{n.time}</span>
                    {n.unread && (
                      <span className="notif-unread-tag">
                        <span className="notif-dot" /> UNREAD
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="notif-load-more">
            <button className="notif-load-btn">Load older notifications</button>
          </div>
        </div>
      </div>
    </div>
  );
}