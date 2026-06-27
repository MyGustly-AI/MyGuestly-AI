// src/pages/CreateEventPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { createEventRequest } from '../api/events';
import { api } from '../api/client';
import './CreateEventPage.css';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventName: '',
    category: '',
    description: '',
    venueName: '',
    address: '',
    startTime: '',
    endTime: '',
    maxGuests: '',
    themeAccent: '#4B0082'
  });
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const categories = ['Wedding', 'Gala', 'Birthday', 'Corporate', 'Church'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      let finalCoverUrl = '';

      if (coverImage) {
        // 1. Fetch pre-signed upload signature from backend using temporary ID "temp"
        const uploadUrlData = await api.get('/events/temp/media/upload-url');
        const { uploadUrl, signature, timestamp, apiKey, folder } = uploadUrlData;

        // 2. Upload cover image directly to Cloudinary
        const formDataUpload = new FormData();
        formDataUpload.append('file', coverImage);
        formDataUpload.append('api_key', apiKey);
        formDataUpload.append('timestamp', timestamp);
        formDataUpload.append('signature', signature);
        formDataUpload.append('folder', folder);

        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          body: formDataUpload,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload cover image to Cloudinary');
        }

        const uploadData = await uploadRes.json();
        finalCoverUrl = uploadData.secure_url;
      }

      await createEventRequest({
        title: formData.eventName,
        description: formData.description || '',
        eventCategory: formData.category,
        venueName: formData.venueName,
        address: formData.address,
        coverUrl: finalCoverUrl,
        themeAccent: formData.themeAccent,
        startDate: new Date(formData.startTime).toISOString(),
        endDate: new Date(formData.endTime).toISOString(),
        maxGuests: parseInt(formData.maxGuests, 10),
      });

      navigate('/host/dashboard');
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.message || 'Error creating event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-inner">
          <div className="create-event-container">
            {/* Header */}
            <div className="event-header">
              <div>
                <h1 className="event-title">Create Your Event</h1>
                <p className="event-subtitle">
                  Design an unforgettable experience. Fill in the details below to bring your celebration to life.
                </p>
              </div>
              <button 
                className="btn-outline"
                onClick={() => navigate('/host/dashboard')}
              >
                ← Dashboard
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="event-form">
              {error && (
                <div className="auth-error" style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  width: '100%',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
              {/* Row 1: Event Name & Category */}
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Event Name</label>
                  <input
                    className="input-field"
                    type="text"
                    name="eventName"
                    placeholder="e.g., The Buckingham Winter Gala"
                    value={formData.eventName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Event Category</label>
                  <div className="category-grid">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        className={`category-btn ${formData.category === cat ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Description */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="label">Description</label>
                  <textarea
                    className="input-field"
                    name="description"
                    placeholder="Share the charm and detail of your event presentation"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Row 3: Venue & Address */}
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Venue Name</label>
                  <input
                    className="input-field"
                    type="text"
                    name="venueName"
                    placeholder="e.g., Grand Ballroom, Oriental Hotel"
                    value={formData.venueName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Address</label>
                  <input
                    className="input-field"
                    type="text"
                    name="address"
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Row 4: Time & Guests */}
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Start Time</label>
                  <input
                    className="input-field"
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="label">End Time</label>
                  <input
                    className="input-field"
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Maximum Guests</label>
                  <input
                    className="input-field"
                    type="number"
                    name="maxGuests"
                    placeholder="e.g., 300"
                    min="1"
                    value={formData.maxGuests}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Row 5: Image Upload */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="label">Upload Event Cover Image</label>
                  <div 
                    className={`image-upload-area ${previewUrl ? 'has-image' : ''}`}
                    onClick={() => document.getElementById('coverImage').click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Event cover" className="cover-preview" />
                    ) : (
                      <>
                        <svg className="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p>Click to upload or drag & drop</p>
                        <span className="upload-hint">PNG, JPG up to 5MB</span>
                      </>
                    )}
                    <input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Theme Accent */}
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Theme Accent</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      name="themeAccent"
                      value={formData.themeAccent}
                      onChange={handleChange}
                      className="color-picker"
                    />
                    <span className="color-hex">{formData.themeAccent}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-ghost"
                  onClick={() => navigate('/host/dashboard')}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating Event...' : 'Create Event'}
                </button>
              </div>

              <p className="form-terms">
                By creating an event, you agree to our <a href="#">Terms of Service</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
