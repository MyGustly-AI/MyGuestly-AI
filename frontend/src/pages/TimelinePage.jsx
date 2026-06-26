// src/pages/TimelinePage.jsx - Fixed Live Voice Notes
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import './TimelinePage.css';

export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState('voicenotes');
  const [playingVoiceNote, setPlayingVoiceNote] = useState(null);

  const voiceNotes = [
    {
      id: 1,
      title: "Bridal Morning Reflection",
      description: "Laughter, joy, and the beginning of a beautiful journey",
      time: "11:00 AM",
      duration: "3:45",
      author: "Bride's Sister",
      isLive: true
    },
    {
      id: 2,
      title: "The Town Crier's Speech",
      description: "The abridged version of the morning reflection and modern love",
      time: "12:30 PM",
      duration: "5:20",
      author: "Family Elder",
      isLive: false
    },
    {
      id: 3,
      title: "Best Man's Toast",
      description: "Heartfelt words from the best man",
      time: "2:15 PM",
      duration: "2:30",
      author: "Best Man",
      isLive: false
    }
  ];

  const toggleVoiceNote = (id) => {
    setPlayingVoiceNote(playingVoiceNote === id ? null : id);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-inner" style={{ paddingTop: '70px' }}> {/* Extra padding for mobile menu */}
          <div className="timeline-container">
            <div className="timeline-header">
              <h1 className="timeline-title">Abike & Tunde's Wedding</h1>
              <p className="timeline-date">June 13, 2026</p>
            </div>

            <div className="timeline-tabs">
              <button 
                className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                AI Timeline
              </button>
              <button 
                className={`tab-btn ${activeTab === 'uploads' ? 'active' : ''}`}
                onClick={() => setActiveTab('uploads')}
              >
                Guest Uploads
              </button>
              <button 
                className={`tab-btn ${activeTab === 'voicenotes' ? 'active' : ''}`}
                onClick={() => setActiveTab('voicenotes')}
              >
                💝 Voice Notes
              </button>
            </div>

            {activeTab === 'voicenotes' && (
              <div className="voicenotes-section">
                <div className="voicenotes-header">
                  <h2>Heartfelt Voice Notes</h2>
                  <span className="live-badge">🔴 Live</span>
                </div>
                <p className="voicenotes-sub">Voice notes compilations from loved ones</p>

                <div className="voicenotes-list">
                  {voiceNotes.map((note) => (
                    <div key={note.id} className="voicenote-card">
                      <div className="voicenote-info">
                        <div className="voicenote-title-row">
                          <h3 className="voicenote-title">{note.title}</h3>
                          {note.isLive && <span className="live-dot">● Live</span>}
                        </div>
                        <p className="voicenote-description">{note.description}</p>
                        <div className="voicenote-meta">
                          <span className="voicenote-time">🕐 {note.time}</span>
                          <span className="voicenote-author">👤 {note.author}</span>
                        </div>
                      </div>
                      <div className="voicenote-controls">
                        <button 
                          className={`play-btn ${playingVoiceNote === note.id ? 'playing' : ''}`}
                          onClick={() => toggleVoiceNote(note.id)}
                        >
                          {playingVoiceNote === note.id ? '⏹' : '▶'}
                        </button>
                        <span className="voicenote-duration">{note.duration}</span>
                        <div className="voicenote-waveform">
                          <div className="waveform-bars">
                            {[...Array(16)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`waveform-bar ${playingVoiceNote === note.id ? 'active' : ''}`}
                                style={{ 
                                  height: `${Math.random() * 15 + 5}px`,
                                  animationDelay: `${i * 0.1}s`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="timeline-section">
                <div className="timeline-line">
                  <div className="timeline-event">
                    <div className="timeline-marker">
                      <span className="timeline-dot"></span>
                    </div>
                    <div className="timeline-content">
                      <span className="timeline-event-time">11:00 AM</span>
                      <h3 className="timeline-event-title">The Town Crier's Arrival</h3>
                      <p className="timeline-event-desc">The abridged version of the morning reflection and modern love.</p>
                      <span className="timeline-event-type ceremony">Ceremony</span>
                    </div>
                  </div>
                  <div className="timeline-event">
                    <div className="timeline-marker">
                      <span className="timeline-dot"></span>
                    </div>
                    <div className="timeline-content">
                      <span className="timeline-event-time">12:30 PM</span>
                      <h3 className="timeline-event-title">Traditional Greetings</h3>
                      <p className="timeline-event-desc">Elders blessing the couple with traditional prayers.</p>
                      <span className="timeline-event-type tradition">Tradition</span>
                    </div>
                  </div>
                  <div className="timeline-event">
                    <div className="timeline-marker">
                      <span className="timeline-dot"></span>
                    </div>
                    <div className="timeline-content">
                      <span className="timeline-event-time">2:15 PM</span>
                      <h3 className="timeline-event-title">Feast Begins</h3>
                      <p className="timeline-event-desc">Guests enjoying the sumptuous meal and entertainment.</p>
                      <span className="timeline-event-type feast">Feast</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'uploads' && (
              <div className="uploads-section">
                <div className="empty-uploads">
                  <span className="empty-uploads-icon">📤</span>
                  <h3>No guest uploads yet</h3>
                  <p>Share your photos and videos from the celebration</p>
                  <button className="btn-primary">Upload Your Memory</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
    }
