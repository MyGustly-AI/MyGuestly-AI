import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import './HostDashboard.css';

export default function HostDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get logged-in user
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRSVPs: 0,
    pendingInvites: 0,
    checkedIn: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Replace with your actual API call
        const sampleEvents = [
          {
            id: 1,
            title: "Amara & David's Wedding",
            date: "June 13, 2026",
            rsvpProgress: 82,
            confirmed: 410,
            total: 500,
            status: "upcoming"
          },
          {
            id: 2,
            title: "Lago Tech Summit",
            date: "July 22, 2026",
            rsvpProgress: 95,
            confirmed: 950,
            total: 1000,
            status: "upcoming"
          },
          {
            id: 3,
            title: "Eko Charity Gala",
            date: "August 05, 2026",
            rsvpProgress: 10,
            confirmed: 100,
            total: 1000,
            status: "upcoming"
          }
        ];

        setEvents(sampleEvents);
        setStats({
          totalEvents: sampleEvents.length,
          totalRSVPs: sampleEvents.reduce((acc, e) => acc + e.confirmed, 0),
          pendingInvites: sampleEvents.reduce((acc, e) => acc + (e.total - e.confirmed), 0),
          checkedIn: Math.floor(sampleEvents.reduce((acc, e) => acc + e.confirmed, 0) * 0.7)
        });
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'var(--success)';
    if (progress >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  // Extract first name, fallback to 'Guest'
  const firstName = user?.name?.split(' ')[0] || 'Guest';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-inner">
          <div className="dashboard-container">
            {/* Welcome Section with User's Name */}
            <div className="welcome-section">
              <div>
                <h1 className="welcome-title">Welcome back, {firstName}! 👋</h1>
                <p className="welcome-subtitle">
                  Your royal dashboard is ready. You have {events.length} events with a total of {stats.totalRSVPs.toLocaleString()} guests confirmed.
                </p>
              </div>
              <div className="welcome-actions">
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/host/create-event')}
                >
                  + Host New Event
                </button>
                <button 
                  className="btn-outline"
                  onClick={() => navigate('/host/home')}
                >
                  View Events
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.totalEvents}</span>
                  <span className="stat-label">Total Events</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.totalRSVPs.toLocaleString()}</span>
                  <span className="stat-label">Total RSVPs</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📨</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.pendingInvites}</span>
                  <span className="stat-label">Pending Invites</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.checkedIn.toLocaleString()}</span>
                  <span className="stat-label">Checked-In</span>
                </div>
              </div>
            </div>

            {/* Active Events */}
            <div className="events-section">
              <div className="section-header">
                <h2>Active Events</h2>
                <button className="btn-ghost" onClick={() => navigate('/host/home')}>
                  View All →
                </button>
              </div>

              {loading ? (
                <div className="loading-state">Loading your events...</div>
              ) : events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎉</div>
                  <h3>You haven't created any events yet</h3>
                  <p>Start by creating your first event</p>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/host/create-event')}
                  >
                    Create Your First Event
                  </button>
                </div>
              ) : (
                <div className="events-grid">
                  {events.map(event => (
                    <div key={event.id} className="event-card">
                      <div className="event-card-header">
                        <h3 className="event-title">{event.title}</h3>
                        <span className={`badge ${event.status === 'upcoming' ? 'badge-success' : 'badge-gold'}`}>
                          {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
                        </span>
                      </div>
                      <p className="event-date">📅 {event.date}</p>
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
                          {event.confirmed.toLocaleString()} / {event.total.toLocaleString()} Guests confirmed
                        </p>
                      </div>
                      <div className="event-actions">
                        <button 
                          className="btn-outline"
                          style={{ padding: '8px 16px', fontSize: '13px' }}
                          onClick={() => navigate(`/host/event/${event.id}`)}
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
