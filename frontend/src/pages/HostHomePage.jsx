import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './HostHomePage.css';

// ------------------------------------------------------------------
// Static data — replace with API calls when connecting backend
// ------------------------------------------------------------------

const events = [
  {
    title:     "Amara & David's Wedding",
    date:      'June 13, 2026',
    rsvp:      82,
    total:     500,
    confirmed: '410 / 500 Guests confirmed',
    type:      'Upcoming',
    img:       '/wedding.jpg',
  },
  {
    title:     'Lagos Tech Summit',
    date:      'July 22, 2026',
    rsvp:      95,
    total:     1000,
    confirmed: '950 / 1000 Guests confirmed',
    type:      'In 31 Days',
    img:       '/tech-summit.jpg',
  },
  {
    title:     'Eko Charity Gala',
    date:      'August 05, 2025',
    rsvp:      100,
    total:     300,
    confirmed: '300 / 300 Guests attended',
    type:      'History',
    img:       '/charity-gala.jpg',
  },
  {
    title:     'CEO 50th Birthday',
    date:      'December 20, 2024',
    rsvp:      null,
    total:     2451,
    confirmed: 'History Gallery',
    type:      null,
    memoriesLabel: 'Memories Captured',
    memoriesCount: '2,451',
    img:       '/birthday.jpg',
  },
  {
    title:     'Heritage Gala Night',
    date:      'September 12, 2024',
    rsvp:      75,
    total:     400,
    confirmed: '300 / 400 guests confirmed',
    type:      'Upcoming',
    img:       '/heritage-gala.jpg',
  },
  {
    title:     'Tech Innovators Summit',
    date:      'October 5, 2024',
    rsvp:      40,
    total:     500,
    confirmed: '200 / 500 guests confirmed',
    type:      'Upcoming',
    img:       '/innovators.jpg',
  },
];

// ------------------------------------------------------------------

export default function HostHomePage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('Home');

  const navLinks = ['Home', 'Explore', 'History'];

  return (
    <div className="app-layout">
      <Sidebar role="host" user={{ name: 'Amara', plan: 'Host Account' }} />

      <main className="main-content">

        {/* Top nav bar */}
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

          {/* Greeting */}
          <div className="home-greeting-row">
            <div>
              <h1 className="page-heading">
                Welcome back, <span className="highlight">Amara Okeke</span>
              </h1>
              <p className="page-sub">
                Your royal dashboard is ready. You have 3 events coming up this month with a total of 1,240 guests confirmed.
              </p>
            </div>
          </div>

          {/* CTA cards */}
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

          {/* Events grid */}
          <div className="section-row">
            <span className="section-label-sm">Upcoming Events</span>
            <button className="view-all-btn">View All Events</button>
          </div>

          <div className="events-grid">
            {events.map((e, i) => (
              <div
                key={i}
                className="event-card"
                onClick={() => navigate('/host/invitation')}
              >
                <div className="event-card-img-wrap">
                  <img src={e.img} alt={e.title} className="event-card-img" />
                  {e.type && (
                    <span className={`event-badge ${getBadgeClass(e.type)}`}>
                      {e.type}
                    </span>
                  )}
                </div>
                <div className="event-card-body">
                  <div className="event-card-date">
                    <CalSmIcon />
                    {e.date}
                  </div>
                  <h3 className="event-card-title">{e.title}</h3>

                  {e.memoriesLabel ? (
                    <>
                      <div className="event-card-memories-row">
                        <span className="event-card-memories-label">{e.memoriesLabel}</span>
                        <span className="event-card-memories-count">{e.memoriesCount}</span>
                      </div>
                      <div className="event-card-history-tag">{e.confirmed}</div>
                    </>
                  ) : e.rsvp !== null ? (
                    <>
                      <div className="event-card-rsvp-row">
                        <span className="event-card-rsvp-label">RSVP Progress</span>
                        <span className="event-card-rsvp-pct">{e.rsvp}%</span>
                      </div>
                      <div className="progress-bar-wrap">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${e.rsvp}%` }}
                        />
                      </div>
                      <p className="event-card-count">{e.confirmed}</p>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
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

// ── Icons ──────────────────────────────────────────────────────────

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