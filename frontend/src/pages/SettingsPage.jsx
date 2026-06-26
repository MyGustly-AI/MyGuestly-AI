import React, { useState } from 'react';
import AppHeader from '../components/AppHeader';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import './SettingsPage.css';

const sections = ['Account', 'Email Alerts', 'Your Events', 'Security'];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('Account');
  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar role="host" />
      <main className="main-content">
        <AppHeader
          links={[
            { label: 'Timeline', href: '/timeline' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'RSVP', href: '/host/guest-list' },
            { label: 'Help', href: '#' },
          ]}
        />
        <div className="page-inner settings-outer">
          <h1 className="page-heading">Settings</h1>
          <p className="page-sub" style={{ marginBottom: 28 }}>Manage your account preferences and system settings.</p>

          <div className="settings-layout">
            {/* Nav */}
            <nav className="settings-nav card" style={{ padding: 8 }}>
              {sections.map(s => (
                <button key={s} className={`settings-nav-btn ${activeSection === s ? 'active' : ''}`} onClick={() => setActiveSection(s)}>
                  {s}
                </button>
              ))}
            </nav>

            {/* Content */}
            <div className="settings-content">
              {/* Account */}
              <div className="settings-group card">
                <div className="settings-group-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Account
                </div>
                <div className="settings-row">
                  <div>
                    <div className="settings-label">Email Address</div>
                    <div className="settings-value">{user?.email || 'amara@guestly.ai'}</div>
                  </div>
                  <button className="settings-action-btn">Update</button>
                </div>
                <div className="settings-row">
                  <div>
                    <div className="settings-label">Password</div>
                    <div className="settings-value">••••••••••••</div>
                  </div>
                  <button className="settings-action-btn">Change</button>
                </div>
              </div>

              {/* Notifications */}
              <div className="settings-group card">
                <div className="settings-group-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  Notifications
                </div>
                <div className="settings-row">
                  <div>
                    <div className="settings-label">RSVP Alerts</div>
                    <div className="settings-hint">Get notified when guests confirm or decline.</div>
                  </div>
                  <Toggle value={notif1} onChange={setNotif1} />
                </div>
                <div className="settings-row">
                  <div>
                    <div className="settings-label">Email Notifications</div>
                    <div className="settings-hint">Receive weekly event summaries via email.</div>
                  </div>
                  <Toggle value={notif2} onChange={setNotif2} />
                </div>
              </div>

              {/* Event Defaults */}
              <div className="settings-group card">
                <div className="settings-group-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  Event Defaults
                </div>
                <div className="settings-form-row">
                  <div className="form-group">
                    <label className="label">Default Currency</label>
                    <select className="input-field"><option>NGN — Naira</option><option>USD — Dollar</option><option>GBP — Pound</option></select>
                  </div>
                  <div className="form-group">
                    <label className="label">Default Timezone</label>
                    <select className="input-field"><option>GMT+1 (West Africa Time)</option><option>GMT+0 (UTC)</option></select>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="settings-group card">
                <div className="settings-group-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Security
                </div>
                <div className="settings-row">
                  <div>
                    <div className="settings-label">Two-Factor Authentication (2FA)</div>
                    <div className="settings-hint">Your Account is 100% safe</div>
                  </div>
                  <button className="btn-outline" style={{ fontSize: 12, padding: '8px 14px' }}>Setup 2FA</button>
                </div>
                <div className="settings-row" style={{ borderBottom: 'none' }}>
                  <div>
                    <div className="settings-label">Mobile App</div>
                    <div className="settings-hint">Secure your account with biometric access.</div>
                  </div>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: '8px 14px' }}>Setup App</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      className={`toggle ${value ? 'on' : ''}`}
      onClick={() => onChange(!value)}
      aria-label="Toggle"
    >
      <span className="toggle-knob" />
    </button>
  );
}
