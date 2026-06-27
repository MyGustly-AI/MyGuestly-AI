<<<<<<< HEAD
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
=======
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { createEventRequest, publishEventRequest } from "../api/events";
import "./CreateEventPage.css";

const categories = [
  { label: "Wedding", icon: <HeartIcon /> },
  { label: "Gala", icon: <StarIcon /> },
  { label: "Birthday", icon: <CakeIcon /> },
  { label: "Corporate", icon: <BriefIcon /> },
  { label: "Church", icon: <ChurchIcon /> },
];

const themeColors = ["#7C3AED", "#D4A017", "#E11D48", "#1D4ED8"];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("Wedding");
  const [color, setColor] = useState("#7C3AED");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  const [maxGuests, setMaxGuests] = useState("");
>>>>>>> in
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
<<<<<<< HEAD
=======
    console.log("Create Event submit triggered");
    setError(null);

    const missing = [];
    if (!title.trim()) missing.push("Event Name");
    if (!venueName.trim()) missing.push("Venue Name");
    if (!address.trim()) missing.push("Address");
    if (!date) missing.push("Date");
    if (!startTime) missing.push("Start Time");
    if (!endTime) missing.push("End Time");
    if (!maxGuests) missing.push("Maximum Guests");

    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const startDate = new Date(`${date}T${startTime}:00`);
    const endDate = new Date(`${date}T${endTime}:00`);

    if (endDate <= startDate) {
      setError("End time must be after start time.");
      return;
    }

>>>>>>> in
    setSubmitting(true);
    setError(null);
    
    try {
<<<<<<< HEAD
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
=======
      const event = await createEventRequest({
        title,
        description,
        eventCategory: category,
        venueName,
        address,
        coverUrl: coverPreview || "",
        themeAccent: color,
        rsvpDeadline: rsvpDeadline
          ? new Date(rsvpDeadline).toISOString()
          : null,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        maxGuests: Number(maxGuests),
        location: address,
      });

      const eventId = event?.id ?? event?.data?.id;

      try {
        await publishEventRequest(eventId);
      } catch (publishErr) {
        setError(
          "Event was created but could not be published. You can publish it from the dashboard.",
        );
      }

      navigate("/host/invitation", { state: { eventId } });
    } catch (err) {
      setError(
        err.message ||
          "Could not create event. Please check your details and try again.",
      );
>>>>>>> in
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
<<<<<<< HEAD
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
=======
      <Sidebar role="host" />
      <main className="main-content">
        <div className="create-event-outer">
          <div className="create-event-header">
            <h2 className="create-event-title">Create Your Event</h2>
            <p className="create-event-sub">
              Design an unforgettable experience. Fill in the details below to
              bring your celebration to life.
            </p>
          </div>

          <form className="create-event-form card" onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label className="label">Event Name</label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g., The Buckingham Winter Gala"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">Event Category</label>
              <div className="category-grid">
                {categories.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    className={`category-btn ${category === c.label ? "active" : ""}`}
                    onClick={() => setCategory(c.label)}
                  >
                    <span className="cat-icon">{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Description</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Share the charm and detail of your event presentation"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="label">Venue Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g., Grand Ballroom, Oriental Hotel"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="label">Date</label>
                <input
                  className="input-field"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="label">RSVP Deadline</label>
                <input
                  className="input-field"
                  type="date"
                  value={rsvpDeadline}
                  onChange={(e) => setRsvpDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Address</label>
              <div className="input-icon-wrap">
                <svg
                  className="input-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  className="input-field input-with-icon"
                  type="text"
                  placeholder="Enter full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Start Time</label>
                <input
                  className="input-field"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="label">End Time</label>
                <input
                  className="input-field"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Maximum Guests</label>
              <input
                className="input-field"
                type="number"
                min="1"
                max="10000"
                placeholder="e.g., 300"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">Personalisation</label>
              <div className="personalisation-row">
                <div
                  className="upload-box"
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (!file) return;
                    setCoverImage(file);
                    setCoverPreview(URL.createObjectURL(file));
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleCoverImageChange}
                  />
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <>
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        style={{ color: "var(--text-light)" }}
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21,15 16,10 5,21" />
                      </svg>
                      <span>Upload Event Cover Image</span>
                      <small>Click to upload or drag &amp; drop</small>
                    </>
                  )}
                </div>
                <div className="theme-accent">
                  <label className="label">Theme Accent</label>
                  <div className="color-swatches">
                    {themeColors.map((c) => (
>>>>>>> in
                      <button
                        key={cat}
                        type="button"
<<<<<<< HEAD
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
=======
                        className={`color-swatch ${color === c ? "active" : ""}`}
                        style={{ background: c }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                  <div className="color-input-row">
                    <div
                      className="color-preview"
                      style={{ background: color }}
>>>>>>> in
                    />
                  </div>
                </div>
              </div>

<<<<<<< HEAD
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
=======
            <button
              type="submit"
              className="btn-primary create-event-submit"
              disabled={submitting}
            >
              {submitting ? "Creating Event..." : "Create Event"}
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: "11px",
                color: "var(--text-light)",
                marginTop: 8,
              }}
            >
              By creating an event, you agree to our{" "}
              <a href="#" style={{ color: "var(--primary)" }}>
                Terms of Service
              </a>
            </p>
          </form>
>>>>>>> in
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

function HeartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function CakeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
      <path d="M2 21h20" />
      <path d="M7 8v1" />
      <path d="M12 8v1" />
      <path d="M17 8v1" />
      <path d="M7 4h.01" />
      <path d="M12 4h.01" />
      <path d="M17 4h.01" />
    </svg>
  );
}
function BriefIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
function ChurchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
    </svg>
  );
}
>>>>>>> in
