import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './CreateEventPage.css';

const categories = [
  { label: 'Wedding', icon: <HeartIcon /> },
  { label: 'Gala', icon: <StarIcon /> },
  { label: 'Birthday', icon: <CakeIcon /> },
  { label: 'Corporate', icon: <BriefIcon /> },
  { label: 'Church', icon: <ChurchIcon /> },
];

const themeColors = ['#7C3AED', '#D4A017', '#E11D48', '#1D4ED8'];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Wedding');
  const [color, setColor] = useState('#7C3AED');

  return (
    <div className="app-layout">
      <Sidebar role="host" />
      <main className="main-content">
        <div className="create-event-outer">
          <div className="create-event-header">
            <h2 className="create-event-title">Create Your Event</h2>
            <p className="create-event-sub">Design an unforgettable experience. Fill in the details below to bring your celebration to life.</p>
          </div>

          <div className="create-event-form card">
            <div className="form-group">
              <label className="label">Event Name</label>
              <input className="input-field" type="text" placeholder="e.g., The Buckingham Winter Gala" />
            </div>

            <div className="form-group">
              <label className="label">Event Category</label>
              <div className="category-grid">
                {categories.map(c => (
                  <button key={c.label} className={`category-btn ${category === c.label ? 'active' : ''}`} onClick={() => setCategory(c.label)}>
                    <span className="cat-icon">{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Description</label>
              <textarea className="input-field" rows={3} placeholder="Share the charm and detail of your event presentation" />
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="label">Venue Name</label>
                <input className="input-field" type="text" placeholder="e.g., Grand Ballroom, Oriental Hotel" />
              </div>
              <div className="form-group">
                <label className="label">Date</label>
                <input className="input-field" type="date" />
              </div>
              <div className="form-group">
                <label className="label">RSVP Deadline</label>
                <input className="input-field" type="date" />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Address</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <input className="input-field input-with-icon" type="text" placeholder="Enter full address" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Start Time</label>
                <input className="input-field" type="time" />
              </div>
              <div className="form-group">
                <label className="label">End Time</label>
                <input className="input-field" type="time" />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Personalisation</label>
              <div className="personalisation-row">
                <div className="upload-box">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-light)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                  <span>Upload Event Cover Image</span>
                  <small>Click to upload or drag & drop</small>
                </div>
                <div className="theme-accent">
                  <label className="label">Theme Accent</label>
                  <div className="color-swatches">
                    {themeColors.map(c => (
                      <button key={c} className={`color-swatch ${color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
                    ))}
                  </div>
                  <div className="color-input-row">
                    <div className="color-preview" style={{ background: color }} />
                  </div>
                </div>
              </div>
            </div>

            <button className="btn-primary create-event-submit" onClick={() => navigate('/host/invitation')}>Create Event</button>
            <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-light)', marginTop: 8 }}>By creating an event, you agree to our <a href="#" style={{ color: 'var(--primary)' }}>Terms of Service</a></p>
          </div>
        </div>
      </main>
    </div>
  );
}

function HeartIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>; }
function StarIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function CakeIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v1"/><path d="M12 8v1"/><path d="M17 8v1"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>; }
function BriefIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>; }
function ChurchIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>; }
