import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './InvitationPage.css';

const guests = [
  { name: 'Olumide Ojo', contact: 'olumide.ojo@ach.ng', status: 'RSVP Confirmed', avatar: 'OO' },
  { name: 'Remi Adebayo', contact: '+234 803 245 4760', status: 'Invitation Sent', avatar: 'RA' },
  { name: 'Chioma Abiodun', contact: 'c.abiodun@gmail.com', status: 'RSVP Confirmed', avatar: 'CA' },
  { name: 'Babatunde A.', contact: 'b.j@outlook.com', status: 'RSVP Confirmed', avatar: 'BA' },
];

export default function InvitationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(2);

  return (
    <div className="app-layout">
      <Sidebar role="host" />
      <main className="main-content">
        <div className="page-inner invitation-outer">
          <div className="invitation-header">
            <h1 className="page-heading">Host Your Masterpiece</h1>
            <p className="page-sub">Let's curate your guest list for the Wedding Gala 2026.</p>
          </div>

          {/* Stepper */}
          <div className="stepper">
            {['Event Details', 'Design Invitation', 'Guest List'].map((s, i) => (
              <React.Fragment key={i}>
                <div className={`step ${step > i ? 'done' : step === i ? 'active' : ''}`}>
                  <div className="step-circle">
                    {step > i
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      : i + 1}
                  </div>
                  <span className="step-label">{s}</span>
                </div>
                {i < 2 && <div className={`step-line ${step > i ? 'done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="invitation-cols">
            {/* Import Guests */}
            <div className="card invitation-import">
              <h3 className="inv-section-title">Import Guests</h3>
              <p className="inv-section-sub">Drag and drop your file here or browse files.</p>
              <div className="upload-drop">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-light)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p>Upload CSV or Excel</p>
                <small>Drag and drop your file here</small>
                <button className="btn-outline" style={{ marginTop: 10, fontSize: 12, padding: '8px 18px' }}>Browse Files</button>
              </div>
              <div className="inv-divider"><span>OR MANUALLY ADD</span></div>
              <div className="form-group">
                <label className="label">Full Name</label>
                <input className="input-field" type="text" placeholder="e.g., Adequate S. Johnson" />
              </div>
              <div className="form-group" style={{ marginTop: 10 }}>
                <label className="label">Email or Phone</label>
                <input className="input-field" type="text" placeholder="email@example.com" />
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                Add Guest
              </button>
            </div>

            {/* Guest List */}
            <div className="card invitation-list">
              <div className="inv-list-header">
                <div>
                  <h3 className="inv-section-title">Guests (124)</h3>
                  <p className="inv-section-sub">40 guests already using your digital invitations.</p>
                </div>
                <button className="btn-primary" style={{ fontSize: 12, padding: '8px 14px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Invite All
                </button>
              </div>
              <div className="inv-table">
                <div className="inv-table-head">
                  <span>Guest Name</span>
                  <span>Contact</span>
                  <span>Status</span>
                </div>
                {guests.map((g, i) => (
                  <div key={i} className="inv-table-row">
                    <div className="inv-guest">
                      <div className="inv-avatar">{g.avatar}</div>
                      <span className="inv-name">{g.name}</span>
                    </div>
                    <span className="inv-contact">{g.contact}</span>
                    <span className={`badge ${g.status === 'RSVP Confirmed' ? 'badge-success' : 'badge-purple'}`}>{g.status}</span>
                  </div>
                ))}
                <button className="view-all-btn" style={{ margin: '10px auto', display: 'block' }}>View All Guests</button>
              </div>
            </div>
          </div>

          {/* Step nav */}
          <div className="inv-step-nav">
            <button className="btn-ghost" onClick={() => navigate('/host/create-event')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              Previous Step
            </button>
            <button className="btn-primary" onClick={() => navigate('/host/guest-list')}>
              Review & Finalise
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
