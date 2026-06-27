import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './GalleryPage.css';

// ------------------------------------------------------------------
// Static data — replace with API calls when connecting backend
// ------------------------------------------------------------------

const filters = ['All Moments', 'Ceremony', 'Reception', 'Dance Floor', 'Guest Wishes'];

const photos = [
  { src: '/img4.png', type: 'image' },
  { src: '/img2.png', type: 'video' },
  { src: '/img1.png', type: 'image' },
  { src: '/img5.png', type: 'image' },
];

const timelineEvents = [
  {
    time:  '11:00 AM',
    label: 'The Vows',
    img:   '/img5.png',
    active: true,
  },
  {
    time:  '02:30 PM',
    label: 'Heartfelt Voice Notes"',
    note:  '42 new photos added',
    micIcon: true,
    active: false,
  },
  {
    time:  '04:00 PM',
    label: 'Reception Entrance',
    img:   '/img2.png',
    active: false,
  },
];

// ------------------------------------------------------------------

export default function GalleryPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState('All Moments');

  return (
    <div className="app-layout">
      <Sidebar role="guest" user={{ name: 'Amara', plan: 'Host Account' }} />

      <main className="main-content">
        <div className="page-inner gallery-outer">

          {/* Page heading */}
          <div className="gallery-top-row">
            <div>
              <h1 className="gallery-heading">Abike &amp; Tunde's Wedding</h1>
              <p className="gallery-sub">
                Relive the vibrant celebration through shared memories and{' '}
                <span className="gallery-ai-tag">Ai-curated</span> moments.
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="gallery-filters">
            {filters.map(f => (
              <button
                key={f}
                className={`gallery-filter-btn${active === f ? ' active' : ''}`}
                onClick={() => setActive(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Body: photo grid + right panel */}
          <div className="gallery-body">

            {/* Photo grid */}
            <div className="gallery-grid">
              {photos.map((p, i) => (
                <div key={i} className="gallery-item">
                  <img src={p.src} alt={`Memory ${i + 1}`} />
                  {p.type === 'video' && (
                    <span className="gallery-video-badge">VIDEO</span>
                  )}
                  <div className="gallery-item-overlay">
                    <button className="gallery-dl-btn">
                      <DownloadIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right panel */}
            <aside className="gallery-right-panel">

              {/* Event timeline */}
              <div className="gallery-panel-card">
                <div className="gallery-panel-heading">
                  <SparkleIcon /> Event Timeline
                </div>
                <div className="timeline-list">
                  {timelineEvents.map((t, i) => (
                    <div key={i} className={`timeline-item${t.active ? ' active' : ''}`}>
                      <div className="timeline-dot-wrap">
                        <div className={`timeline-dot${t.active ? ' active' : ''}`} />
                        {i < timelineEvents.length - 1 && (
                          <div className="timeline-line" />
                        )}
                      </div>
                      <div className="timeline-content">
                        <span className="timeline-time">{t.time}</span>
                        <p className="timeline-label">
                          {t.micIcon && <MicSmIcon />} {t.label}
                        </p>
                        {t.note && (
                          <span className="timeline-note">{t.note}</span>
                        )}
                        {t.img && (
                          <img
                            src={t.img}
                            alt={t.label}
                            className={`timeline-thumb${t.active ? ' active-border' : ''}`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="gallery-recap-btn">View Full Recap</button>
              </div>

              {/* Print album upsell */}
              <div className="gallery-panel-card gallery-panel-dark">
                <h4 className="gallery-panel-dark-title">Order Print Album</h4>
                <p className="gallery-panel-dark-sub">
                  AI-curated physical memories, delivered in{' '}
                  <span className="gallery-gold-link">premium gold foil</span>.
                </p>
                <button className="gallery-get-started-btn">Get Started</button>
              </div>

              {/* Add memory CTA */}
              <button
                className="gallery-add-memory-btn"
                onClick={() => {}}
              >
                <CameraIcon /> Add Your Memory
              </button>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  );
}

function MicSmIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display:'inline', marginRight: 3 }}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}