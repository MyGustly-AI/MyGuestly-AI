import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { listEventsRequest } from '../api/events';
import { listMediaRequest, getUploadUrlRequest, registerMediaRequest } from '../api/media';
import './GalleryPage.css';

const filters = ['All Moments', 'Images Only', 'Videos Only'];

export default function GalleryPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [photos, setPhotos] = useState([]);
  
  // Loading & error states
  const [eventsLoading, setEventsLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState('All Moments');

  // Fetch events list on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await listEventsRequest();
        const eventList = data?.data || data || [];
        setEvents(eventList);
        if (eventList.length > 0) {
          setSelectedEventId(eventList[0].id);
        }
      } catch (err) {
        setError(err.message || 'Could not load events.');
      } finally {
        setEventsLoading(false);
      }
    })();
  }, []);

  // Fetch photos whenever selectedEventId or activeFilter changes
  const fetchPhotos = async () => {
    if (!selectedEventId) return;
    setPhotosLoading(true);
    setError(null);
    try {
      const query = {};
      if (activeFilter === 'Images Only') query.mediaType = 'IMAGE';
      if (activeFilter === 'Videos Only') query.mediaType = 'VIDEO';

      const result = await listMediaRequest(selectedEventId, query);
      const list = result?.records || result?.data?.records || result || [];
      setPhotos(list);
    } catch (err) {
      setError(err.message || 'Could not load gallery photos.');
    } finally {
      setPhotosLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [selectedEventId, activeFilter]);

  // Handle triggering file select
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle Cloudinary upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      // 1. Get pre-signed signature from backend
      const signatureData = await getUploadUrlRequest(selectedEventId);
      const { uploadUrl, signature, timestamp, apiKey, folder } = signatureData;

      // 2. Upload file to Cloudinary directly
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cloudRes = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!cloudRes.ok) {
        throw new Error('Cloudinary upload request failed.');
      }

      const cloudJson = await cloudRes.json();
      const fileUrl = cloudJson.secure_url;
      const publicId = cloudJson.public_id;
      const mediaType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';

      // 3. Register media in the backend
      await registerMediaRequest(selectedEventId, {
        mediaType,
        url: fileUrl,
        publicId,
        caption: `Uploaded via Gallery`,
      });

      // 4. Refresh local photos
      await fetchPhotos();
    } catch (err) {
      setError(err.message || 'Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
      // Reset input value so same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="app-layout">
      <Sidebar role="guest" user={{ name: 'Guest User', plan: 'Event Gallery' }} />

      <main className="main-content">
        <div className="page-inner gallery-outer">
          
          {/* Top row with page title & event selection */}
          <div className="gallery-top-row">
            <div>
              <h1 className="gallery-heading">
                {selectedEvent ? selectedEvent.title : "Abike & Tunde's Wedding"}
              </h1>
              <p className="gallery-sub">
                Relive the vibrant celebration through shared memories and{' '}
                <span className="gallery-ai-tag">Ai-curated</span> moments.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {events.length > 1 && (
                <select
                  className="input-field"
                  style={{ width: 220, background: 'var(--white)' }}
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

          {/* Filter tabs */}
          <div className="gallery-filters">
            {filters.map(f => (
              <button
                key={f}
                className={`gallery-filter-btn${activeFilter === f ? ' active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Body: photo grid + right panel */}
          <div className="gallery-body">
            
            {/* Photo grid */}
            <div className="gallery-grid-wrapper" style={{ flex: 1 }}>
              {photosLoading ? (
                <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
                  Loading gallery moments...
                </div>
              ) : photos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
                  No photos uploaded for this event yet.
                </div>
              ) : (
                <div className="gallery-grid">
                  {photos.map((p, i) => (
                    <div key={p.id || i} className="gallery-item">
                      <img src={p.url} alt={`Memory ${i + 1}`} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      {p.mediaType === 'VIDEO' && (
                        <span className="gallery-video-badge">VIDEO</span>
                      )}
                      <div className="gallery-item-overlay">
                        <a href={p.url} download target="_blank" rel="noreferrer" className="gallery-dl-btn">
                          <DownloadIcon />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right panel */}
            <aside className="gallery-right-panel">
              
              {/* Add memory CTA */}
              <button
                className="gallery-add-memory-btn"
                onClick={handleUploadClick}
                disabled={uploading || !selectedEventId}
                style={{ width: '100%', marginBottom: 16 }}
              >
                <CameraIcon /> {uploading ? 'Uploading...' : 'Add Your Memory'}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,video/*"
                onChange={handleFileChange}
              />

              {/* Event timeline */}
              <div className="gallery-panel-card">
                <div className="gallery-panel-heading">
                  <SparkleIcon /> Event Details
                </div>
                {selectedEvent ? (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                    <div>
                      <strong>Venue:</strong> {selectedEvent.venueName || 'Not Specified'}
                    </div>
                    <div>
                      <strong>Address:</strong> {selectedEvent.address || 'Not Specified'}
                    </div>
                    <div>
                      <strong>Date:</strong> {new Date(selectedEvent.startDate).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-light)' }}>No active event selected.</p>
                )}
                <button className="gallery-recap-btn" style={{ marginTop: 16 }} onClick={() => navigate('/timeline')}>
                  View Full Timeline
                </button>
              </div>

              {/* Print album upsell */}
              <div className="gallery-panel-card gallery-panel-dark">
                <h4 className="gallery-panel-dark-title">Order Print Album</h4>
                <p className="gallery-panel-dark-sub">
                  AI-curated physical memories, delivered in{' '}
                  <span className="gallery-gold-link">premium gold foil</span>.
                </p>
                <button className="gallery-get-started-btn">Get Started</button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}