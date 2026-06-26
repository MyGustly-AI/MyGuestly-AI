import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import './ScanQRPage.css';

const recentEntries = [
  {
    name: 'Chidi Azikiwe',
    sub: 'Standard Ticket • +1 Guest',
    time: '19:42',
    status: 'Entered',
    avatar: 'CA',
  },
  {
    name: 'Sarah Williams',
    sub: 'VIP • No +1',
    time: '19:38',
    status: 'Entered',
    avatar: 'SW',
  },
  {
    name: 'Unknown QR Code',
    sub: 'Verification Failed',
    time: '19:30',
    status: 'Denied',
    avatar: null,
  },
];

const verifiedGuest = {
  name: 'Gift Okeke',
  sub: 'Table 04 • VIP Guest',
  avatar: 'GO',
};

export default function ScanQRPage() {
  const [scanning, setScanning] = useState(false);

  const totalGuests = 200;
  const arrived = 145;
  const pct = Math.round((arrived / totalGuests) * 100);

  return (
    <div className="app-layout">
      <Sidebar role="guest" />
      <main className="main-content">
        <AppHeader
          links={[
            { label: 'My Guestly AI', href: '/' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'Timeline', href: '/timeline' },
            { label: 'RSVP', href: '/host/guest-list' },
          ]}
        />

        <div className="page-inner scan-outer">
          {/* Attendance Progress */}
          <div className="attendance-card">
            <div className="attendance-label">Attendance Progress</div>
            <div className="attendance-heading">
              Guests Arrived: <strong>{arrived}</strong>{' '}
              <span>/ {totalGuests}</span>
            </div>
            <div className="attendance-bar-row">
              <div className="attendance-bar-track">
                <div className="attendance-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="attendance-pct">{pct}%</span>
            </div>
          </div>

          <div className="scan-layout">
            {/* Left – Scanner */}
            <div className="scan-main">
              <div className="scan-viewport-wrap">
                {/* Viewport */}
                <div
                  className={`scan-viewport ${scanning ? 'scanning' : ''}`}
                  onClick={() => setScanning(!scanning)}
                >
                  <div className="scan-corner tl" />
                  <div className="scan-corner tr" />
                  <div className="scan-corner bl" />
                  <div className="scan-corner br" />
                  {scanning && <div className="scan-line" />}

                  <div className="scan-qr-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <p>{scanning ? 'Scanning…' : 'Point camera at QR code'}</p>
                  </div>

                  {!scanning && (
                    <div className="scan-qr-hint">
                      Align QR code within the frame to auto-scan
                    </div>
                  )}
                </div>

                {/* Pill Button */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    className={`scan-btn-pill ${scanning ? 'scanning' : ''}`}
                    onClick={() => setScanning(!scanning)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                    {scanning ? 'Stop Scanning' : 'Scan Guest QR Code'}
                  </button>
                </div>

                {/* Search */}
                <div className="scan-search-bar">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input placeholder="Manual Search for guest names..." />
                  <button className="scan-search-btn">Search</button>
                </div>
              </div>
            </div>

            {/* Right – Verified + Recent Entries */}
            <div className="scan-side">
              {/* Verified Guest Card */}
              <div className="verified-card">
                <div className="verified-avatar">
                  <span>{verifiedGuest.avatar}</span>
                </div>
                <div className="verified-info">
                  <div className="verified-name">{verifiedGuest.name}</div>
                  <div className="verified-sub">{verifiedGuest.sub}</div>
                  <div className="access-granted">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    ACCESS GRANTED
                  </div>
                </div>
                <div className="verified-badge">VERIFIED</div>
              </div>

              {/* Recent Entries */}
              <div className="recent-entries-card">
                <div className="re-title">Recent Entries</div>
                {recentEntries.map((e, i) => (
                  <div key={i} className="re-item">
                    {e.avatar ? (
                      <div className="re-avatar">{e.avatar}</div>
                    ) : (
                      <div className="re-denied-icon">!</div>
                    )}
                    <div className="re-info">
                      <div className="re-name" style={!e.avatar ? { color: 'var(--danger)' } : {}}>
                        {e.name}
                      </div>
                      <div className="re-sub">{e.sub}</div>
                    </div>
                    <div className="re-right">
                      <div className="re-time">{e.time}</div>
                      <div className={e.status === 'Entered' ? 're-status-entered' : 're-status-denied'}>
                        {e.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}