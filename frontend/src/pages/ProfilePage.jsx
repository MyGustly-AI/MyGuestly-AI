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
        </div>
      </div>
    </div>
  );
}
