// src/pages/EventsHistoryPage.jsx
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import './EventsHistoryPage.css';

export default function EventsHistoryPage() {
  const [filter, setFilter] = useState('all');
  
  const events = [
    {
      id: 1,
      title: "Eko Charity Gala",
      date: "August 05, 2025",
      rsvpProgress: 100,
      confirmed: 300,
      total: 300,
      status: "completed",
      memories: 2451
    },
    {
      id: 2,
      title: "CEO 50th Birthday",
      date: "December 20, 2024",
      rsvpProgress: 100,
      confirmed: 2451,
      total: 2451,
      status: "completed",
      memories: 2451
    },
    {
      id: 3,
      title: "Heritage Gala Night",
      date: "September 12, 2024",
      rsvpProgress: 75,
      confirmed: 300,
      total: 400,
      status: "completed"
    },
    {
      id: 4,
      title: "Tech Innovators Summit",
      date: "October 5, 2024",
      rsvpProgress: 40,
      confirmed: 200,
      total: 500,
      status: "upcoming"
    }
  ];

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'var(--success)';
    if (progress >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-inner">
          <div className="events-history-container">
            <div className="page-header">
              <h1>Event History</h1>
              <p className="page-subtitle">View all your past events and their performance</p>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Events
              </button>
              <button 
                className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
              <button 
                className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </button>
            </div>

            {/* Events List - Fixed Overlapping */}
            <div className="events-list">
              {events.map(event => (
                <div key={event.id} className="event-history-card">
                  <div className="event-history-header">
                    <div className="event-title-section">
                      <h3 className="event-history-title">{event.title}</h3>
                      <span className={`event-status ${event.status}`}>
                        {event.status === 'completed' ? '✅ Completed' : '⏳ Upcoming'}
                      </span>
                    </div>
                    <p className="event-history-date">📅 {event.date}</p>
                  </div>

                  <div className="event-history-body">
                    <div className="rsvp-section">
                      <div className="rsvp-header">
                        <span>RSVP Progress</span>
                        <span className="rsvp-percent">{event.rsvpProgress}%</span>
                      </div>
                      <div className="progress-bar-wrap">
                        <div 
                          className="progress-bar-fill" 
                          style={{ 
                            width: `${event.rsvpProgress}%`,
                            background: getProgressColor(event.rsvpProgress)
                          }}
                        />
                      </div>
                      <p className="rsvp-count">
                        {event.confirmed.toLocaleString()} / {event.total.toLocaleString()} Guests attended
                      </p>
                    </div>

                    {event.memories && (
                      <div className="memories-section">
                        <span className="memories-icon">📸</span>
                        <span className="memories-count">{event.memories.toLocaleString()}</span>
                        <span className="memories-label">Memories Captured</span>
                        <button className="btn-ghost gallery-link">View Gallery →</button>
                      </div>
                    )}
                  </div>

                  <div className="event-history-actions">
                    <button className="btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
                      View Details
                    </button>
                    <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
            }
