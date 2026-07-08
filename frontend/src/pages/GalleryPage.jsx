import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import './GalleryPage.css';

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

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
          active="Gallery"
        />
        <div className="page-inner">
          <h1 className="page-heading">Event Gallery</h1>
          <p className="page-sub">View and manage event photos and memories</p>

          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading gallery...
            </div>
          ) : photos.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No photos uploaded yet</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {photos.map((photo) => (
                <div key={photo.id} className="gallery-item">
                  <img src={photo.url} alt={photo.title} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}