import React, { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import { listEventsRequest } from '../api/events';
import { listMediaRequest } from '../api/media';
import './TimelinePage.css';

export default function TimelinePage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [activeTab, setActiveTab] = useState('ai');

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events list on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await listEventsRequest();
        const eventList = data?.data || data || [];
        setEvents(eventList);
        if (eventList.length > 0) {
          setSelectedEventId(eventList[0].id);
        }
      } catch (err) {
        setError(err.message || 'Could not load events.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch event media list when selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) return;

    (async () => {
      setLoading(true);
      try {
        const result = await listMediaRequest(selectedEventId);
        const list = result?.records || result?.data?.records || result || [];
        setMediaList(list);
      } catch (err) {
        setError(err.message || 'Could not load timeline media.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedEventId]);

  const formatTime = (dateString) => {
    if (!dateString) return '12:00 PM';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Static/fallback milestones so the timeline is never empty
  const milestones = [
    {
      time: '08:00 AM',
      title: 'Bridal Prep',
      description: 'Morning reflections and final touches of elegance. Laughter, legacy, and silk.',
      side: 'right',
      image: '/Margin.png',
    },
    {
      time: '11:00 AM',
      title: 'The Vows',
      description: 'The sacred exchange in the Chapel of Light. A moment of pure connection, witnessed by loved ones.',
      side: 'left',
      image: '/vow.png',
    },
    {
      time: '02:00 PM',
      title: 'Cocktail Hour',
      description: 'Signature spirits and artisanal bites on the Terrace. Guests mingle amidst beautiful gardenias.',
      side: 'right',
      image: '/ch.png',
    },
    {
      time: '04:00 PM',
      title: 'Reception Entrance',
      description: 'The grand reveal of the newlyweds. A celebration of heritage and modern love.',
      side: 'left',
      image: '/Ai.png',
    }
  ];

  return (
    <div className="timeline-page">
      <header>
        <AppHeader
          links={[
            { label: 'Timeline', href: '/timeline' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'RSVP', href: '/host/guest-list' },
            { label: 'Help', href: '#' },
          ]}
          active="Timeline"
        />
      </header>

      {/* ── HERO ── */}
      <section className="timeline-hero">
        <img
          src={selectedEvent?.coverUrl || '/tunde.png'}
          alt={selectedEvent?.title || "Abike & Tunde's wedding"}
          className="timeline-hero-img"
        />
        <div className="timeline-hero-overlay">
          <div className="timeline-hero-content">
            <p className="timeline-hero-subtitle">Honoring the celebration of</p>
            <h1 className="timeline-hero-title">
              {selectedEvent ? selectedEvent.title : 'Abike & Tunde'}
            </h1>
            <p className="timeline-hero-date">
              {selectedEvent ? new Date(selectedEvent.startDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : 'June 13, 2026'}
            </p>
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
        
        {events.length > 1 && (
          <select
            className="input-field"
            style={{ width: 220, fontSize: 12, height: 32, padding: '0 8px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((e) => (
              <option key={e.id} value={e.id} style={{ background: '#1c1917', color: '#fff' }}>
                {e.title}
              </option>
            ))}
          </select>
        )}
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
        <div className="timeline-voice-waveform">
          {[6,10,16,12,20,14,24,18,12,16,22,14,10,18,12,8,16,20,14,10].map((h, i) => (
            <span key={i} className="timeline-waveform-bar" style={{ height: h + 'px' }} />
          ))}
        </div>
        <div className="timeline-voice-player">
          <span className="timeline-voice-label">Compilations Synced</span>
          <span className="timeline-voice-duration">Live Feed</span>
        </div>
      </div>

      {error && <div className="auth-error" style={{ margin: '16px auto', maxWidth: 800 }}>{error}</div>}

      {/* ── TIMELINE ── */}
      <section className="timeline-section">
        <div className="timeline-inner">
          <div className="timeline-line" />

          {/* Render real live uploads first (if tab is Guest Uploads or if they exist) */}
          {activeTab === 'guest' && mediaList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)', position: 'relative', zIndex: 5 }}>
              No guest uploads found yet. Visit the Gallery to upload files!
            </div>
          ) : (
            mediaList.map((m, i) => {
              const side = i % 2 === 0 ? 'right' : 'left';
              return (
                <div key={m.id || i} className={`timeline-item ${side}`}>
                  <div className="timeline-left-cell">
                    {side === 'right' ? (
                      <>
                        <div className="timeline-time-badge">{formatTime(m.createdAt)}</div>
                        <h3 className="timeline-item-title">{m.caption || 'Shared Moment'}</h3>
                        <p className="timeline-item-desc">Uploaded by guest contributor.</p>
                      </>
                    ) : (
                      <div className="timeline-img-single">
                        <img src={m.url} alt="Guest Upload" style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }} />
                      </div>
                    )}
                  </div>
                  <div className="timeline-dot" />
                  <div className="timeline-right-cell">
                    {side === 'right' ? (
                      <div className="timeline-img-single">
                        <img src={m.url} alt="Guest Upload" style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }} />
                      </div>
                    ) : (
                      <>
                        <div className="timeline-time-badge">{formatTime(m.createdAt)}</div>
                        <h3 className="timeline-item-title">{m.caption || 'Shared Moment'}</h3>
                        <p className="timeline-item-desc">Uploaded by guest contributor.</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Fallback to render core milestones for the AI Timeline view */}
          {activeTab === 'ai' && (
            milestones.map((m, i) => (
              <div key={i} className={`timeline-item ${m.side}`}>
                <div className="timeline-left-cell">
                  {m.side === 'right' ? (
                    <>
                      <div className="timeline-time-badge">{m.time}</div>
                      <h3 className="timeline-item-title">{m.title}</h3>
                      <p className="timeline-item-desc">{m.description}</p>
                    </>
                  ) : (
                    <div className="timeline-img-single">
                      <img src={m.image} alt={m.title} style={{ borderRadius: '12px' }} />
                    </div>
                  )}
                </div>
                <div className="timeline-dot" />
                <div className="timeline-right-cell">
                  {m.side === 'right' ? (
                    <div className="timeline-img-single">
                      <img src={m.image} alt={m.title} style={{ borderRadius: '12px' }} />
                    </div>
                  ) : (
                    <>
                      <div className="timeline-time-badge">{m.time}</div>
                      <h3 className="timeline-item-title">{m.title}</h3>
                      <p className="timeline-item-desc">{m.description}</p>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}