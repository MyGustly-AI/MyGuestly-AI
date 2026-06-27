// src/pages/GalleryPage.jsx
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import './GalleryPage.css';

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const filters = [
    { id: 'all', label: 'All Moments' },
    { id: 'images', label: 'Images Only' },
    { id: 'videos', label: 'Videos Only' }
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      const newImages = files.map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video') ? 'video' : 'image',
        name: file.name,
        date: new Date().toLocaleDateString()
      }));
      setImages([...newImages, ...images]);
      setUploading(false);
    }, 1000);
  };

  const filteredImages = activeFilter === 'all' 
    ? images 
    : images.filter(img => img.type === (activeFilter === 'images' ? 'image' : 'video'));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-inner">
          <div className="gallery-container">
            {/* Header */}
            <div className="gallery-header">
              <div>
                <h1 className="gallery-title">Abike & Tunde's Wedding</h1>
                <p className="gallery-subtitle">
                  Relive the vibrant celebration through shared memories and AI-curated moments.
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="gallery-filters">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Upload Area */}
            <div className="upload-area">
              <div 
                className="upload-dropzone"
                onClick={() => document.getElementById('fileInput').click()}
              >
                <span className="upload-icon">📸</span>
                <p className="upload-text">Add Your Memory</p>
                <p className="upload-hint">Click to upload photos or videos</p>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
              {uploading && (
                <div className="upload-progress">
                  <span>Uploading...</span>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: '70%' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Grid */}
            {filteredImages.length === 0 ? (
              <div className="empty-gallery">
                <div className="empty-gallery-icon">🖼️</div>
                <h3>No photos uploaded for this event yet</h3>
                <p className="empty-gallery-sub">Be the first to share a memory!</p>
              </div>
            ) : (
              <div className="gallery-grid">
                {filteredImages.map(image => (
                  <div key={image.id} className="gallery-item">
                    {image.type === 'video' ? (
                      <video src={image.url} className="gallery-thumbnail" controls />
                    ) : (
                      <img src={image.url} alt={image.name} className="gallery-thumbnail" />
                    )}
                    <div className="gallery-item-overlay">
                      <span className="gallery-item-date">{image.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Event Details */}
            <div className="event-details-card">
              <h3 className="details-title">Event Details</h3>
              <p className="details-empty">No active event selected.</p>
              <button className="btn-outline details-btn">
                View Full Timeline →
              </button>
            </div>

            {/* Order Print Album */}
            <div className="print-album-card">
              <div className="print-album-content">
                <div className="print-album-icon">📖</div>
                <div>
                  <h3 className="print-album-title">Order Print Album</h3>
                  <p className="print-album-sub">
                    AI-curated physical memories, delivered in premium gold foil.
                  </p>
                </div>
              </div>
              <button className="btn-primary">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
