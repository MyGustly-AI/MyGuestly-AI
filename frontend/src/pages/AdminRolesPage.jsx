import React from 'react';
import Sidebar from '../components/Sidebar';
import './AdminRolesPage.css';

const admins = [
  { name: 'Julienee Deauville', email: 'j.deauville@outlook.net', role: 'FULL ADMIN', perms: 'Full Course Access, billing, staffing', event: 'All active events', avatar: 'JD' },
  { name: 'Marcus Titaoue', email: 'marcus@event.com', role: 'CHECK-IN LEAD', perms: 'QR Scanning, Guest list, Occ. Log.', event: 'Summer Gala, Tech Summit', avatar: 'MT' },
  { name: 'Sarah Lin', email: 's.lin@events.io', role: 'GALLERY MODERATOR', perms: 'Media Approval, Comments, No billing', event: 'Grand Opening', avatar: 'SL' },
];

const roleHierarchy = [
  {
    title: 'Full Admin',
    icon: <ShieldIcon />,
    color: '#7C3AED',
    perms: [
      'Total control over event settings',
      'Manage guest lists and RSVPs',
      'Access financial reports & billing',
      'Invite and manage other admins',
    ],
  },
  {
    title: 'Check-in Lead',
    icon: <ScanIcon />,
    color: '#2563EB',
    perms: [
      'Real-time guest entry management',
      'Scan QR codes for guest check-in',
      'View guest contact details',
      'Access entrance occupancy logs',
    ],
  },
  {
    title: 'Gallery Moderator',
    icon: <GalleryIcon />,
    color: '#16a34a',
    perms: [
      'Approve/delete shared uploads',
      'Manage public comment sections',
      'Orient & filter guest voice notes',
      'Flag disruptive guest content',
    ],
  },
];

export default function AdminRolesPage() {
  return (
    <div className="app-layout">
      <Sidebar role="host" user={{ name: 'Event Manager', plan: 'Premium Host Amara' }} />
      <main className="main-content">
        <div className="page-inner admin-outer">

          {/* Page header */}
          <div className="admin-page-header">
            <div className="admin-breadcrumb">Organisation / Settings</div>
            <div className="admin-page-header-row">
              <div>
                <h1 className="page-heading">Admin Roles & Permissions</h1>
                <p className="page-sub">Delegate responsibilities and manage team access for your events.</p>
              </div>
              <button className="btn-primary" style={{ fontSize: 13 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                Add New Admin
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="admin-stats-row">
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: '#ede9fe', color: 'var(--primary)' }}><ShieldIcon /></div>
              <div>
                <div className="admin-stat-val">04</div>
                <div className="admin-stat-label">Full Admins</div>
                <div className="admin-stat-sub">Total control & billing</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><ScanIcon /></div>
              <div>
                <div className="admin-stat-val">12</div>
                <div className="admin-stat-label">Check-In Staff</div>
                <div className="admin-stat-sub">Entry & QR management</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><GalleryIcon /></div>
              <div>
                <div className="admin-stat-val">08</div>
                <div className="admin-stat-label">Moderators</div>
                <div className="admin-stat-sub">Content & gallery approval</div>
              </div>
            </div>
          </div>

          {/* Active Team */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
              <h3 className="inv-section-title" style={{ margin: 0 }}>Active Team Members</h3>
              <div className="input-icon-wrap" style={{ width: 220 }}>
                <svg className="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="input-field input-with-icon" placeholder="Search team..." style={{ padding: '8px 8px 8px 34px', fontSize: 12 }} />
              </div>
            </div>
            <table className="guest-table">
              <thead>
                <tr>
                  <th>Admin Name</th>
                  <th>Role</th>
                  <th>Permissions Classes</th>
                  <th>Assigned Events</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a, i) => (
                  <tr key={i}>
                    <td>
                      <div className="guest-cell">
                        <div className="guest-avatar-sm">{a.avatar}</div>
                        <div>
                          <div className="guest-name">{a.name}</div>
                          <div className="guest-email">{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${a.role === 'FULL ADMIN' ? 'badge-purple' : a.role === 'CHECK-IN LEAD' ? 'badge-info' : 'badge-success'}`}>
                        {a.role}
                      </span>
                    </td>
                    <td className="guest-email">{a.perms}</td>
                    <td className="guest-email">{a.event}</td>
                    <td>
                      <div className="guest-actions">
                        <button className="table-action-btn">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="table-action-btn">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              <span>Showing 3 of 24 team members</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="page-btn">Previous</button>
                <button className="page-btn active">Next</button>
              </div>
            </div>
          </div>

          {/* Role Hierarchy */}
          <div className="card">
            <h3 className="inv-section-title" style={{ marginBottom: 4 }}>Role Hierarchy & Access Levels</h3>
            <p className="page-sub" style={{ marginBottom: 20, fontSize: 12 }}>Understand the specific capabilities of each administrative level.</p>
            <div className="role-hierarchy-grid">
              {roleHierarchy.map((r, i) => (
                <div key={i} className="role-card">
                  <div className="role-card-header">
                    <div className="role-card-icon" style={{ background: r.color + '20', color: r.color }}>{r.icon}</div>
                    <span className="role-card-title">{r.title}</span>
                  </div>
                  <ul className="role-perm-list">
                    {r.perms.map((p, j) => (
                      <li key={j} className="role-perm-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-light)' }}>
            Royal Gate © 2026 • MyGuestly AI Admin Portal
          </div>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => window.history.back()}>New Event</button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ShieldIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function ScanIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>; }
function GalleryIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>; }
