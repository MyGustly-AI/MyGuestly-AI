import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './GuestDashboard.css';

const quickLinks = [
  { label: 'My Events', icon: <CalIcon />, href: '/timeline' },
  { label: 'Find Gallery', icon: <GalIcon />, href: '/gallery' },
  { label: 'View & Edit', icon: <EditIcon />, href: '/profile' },
];

const memories = [
  { img: 'https://placehold.co/120x80/2d0055/D4A017?text=Memory+1' },
  { img: 'https://placehold.co/120x80/1a3a5c/fff?text=Memory+2' },
  { img: 'https://placehold.co/120x80/4a0000/fff?text=Memory+3' },
];

export default function GuestDashboard() {
  const navigate = useNavigate();
  return (
    <div className="app-layout">
      <Sidebar role="guest" user={{ name: 'Tunde', plan: 'Guest' }} />
      <main className="main-content">
        <div className="page-inner guest-dash-outer">

          <div className="guest-dash-top">
            <div>
              <h1 className="page-heading">Welcome to MyGuestly AI, <span className="highlight">Tunde!</span></h1>
              <p className="page-sub">Your ultimate experience in luxury hospitality and impeccable celebrations is ready for you.</p>
            </div>
            <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => navigate('/host/invitation')}>
              View Invitation
            </button>
          </div>

          {/* Event Hero Card */}
          <div className="guest-event-hero">
            <img src="/Guest.png" alt="Abike & Tunde's Wedding" className="guest-hero-img" />
            <div className="guest-hero-overlay">
              <span className="badge badge-gold">FEATURED EVENT</span>
              <h2 className="guest-hero-title">Abike & Tunde's Wedding</h2>
              <div className="guest-hero-meta">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                June 15, 2026 &bull; Eko Hotel & Suites, Lagos
              </div>
            </div>
          </div>

          <div className="guest-dash-cols">
            {/* Quick Access */}
            <div className="guest-dash-main">
              <div className="section-label-sm" style={{ marginBottom: 12 }}>Quick Access</div>
              <div className="guest-quick-links">
                {quickLinks.map((l, i) => (
                  <button key={i} className="guest-quick-btn" onClick={() => navigate(l.href)}>
                    <div className="quick-action-icon">{l.icon}</div>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>

              {/* Shared Memories */}
              <div className="section-label-sm" style={{ margin: '24px 0 12px' }}>Shared Memories</div>
              <div className="shared-memories">
                {memories.map((m, i) => (
                  <div key={i} className="memory-thumb" onClick={() => navigate('/gallery')}>
                    <img src={m.img} alt={`Memory ${i + 1}`} />
                  </div>
                ))}
                <div className="memory-add" onClick={() => navigate('/gallery')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                  <span>Add Photo</span>
                </div>
              </div>
            </div>

            {/* Guest Scorecard */}
            <div className="guest-scorecard card">
              <h3 className="inv-section-title" style={{ marginBottom: 14 }}>AI Guest Scorecard</h3>
              <div className="score-ring-wrap">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8"/>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="8"
                    strokeDasharray="188" strokeDashoffset="47"
                    strokeLinecap="round" transform="rotate(-90 50 50)"/>
                </svg>
                <div className="score-ring-text">
                  <span className="score-val">99</span>
                  <span className="score-label">Score</span>
                </div>
              </div>
              <div className="score-items">
                {[
                  { label: 'RSVP On Time', done: true },
                  { label: 'Picture Upload', done: true },
                  { label: 'Profile Complete', done: false },
                  { label: 'Invite Friends', done: false },
                ].map((s, i) => (
                  <div key={i} className="score-item">
                    <span className={`score-dot ${s.done ? 'done' : ''}`} />
                    <span className={s.done ? 'score-item-done' : ''}>{s.label}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={() => navigate('/profile')}>
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CalIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>; }
function GalIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>; }
function EditIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
