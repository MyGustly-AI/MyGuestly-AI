// src/pages/MyPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MyPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data - replace with your actual data
  const stats = [
    { label: 'Total Events', value: '12', icon: '📅', color: 'purple' },
    { label: 'Active Guests', value: '284', icon: '👥', color: 'gold' },
    { label: 'RSVP Rate', value: '78%', icon: '📊', color: 'success' },
    { label: 'Pending Tasks', value: '5', icon: '📋', color: 'warning' }
  ];

  const recentActivity = [
    { id: 1, event: 'Wedding Reception', guests: 45, status: 'Confirmed', date: '2026-07-15' },
    { id: 2, event: 'Corporate Gala', guests: 120, status: 'Planning', date: '2026-08-01' },
    { id: 3, event: 'Birthday Party', guests: 30, status: 'Invited', date: '2026-07-22' }
  ];

  return (
    <div className="page-inner">
      {/* Page Header */}
      <div className="page-header" style={{ 
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: 'clamp(28px, 4vw, 42px)',
            marginBottom: '8px'
          }}>
            Welcome back, {user?.name || 'Guest'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
            Here's what's happening with your events today
          </p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => window.location.href = '/host/create-event'}
          style={{ whiteSpace: 'nowrap' }}
        >
          + Create New Event
        </button>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="responsive-grid" style={{ marginBottom: '32px' }}>
        {stats.map((stat, index) => (
          <div key={index} className="card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px'
          }}>
            <div style={{
              fontSize: '32px',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: stat.color === 'purple' ? 'var(--light-bg)' :
                          stat.color === 'gold' ? '#fef3c7' :
                          stat.color === 'success' ? '#dcfce7' : '#fef9c3',
              borderRadius: '12px',
              flexShrink: 0
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ 
                fontSize: 'clamp(20px, 2.5vw, 28px)',
                fontWeight: '700',
                color: 'var(--text-dark)'
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '14px',
                color: 'var(--text-muted)'
              }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid - Two Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Left Column - Recent Activity */}
        <div className="card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <h3 style={{ fontSize: '20px' }}>Recent Activity</h3>
            <button className="btn-ghost" style={{ padding: '6px 16px', fontSize: '13px' }}>
              View All →
            </button>
          </div>
          
          {/* Responsive Table */}
          <div className="table-responsive">
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', fontWeight: '600', color: 'var(--text-muted)' }}>Event</th>
                  <th style={{ padding: '12px 8px', fontWeight: '600', color: 'var(--text-muted)' }}>Guests</th>
                  <th style={{ padding: '12px 8px', fontWeight: '600', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '12px 8px', fontWeight: '600', color: 'var(--text-muted)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '500' }}>{item.event}</td>
                    <td style={{ padding: '12px 8px' }}>{item.guests}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className={`badge badge-${item.status === 'Confirmed' ? 'success' : 
                                          item.status === 'Planning' ? 'warning' : 'purple'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions - Responsive Grid */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Quick Actions</h3>
        <div className="responsive-grid">
          <button className="card" style={{
            textAlign: 'left',
            padding: '20px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(75,0,130,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📨</div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Send Invitations</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Invite guests to your events</div>
          </button>

          <button className="card" style={{
            textAlign: 'left',
            padding: '20px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(75,0,130,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>View Analytics</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Track event performance</div>
          </button>

          <button className="card" style={{
            textAlign: 'left',
            padding: '20px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(75,0,130,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>👥</div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Manage Guests</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>View and edit guest list</div>
          </button>
        </div>
      </div>

      {/* Inline Responsive Styles - Mobile Optimized */}
      <style jsx>{`
        /* Additional mobile-specific tweaks */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch !important;
          }
          
          .page-header .btn-primary {
            width: 100%;
            justify-content: center;
          }
          
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
