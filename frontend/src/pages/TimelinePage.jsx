import React, { useState } from 'react';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import './TimelinePage.css';

export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState('ai');

  return (
    <div className="timeline-page">
      <header>
        <AppHeader
          links={[
            { label: 'My Guestly AI', href: '/' },
            { label: 'Home', href: '/guest/dashboard' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'RSVP', href: '/host/guest-list' },
            { label: 'Help', href: '#' },
          ]}
          active="Timeline"
        />
      </header>

      {/* ── HERO ── */}
      <section className="timeline-hero">
        <img src="/tunde.png" alt="Abike & Tunde's wedding" className="timeline-hero-img" />
        <div className="timeline-hero-overlay">
          <div className="timeline-hero-content">
            <p className="timeline-hero-subtitle">Honoring the union of</p>
            <h1 className="timeline-hero-title">Abike &amp; Tunde</h1>
            <p className="timeline-hero-date">June 13, 2026</p>
          </div>
        </div>
      </section>

      {/* ── TABS ── */}
      <div className="timeline-tabs-bar">
        <div className="timeline-tabs-left">
          <button
            className={`timeline-tab${activeTab === 'ai' ? ' active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            AI Timeline
          </button>
          <button
            className={`timeline-tab${activeTab === 'guest' ? ' active' : ''}`}
            onClick={() => setActiveTab('guest')}
          >
            Guest Uploads
          </button>
        </div>
        <div className="timeline-custom-view">
          <i className="ti ti-layout-list" />
          Custom View
        </div>
      </div>

      {/* ── VOICE NOTE BAR ── */}
      <div className="timeline-voice-bar">
        <div className="timeline-voice-info">
          <div className="timeline-voice-title">
            <i className="ti ti-microphone" />
            Heartfelt Voice Notes
            <span className="timeline-voice-title-dot" />
          </div>
          <div className="timeline-voice-desc">Voice notes compilations from the loved ones of the couple</div>
        </div>
        <div className="timeline-voice-player">
          <button className="timeline-play-btn" aria-label="Play voice notes">
            <i className="ti ti-player-play" />
          </button>
          <span className="timeline-voice-label">Voice Note Compilations</span>
          <span className="timeline-voice-duration">5:45</span>
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <section className="timeline-section">
        <div className="timeline-inner">
          <div className="timeline-line" />

          {/* ── ITEM 1: BRIDAL PREP (right = text left, image right) ── */}
          <div className="timeline-item right">
            <div className="timeline-left-cell">
              <div className="timeline-time-badge">08:00 AM</div>
              <h3 className="timeline-item-title">Bridal Prep</h3>
              <p className="timeline-item-desc">
                Morning reflections and the final touches of elegance at the Grand Suite. A morning of laughter, legacy, and silk.
              </p>
            </div>
            <div className="timeline-dot" />
            <div className="timeline-right-cell">
              <div className="timeline-img-grid-2">
                <img src="/Margin.png" alt="Bridal prep 1" />
                <img src="/Sign-up.png" alt="Bridal prep 2" />
              </div>
              <div className="timeline-voice-mini">
                <i className="ti ti-microphone" />
                Abike's Morning Vow
                <span className="timeline-voice-mini-time">0:45</span>
              </div>
            </div>
          </div>

          {/* ── ITEM 2: THE VOWS (left = image left, text right) ── */}
          <div className="timeline-item left">
            <div className="timeline-left-cell">
              <div className="timeline-img-single">
                <img src="/vow.png" alt="The Vows ceremony" />
              </div>
            </div>
            <div className="timeline-dot" />
            <div className="timeline-right-cell">
              <div className="timeline-time-badge">11:00 AM</div>
              <h3 className="timeline-item-title">The Vows</h3>
              <p className="timeline-item-desc">
                The sacred exchange in the Chapel of Light. A moment of pure connection, witnessed by those who matter most.
              </p>
            </div>
          </div>

          {/* ── ITEM 3: COCKTAIL HOUR (right = text left, images right) ── */}
          <div className="timeline-item right">
            <div className="timeline-left-cell">
              <div className="timeline-time-badge">02:00 PM</div>
              <h3 className="timeline-item-title">Cocktail Hour</h3>
              <p className="timeline-item-desc">
                Signature spirits and artisanal bites on the North Terrace. Guests mingle amidst the scent of gardenias.
              </p>
            </div>
            <div className="timeline-dot" />
            <div className="timeline-right-cell">
              <div className="timeline-img-grid-3">
                <div className="img-main">
                  <img src="/ch.png" alt="Cocktails" />
                </div>
                <div className="img-top-right">
                  <img src="/img1.png" alt="Food bites" />
                </div>
                <div className="img-bottom-right">
                  <div className="timeline-upload-count" style={{ width: '100%' }}>
                    <div className="timeline-upload-count-num">120+</div>
                    <div className="timeline-upload-count-label">Uploads</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── ITEM 4: RECEPTION ENTRANCE (left = AI card left, text right) ── */}
          <div className="timeline-item left">
            <div className="timeline-left-cell">
              <div className="ai-highlight-card">
                <div className="ai-highlight-header">
                  <div className="ai-highlight-icon">
                    <i className="ti ti-sparkles" />
                  </div>
                  <div className="ai-highlight-text">
                    <div className="ai-label">AI Highlight</div>
                    <div className="ai-sub">Captured from 12 guest angles</div>
                  </div>
                </div>
                <img src="/Ai.png" alt="Reception entrance AI highlight" />
              </div>
            </div>
            <div className="timeline-dot" />
            <div className="timeline-right-cell">
              <div className="timeline-time-badge">04:00 PM</div>
              <h3 className="timeline-item-title">Reception Entrance</h3>
              <p className="timeline-item-desc">
                The grand reveal of the newlyweds. A celebration of heritage and modern love as the party truly begins.
              </p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}