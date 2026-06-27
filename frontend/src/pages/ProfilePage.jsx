<<<<<<< HEAD
// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('about');

  // Sample profile data
  const profileData = {
    name: "Ajala Peace",
    title: "PREMIUM HOST",
    memberSince: "OCT 2021",
    location: "LAGOS, NIGERIA",
    coverImage: "https://via.placeholder.com/1200x300/4B0082/ffffff?text=Cover+Image",
    avatar: "https://via.placeholder.com/120/4B0082/ffffff?text=AP",
    eventsHosted: 42,
    memoriesCaptured: "1.2k",
    rsvpRate: "98%",
    bio: "With over a decade of experience in the luxury hospitality sector across Lagos State, I specialize in curating high-stakes social events where every detail is a performance. My passion lies in the intersection of traditional Nigerian warmth and contemporary global prestige. From intimate ministerial dinners to expansive royal weddings, my goal is always to create a digital and physical environment where guests feel like the center of a celebration.",
    highlights: [
      { title: "Pink floral tablecape", image: "🌸" },
      { title: "Purple lit stage", image: "🎭" },
      { title: "Elegant canapés", image: "🍽️" }
    ]
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-inner">
          <div className="profile-container">
            {/* Cover Image */}
            <div className="cover-section">
              <img 
                src={profileData.coverImage} 
                alt="Cover" 
                className="cover-image"
              />
              <div className="cover-overlay">
                <button className="btn-ghost" style={{ color: 'white', borderColor: 'white' }}>
                  Edit Cover
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="profile-info-section">
              <div className="profile-avatar-wrapper">
                <img 
                  src={profileData.avatar} 
                  alt={profileData.name} 
                  className="profile-avatar"
                />
                <span className="profile-status">🟢 Active</span>
              </div>

              <div className="profile-details">
                <div className="profile-name-row">
                  <h1 className="profile-name">{profileData.name}</h1>
                  <span className="profile-badge">{profileData.title}</span>
                </div>
                <p className="profile-meta">
                  MEMBER SINCE {profileData.memberSince} • {profileData.location}
                </p>
                <div className="profile-actions">
                  <button className="btn-primary">Message Host</button>
                  <button className="btn-outline">Share Profile</button>
                </div>
              </div>

              {/* Stats */}
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">{profileData.eventsHosted}</span>
                  <span className="stat-label">Events Hosted</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">{profileData.memoriesCaptured}</span>
                  <span className="stat-label">Memories Captured</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">{profileData.rsvpRate}</span>
                  <span className="stat-label">RSVP Rate</span>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bio-section">
              <div className="bio-header">
                <h2 className="bio-title">Crafting Unforgettable Events</h2>
                <span className="bio-rating">⭐ 99</span>
              </div>
              <p className="bio-text">{profileData.bio}</p>
            </div>

            {/* Recent Highlights */}
            <div className="highlights-section">
              <div className="section-header">
                <h2>Recent Highlights</h2>
                <button className="btn-ghost">VIEW ALL →</button>
              </div>
              <div className="highlights-grid">
                {profileData.highlights.map((item, index) => (
                  <div key={index} className="highlight-card">
                    <div className="highlight-icon">{item.image}</div>
                    <span className="highlight-title">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
=======
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMeRequest, updateProfileRequest, uploadAvatarRequest, uploadCoverRequest } from '../api/auth';
import './ProfilePage.css';


export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, setUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    fullName: '', 
    phone: '',
    bio: '',
    website: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Avatar upload
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const avatarInputRef = useRef(null);

  // Cover upload
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const coverInputRef = useRef(null);

  // ── Load profile on mount ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await getMeRequest();
        const me = data?.user ?? data;
        setProfile(me);
        setEditForm({
          fullName: me?.fullName || '',
          phone: me?.phone || '',
          bio: me?.bio || '',
          website: me?.website || '',
        });
      } catch (err) {
        setError('Could not load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Avatar change ──────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
    try {
      const updated = await uploadAvatarRequest(file);
      const me = updated?.user ?? updated;
      setProfile(me);
      if (setUser) setUser(me);
    } catch (err) {
      setError('Could not upload profile photo. Please try again.');
    }
  };

  // ── Cover change ─────────────────────────────────────────────────
  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setCoverFile(file);
    try {
      const updated = await uploadCoverRequest(file);
      const me = updated?.user ?? updated;
      setProfile(me);
      if (setUser) setUser(me);
    } catch (err) {
      setError('Could not upload cover photo. Please try again.');
    }
  };

  // ── Save edits ─────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await updateProfileRequest({
        fullName: editForm.fullName,
        phone: editForm.phone,
        bio: editForm.bio,
        website: editForm.website,
      });
      const me = updated?.user ?? updated;
      setProfile(me);
      if (setUser) setUser(me);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message || 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived display values ────────────────────────────────────
  const displayName = profile?.fullName || authUser?.fullName || 'User';
  const displayRole = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1).toLowerCase()
    : 'Host';
  const displayEmail = profile?.email || authUser?.email || '—';
  const displayPhone = profile?.phone || '—';
  const displayLocation = profile?.location || 'Lagos, Nigeria';
  const displayWebsite = profile?.website || '—';
  const avatarSrc = avatarPreview || profile?.avatarUrl || '/profile.png';
  const coverSrc = coverPreview || profile?.coverUrl || '/profile.png';
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
    : '';

  // ── Render ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="profile-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#e11d48' }}>{error}</p>
        <button className="profile-edit-btn" style={{ marginTop: 16, maxWidth: 200 }} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* ── Top Navigation Bar ──────────────────────────────────── */}
      <header className="profile-topbar">
        <span className="profile-logo">
          My<span className="profile-logo-purple">Guestly</span>{' '}
          <span className="profile-logo-gold">Ai</span>
        </span>
        <nav className="profile-nav">
          <button className="profile-nav-link" onClick={() => navigate('/host/home')}>Home</button>
          <button className="profile-nav-link" onClick={() => navigate('/host/guest-list')}>Guests</button>
          <button className="profile-nav-link" onClick={() => navigate('/host/admin-roles')}>Roles</button>
          <button className="profile-nav-link active">Profile</button>
        </nav>
        <div className="profile-topbar-right">
          <button className="profile-icon-btn" onClick={() => navigate('/notification')}>
            <BellIcon />
          </button>
          <img src={avatarSrc} alt="User" className="profile-topbar-avatar" />
        </div>
      </header>

      <div className="profile-body">

        {/* ── Cover + Avatar + Info + Actions ────────────────────── */}
        <div className="profile-cover-card">
          <div className="profile-cover-img-wrap" style={{ cursor: 'pointer' }} onClick={() => coverInputRef.current.click()}>
            <img src={coverSrc} alt="Cover" className="profile-cover-img" />
            <div style={{
              position: 'absolute', bottom: 10, right: 10,
              background: 'rgba(0,0,0,0.55)', borderRadius: 8,
              padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6,
              color: '#fff', fontSize: 12, fontWeight: 600
            }}>
              <CameraIcon size={14} color="#fff" /> Change Cover
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
          </div>
          <div className="profile-cover-bottom">
            
            {/* Clickable avatar with camera icon */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => avatarInputRef.current.click()}>
              <img src={avatarSrc} alt={displayName} className="profile-main-avatar" />
              <div style={{
                position: 'absolute', bottom: 4, right: 4,
                background: 'var(--primary,#7c3aed)', borderRadius: '50%',
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                <CameraIcon size={14} color="#fff" />
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>

            {/* Name, badges, and action buttons */}
            <div style={{ flex: 1 }}>
              <h1 className="profile-name-lg">
                {displayName}
                {profile?.isPremium && (
                  <span className="profile-premium-badge">
                    <ShieldSmIcon /> PREMIUM HOST
                  </span>
                )}
              </h1>
              <p className="profile-member-since">
                {memberSince ? `MEMBER SINCE ${memberSince} • ` : ''}{displayLocation.toUpperCase()}
              </p>
              
              <div className="profile-cover-actions">
                <button className="profile-msg-btn">Message Host</button>
                <button className="profile-share-btn" onClick={() => navigator.share?.({ title: displayName, url: window.location.href })}>
                  <ShareIcon /> Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Bar ───────────────────────────────────────────── */}
        <div className="profile-stats-card">
          <div className="profile-stat">
            <span className="profile-stat-val">{profile?.eventsHosted ?? 0}</span>
            <span className="profile-stat-label">Events Hosted</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-val">
              {profile?.memoriesCaptured >= 1000
                ? `${(profile.memoriesCaptured / 1000).toFixed(1)}k`
                : profile?.memoriesCaptured ?? 0}
            </span>
            <span className="profile-stat-label">Memories Captured</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-val">{profile?.rsvpRate != null ? `${profile.rsvpRate}%` : '—'}</span>
            <span className="profile-stat-label">RSVP Rate</span>
          </div>
        </div>

        {/* ── Main Content Row (Left: Bio + Highlights | Right: Contact + Map) ── */}
        <div className="profile-content-row">

          {/* ── LEFT COLUMN ─────────────────────────────────────── */}
          <div className="profile-left">
            
            {/* Bio Section */}
            <div className="profile-card">
              <div className="profile-bio-section">
                <div className="profile-quote-wrap">
                  <span className="profile-quote-mark">99</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="profile-bio-title">Crafting Unforgettable Events</h3>
                  <p className="profile-bio-text">
                    {profile?.bio || 'No bio yet. Click "Edit Profile" to add one.'}
                  </p>
                  <button className="profile-edit-btn" onClick={() => setEditing(true)}>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Highlights */}
            <div className="profile-card">
              <div className="profile-highlights-header">
                <h3 className="profile-bio-title">Recent Highlights</h3>
                <button className="view-all-btn">VIEW ALL →</button>
              </div>
              {profile?.highlights && profile.highlights.length > 0 ? (
                <div className="profile-highlights-grid">
                  {profile.highlights.map((h, i) => (
                    <div key={i} className="profile-highlight-item">
                      <img src={h.url || h.src} alt={h.alt || 'Highlight'} />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  No highlights yet. Memories from your events will appear here.
                </p>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────── */}
          <div className="profile-right">
            
            {/* Host Contact Info */}
            <div className="profile-card">
              <span className="profile-contact-label">HOST CONTACT</span>
              
              <div className="profile-contact-list">
                <div className="profile-contact-item">
                  <PhoneIcon />
                  <div>
                    <div className="profile-contact-type">PHONE</div>
                    <div className="profile-contact-val">{displayPhone}</div>
                  </div>
                </div>
                <div className="profile-contact-item">
                  <PinIcon />
                  <div>
                    <div className="profile-contact-type">BASE LOCATION</div>
                    <div className="profile-contact-val">{displayLocation}</div>
                  </div>
                </div>
                <div className="profile-contact-item">
                  <GlobeIcon />
                  <div>
                    <div className="profile-contact-type">WEBSITE</div>
                    <div className="profile-contact-val">{displayWebsite}</div>
                  </div>
                </div>
              </div>

              {/* Social Icons */}
              <div className="profile-social-row">
                <button className="profile-social-btn" title="Website"><GlobeIcon /></button>
                <button className="profile-social-btn" title="Instagram"><CameraIcon size={16} color="var(--primary,#7c3aed)" /></button>
                <button className="profile-social-btn" title="Twitter"><AtIcon /></button>
              </div>
            </div>

            {/* Location Map */}
            <div className="profile-map-card">
              <div className="profile-map-placeholder">
                <div className="profile-map-pin-label">
                  <PinIcon /> {displayLocation}
                </div>
              </div>
            </div>
          </div>
>>>>>>> in
        </div>
      </div>

      {/* ── Edit Profile Modal ───────────────────────────────────── */}
      {editing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-dark,#1a1a2e)' }}>Edit Profile</h3>

            {saveError && <p style={{ color: '#e11d48', fontSize: 13, margin: 0 }}>{saveError}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Full Name</label>
              <input
                className="input-field"
                value={editForm.fullName}
                onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="Your full name"
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Phone</label>
              <input
                className="input-field"
                value={editForm.phone}
                onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+234 800 000 0000"
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Website</label>
              <input
                className="input-field"
                type="url"
                value={editForm.website}
                onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://yourwebsite.com"
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Bio</label>
              <textarea
                className="input-field"
                value={editForm.bio}
                onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell us about yourself and your event style..."
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, fontFamily: 'inherit', minHeight: 100, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => { setEditing(false); setSaveError(null); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #e0e0e0',
                  background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.target.style.background = '#f5f5f5'}
                onMouseLeave={e => e.target.style.background = '#fff'}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                  background: 'var(--primary,#7c3aed)', color: '#fff',
                  fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1, transition: 'all 0.2s'
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
<<<<<<< HEAD
=======

// ── Icon Components ────────────────────────────────────────────────

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function ShieldSmIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary,#7c3aed)" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 5.95 5.95l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary,#7c3aed)" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary,#7c3aed)" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function CameraIcon({ size = 16, color = 'var(--primary,#7c3aed)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

function AtIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary,#7c3aed)" strokeWidth="2">
      <circle cx="12" cy="12" r="4"/>
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
    </svg>
  );
}
>>>>>>> in
