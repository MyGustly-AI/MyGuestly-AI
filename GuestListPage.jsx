import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import './GuestListPage.css';

const guests = [
  { name: 'Julienee Deauville', email: 'j.deauville@outlook.net', rsvp: 'ATTENDING', post: 'Shared', avatar: 'JD', role: 'FULL ADMIN', event: 'All active events', digital: 'Billing, staffing' },
  { name: 'Marcus Titaoue', email: 'marcus@event.com', rsvp: 'ATTENDING', post: 'Shared', avatar: 'MT', role: 'CHECK-IN LEAD', event: 'Summer Gala, Tech Summit', digital: 'QR Scanning' },
  { name: 'Sophie Chen', email: 's.chen@events.io', rsvp: 'PENDING', post: null, avatar: 'SC', role: null, event: 'Grand Opening', digital: 'Media Approval' },
  { name: 'Marcus Rodriguez', email: 'm.rodriguez@mail.com', rsvp: 'DECLINED', post: 'Not Sent', avatar: 'MR', role: null, event: 'Wedding, Birthday', digital: 'Photography' },
];

const summaryCards = [
  { label: 'Total Events', value: '520', color: 'var(--primary)' },
  { label: 'Attending', value: '384', color: 'var(--success)' },
  { label: 'Pending', value: '92', color: 'var(--warning)' },
  { label: 'Declined', value: '44', color: 'var(--danger)' },
];

export default function GuestListPage() {
  const [search, setSearch] = useState('');

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
          active="RSVP"
        />
        <div className="page-inner guestlist-outer">
          <div className="guestlist-top">
            <div>
              <h1 className="page-heading">Guest List Management</h1>
              <p className="page-sub" style={{ marginTop: 4 }}>
                <span className="badge badge-purple" style={{ fontSize: 11, marginRight: 6 }}>Premium Host</span>
                Premium Attendees • 620 Guests Confirmed
              </p>
            </div>
            <div className="guestlist-top-actions">
              <button className="btn-ghost" style={{ fontSize: 12, padding: '9px 16px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Message All
              </button>
              <button className="btn-ghost" style={{ fontSize: 12, padding: '9px 16px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export List
              </button>
              <button className="btn-primary" style={{ fontSize: 12, padding: '9px 16px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                Add Guest
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-row">
            {summaryCards.map((c, i) => (
              <div key={i} className="summary-card">
                <div className="summary-value" style={{ color: c.color }}>{c.value}</div>
                <div className="summary-label">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="guestlist-controls">
            <div className="input-icon-wrap" style={{ flex: 1, maxWidth: 360 }}>
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                className="input-field input-with-icon"
                placeholder="Search by name, email or status..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: 'var(--white)' }}
              />
            </div>
            <select className="input-field" style={{ width: 160 }}>
              <option>All RSVP Status</option>
              <option>Attending</option>
              <option>Pending</option>
              <option>Declined</option>
            </select>
            <select className="input-field" style={{ width: 140 }}>
              <option>Filter Party</option>
              <option>VIP</option>
              <option>General</option>
            </select>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="guest-table">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Guest Name</th>
                  <th>Contact Info</th>
                  <th>RSVP Status</th>
                  <th>Digital Post</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {guests.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase())).map((g, i) => (
                  <tr key={i}>
                    <td><input type="checkbox" /></td>
                    <td>
                      <div className="guest-cell">
                        <div className="guest-avatar-sm">{g.avatar}</div>
                        <div>
                          <div className="guest-name">{g.name}</div>
                          <div className="guest-email">{g.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="guest-email">{g.email}</td>
                    <td>
                      <span className={`badge ${g.rsvp === 'ATTENDING' ? 'badge-success' : g.rsvp === 'PENDING' ? 'badge-warning' : 'badge-declined'}`}>
                        {g.rsvp}
                      </span>
                    </td>
                    <td>
                      {g.post
                        ? <span className={`badge ${g.post === 'Shared' ? 'badge-purple' : ''}`}>{g.post}</span>
                        : <span className="badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>Not Sent</span>
                      }
                    </td>
                    <td>
                      <div className="guest-actions">
                        <button className="table-action-btn" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="table-action-btn" title="Remove">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="m19,6-.867,13.142A2,2,0,0,1,16.138,21H7.862a2,2,0,0,1-1.995-1.858L5,6m5,0V4a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              <span>Showing 4 of 100 guests</span>
              <div className="pagination">
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">3</button>
                <span>...</span>
                <button className="page-btn">42</button>
                <button className="page-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Delegate Permissions */}
          <div className="delegate-banner card">
            <div>
              <h3 className="inv-section-title">Delegate Event Permissions</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Streamline your hosting experience. Promote trusted guests to Admin status to help manage check-ins, oversee the photo gallery, and moderate guest interactions during the event.
              </p>
            </div>
            <button className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Manage Admin Roles
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => window.history.back()}>Create New Event</button>
          </div>
        </div>
      </main>
    </div>
  );
}
