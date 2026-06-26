// src/pages/TimelinePage.jsx
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import './TimelinePage.css';

export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState('timeline');
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

  const timelineEvents = [
    {
      id: 1,
      time: "11:00 AM",
      title: "The Town Crier's Arrival",
      description: "The abridged version of the morning reflection and modern love.",
      type: "ceremony"
    },
    {
      id: 2,
      time: "12:30 PM",
      title: "Traditional Greetings",
      description: "Elders blessing the couple with traditional prayers.",
      type: "tradition"
    },
    {
      id: 3,
      time: "2:15 PM",
      title: "Feast Begins",
      description: "Guests enjoying the sumptuous meal and entertainment.",
      type: "feast"
    }
  ];

  const toggleVoiceNote = (id) => {
    setPlayingVoiceNote(playingVoiceNote === id ? null : id);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-inner">
          <div className="timeline-container">
            {/* Header */}
            <div className="timeline-header">
              <h1 className="timeline-title">Abike & Tunde's Wedding</h1>
              <p className="timeline-date">June 13, 2026</p>
            </div>

            {/* Tabs */}
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
                Heartfelt Voice Notes
              </button>
            </div>

            {/* Voice Notes Section */}
            {activeTab === 'voicenotes' && (
              <div className="voicenotes-section">
                <div className="voicenotes-header">
                  <h2>Voice Notes Compilations from Loved Ones</h2>
                  <span className="live-badge">🔴 Live</span>
                </div>
                <p className="voicenotes-sub">
                  Compilations Synced
                </p>

                <div className="voicenotes-list">
                  {voiceNotes.map((note) => (
                    <div key={note.id} className="voicenote-card">
                      <div className="voicenote-info">
                        <h3 className="voicenote-title">{note.title}</h3>
                        <p className="voicenote-description">{note.description}</p>
                        <div className="voicenote-meta">
                          <span className="voicenote-time">{note.time}</span>
                          <span className="voicenote-author">• {note.author}</span>
                          {note.isLive && (
                            <span className="live-indicator">● Live</span>
                          )}
                        </div>
                      </div>
                      <div className="voicenote-controls">
                        <button 
                          className={`play-btn ${playingVoiceNote === note.id ? 'playing' : ''}`}
                          onClick={() => toggleVoiceNote(note.id)}
                        >
                          {playingVoiceNote === note.id ? '⏸️' : '▶️'}
                        </button>
                        <span className="voicenote-duration">{note.duration}</span>
                        <div className="voicenote-waveform">
                          <div className="waveform-bars">
                            {[...Array(20)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`waveform-bar ${playingVoiceNote === note.id ? 'active' : ''}`}
                                style={{ 
                                  height: `${Math.random() * 20 + 5}px`,
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

            {/* AI Timeline Section */}
            {activeTab === 'timeline' && (
              <div className="timeline-section">
                <div className="timeline-line">
                  {timelineEvents.map((event, index) => (
                    <div key={event.id} className="timeline-event">
                      <div className="timeline-marker">
                        <span className="timeline-dot"></span>
                        {index < timelineEvents.length - 1 && (
                          <span className="timeline-connector"></span>
                        )}
                      </div>
                      <div className="timeline-content">
                        <span className="timeline-event-time">{event.time}</span>
                        <h3 className="timeline-event-title">{event.title}</h3>
                        <p className="timeline-event-desc">{event.description}</p>
                        <span className={`timeline-event-type ${event.type}`}>
                          {event.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guest Uploads Section */}
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
