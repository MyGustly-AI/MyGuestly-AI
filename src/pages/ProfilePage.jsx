import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

// ------------------------------------------------------------------
// Profile page — matches screenshot with cover image, stats, bio,
// contact info, map, and recent highlights gallery
// ------------------------------------------------------------------

const highlights = [
  { src: '/highlight1.jpg', alt: 'Pink floral tablescape' },
  { src: '/highlight2.jpg', alt: 'Purple lit stage' },
  { src: '/highlight3.jpg', alt: 'Elegant canapés' },
];

export default function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="profile-page">

      {/* Top nav */}
      <header className="profile-topbar">
        <span className="profile-logo">
          My<span className="profile-logo-purple">Guestly</span>{' '}
          <span className="profile-logo-gold">Ai</span>
        </span>
        <nav className="profile-nav">
          <button className="profile-nav-link" onClick={() => navigate('/host/home')}>Home</button>
          <button className="profile-nav-link" onClick={() => navigate('/host/guest-list')}>Guests</button>
          <button className="profile-nav-link" onClick={() => navigate('/host/admin-roles')}>Roles</button>
          <button className="profile-nav-link active">Profile</button>
        </nav>
        <div className="profile-topbar-right">
          <button className="profile-icon-btn" onClick={() => navigate('/notifications')}>
            <BellIcon />
          </button>
          <img src="/profile.png" alt="User" className="profile-topbar-avatar" />
        </div>
      </header>

      <div className="profile-body">

        {/* Cover + avatar + info */}
        <div className="profile-cover-card">
          <div className="profile-cover-img-wrap">
            <img src="/cover-bg.jpg" alt="Cover" className="profile-cover-img" />
          </div>
          <div className="profile-cover-bottom">
            <img src="/profile.png" alt="Amara Okeke" className="profile-main-avatar" />
            <div className="profile-cover-info">
              <h1 className="profile-name-lg">
                Amara Okeke
                <span className="profile-premium-badge">
                  <ShieldSmIcon /> PREMIUM HOST
                </span>
              </h1>
              <p className="profile-member-since">MEMBER SINCE OCT 2021 • LAGOS, NIGERIA</p>
            </div>
            <div className="profile-cover-actions">
              <button className="profile-msg-btn">Message Host</button>
              <button className="profile-share-btn"><ShareIcon /> Share Profile</button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="profile-stats-card">
          <div className="profile-stat">
            <span className="profile-stat-val">42</span>
            <span className="profile-stat-label">Events Hosted</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-val">1.2k</span>
            <span className="profile-stat-label">Memories Captured</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-val">98%</span>
            <span className="profile-stat-label">RSVP Rate</span>
          </div>
        </div>

        {/* Main content row */}
        <div className="profile-content-row">

          {/* Left: bio + highlights */}
          <div className="profile-left">

            {/* Bio card */}
            <div className="profile-card">
              <div className="profile-bio-header">
                <h3 className="profile-bio-title">Crafting Unforgettable Events</h3>
                <span className="profile-quote-mark">99</span>
              </div>
              <p className="profile-bio-text">
                With over a decade of experience in the luxury hospitality sector across Lagos State,
                I specialize in curating high-stakes social events where every detail is a performance.
                My passion lies in the intersection of traditional Nigerian warmth and contemporary
                global prestige. From intimate ministerial dinners to expansive royal weddings, my
                goal is always to create a digital and physical environment where guests feel like
                the center of a celebration.
              </p>
            </div>

            {/* Recent highlights */}
            <div className="profile-card">
              <div className="profile-highlights-header">
                <h3 className="profile-bio-title">Recent Highlights</h3>
                <button className="view-all-btn">VIEW ALL →</button>
              </div>
              <div className="profile-highlights-grid">
                {highlights.map((h, i) => (
                  <div key={i} className="profile-highlight-item">
                    <img src={h.src} alt={h.alt} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: contact + map */}
          <div className="profile-right">

            {/* Contact card */}
            <div className="profile-card">
              <div className="profile-contact-label">HOST CONTACT</div>
              <div className="profile-contact-list">
                <div className="profile-contact-item">
                  <PhoneIcon />
                  <div>
                    <div className="profile-contact-type">PHONE</div>
                    <div className="profile-contact-val">+234 803 000 1234</div>
                  </div>
                </div>
                <div className="profile-contact-item">
                  <PinIcon />
                  <div>
                    <div className="profile-contact-type">BASE LOCATION</div>
                    <div className="profile-contact-val">Victoria Island, Lagos</div>
                  </div>
                </div>
                <div className="profile-contact-item">
                  <GlobeIcon />
                  <div>
                    <div className="profile-contact-type">WEBSITE</div>
                    <div className="profile-contact-val profile-website">amaraokeke.events</div>
                  </div>
                </div>
              </div>
              <div className="profile-social-row">
                <button className="profile-social-btn"><GlobeIcon /></button>
                <button className="profile-social-btn"><CameraIcon /></button>
                <button className="profile-social-btn"><AtIcon /></button>
              </div>
            </div>

            {/* Map card */}
            <div className="profile-map-card">
              <div className="profile-map-placeholder">
                <div className="profile-map-pin-label">
                  <PinIcon /> Lagos, Nigeria
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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

function ShieldSmIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary,#7c3aed)" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 5.95 5.95l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary,#7c3aed)" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary,#7c3aed)" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary,#7c3aed)" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

function AtIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary,#7c3aed)" strokeWidth="2">
      <circle cx="12" cy="12" r="4"/>
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
    </svg>
  );
}