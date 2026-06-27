<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { listEventsRequest } from '../api/events';
import { listGuestsRequest, addGuestRequest } from '../api/guests';
import './InvitationPage.css';
=======
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  listGuestsRequest,
  addGuestRequest,
  importGuestsRequest,
  sendAllInvitesRequest,
} from "../api/guests";
import "./InvitationPage.css";
>>>>>>> in

export default function InvitationPage() {
  const navigate = useNavigate();
  const location = useLocation();
<<<<<<< HEAD

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(location.state?.eventId || '');
  const [guests, setGuests] = useState([]);
  const [step] = useState(2);

  // States for input form
  const [fullName, setFullName] = useState('');
  const [contactInput, setContactInput] = useState('');
  
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch events list on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await listEventsRequest();
        const eventList = data?.data || data || [];
        setEvents(eventList);
        if (!selectedEventId && eventList.length > 0) {
          setSelectedEventId(eventList[0].id);
        }
      } catch (err) {
        setError(err.message || 'Could not load events.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedEventId]);

  // Fetch guest list when selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) return;

    (async () => {
      setLoading(true);
      try {
        const data = await listGuestsRequest(selectedEventId);
        setGuests(data?.data || data || []);
      } catch (err) {
        setError(err.message || 'Could not load guest list.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedEventId]);

  // Handle Manual Add Guest
  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Please enter a guest name.');
      return;
    }
    if (!contactInput.trim()) {
      alert('Please enter either an email or phone number.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = { fullName: fullName.trim() };
      const isEmail = contactInput.includes('@');
      if (isEmail) {
        payload.email = contactInput.trim();
      } else {
        // Assume phone format otherwise
        payload.phone = contactInput.trim();
      }

      const response = await addGuestRequest(selectedEventId, payload);
      const newGuest = response?.guest || response;

      // Update local state list
      setGuests((prev) => [newGuest, ...prev]);

      // Clear input fields
      setFullName('');
      setContactInput('');
    } catch (err) {
      alert(err.message || 'Failed to add guest.');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);
=======
  const eventId = location.state?.eventId;

  const [step, setStep] = useState(2);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  const [importing, setImporting] = useState(false);
  const [invitingAll, setInvitingAll] = useState(false);
  const fileInputRef = useRef(null);

  const loadGuests = async () => {
    if (!eventId) return;
    try {
      const result = await listGuestsRequest(eventId, { limit: 4 });
      const list = result?.data ?? result?.guests ?? result ?? [];
      setGuests(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Could not load guests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      setError("No event selected. Please create an event first.");
      return;
    }
    loadGuests();
  }, [eventId]);

  const handleAddGuest = async () => {
    if (!fullName.trim() || !contact.trim()) return;
    setAddError(null);
    setAdding(true);
    try {
      const isEmail = contact.includes("@");
      await addGuestRequest(eventId, {
        fullName,
        email: isEmail ? contact : undefined,
        phone: isEmail ? undefined : contact,
      });
      setFullName("");
      setContact("");
      await loadGuests();
    } catch (err) {
      setAddError(err.message || "Could not add guest.");
    } finally {
      setAdding(false);
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file || !eventId) return;
    setImporting(true);
    setError(null);
    try {
      await importGuestsRequest(eventId, file);
      await loadGuests();
    } catch (err) {
      setError(err.message || "Could not import guest list.");
    } finally {
      setImporting(false);
    }
  };

  const handleInviteAll = async () => {
    if (!eventId) return;
    setInvitingAll(true);
    setError(null);
    try {
      await sendAllInvitesRequest(eventId);
      await loadGuests();
    } catch (err) {
      setError(err.message || "Could not send invitations.");
    } finally {
      setInvitingAll(false);
    }
  };

  const totalGuests = guests.length;
  const confirmedGuests = guests.filter((g) => g.status === "RSVP_CONFIRMED" || g.status === "RSVP Confirmed").length;
>>>>>>> in

  return (
    <div className="app-layout">
      <Sidebar role="host" />
      <main className="main-content">
        <div className="page-inner invitation-outer">
          <div className="invitation-header">
            <h1 className="page-heading">Host Your Masterpiece</h1>
<<<<<<< HEAD
            <p className="page-sub">
              {selectedEvent
                ? `Let's curate your guest list for ${selectedEvent.title}.`
                : 'Select an event to invite guests.'}
            </p>
=======
            <p className="page-sub">Let's curate your guest list for your event.</p>
>>>>>>> in
          </div>

          <div className="stepper">
            {["Event Details", "Design Invitation", "Guest List"].map((s, i) => (
              <React.Fragment key={i}>
                <div className={`step ${step > i ? "done" : step === i ? "active" : ""}`}>
                  <div className="step-circle">
                    {step > i ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="step-label">{s}</span>
                </div>
                {i < 2 && <div className={`step-line ${step > i ? "done" : ""}`} />}
              </React.Fragment>
            ))}
          </div>

          {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="invitation-cols">
<<<<<<< HEAD
            {/* Import Guests */}
            <form className="card invitation-import" onSubmit={handleAddGuest}>
              <h3 className="inv-section-title">Import Guests</h3>
              <p className="inv-section-sub">Quickly invite guests by adding details manually below.</p>
              
=======
            <div className="card invitation-import">
              <h3 className="inv-section-title">Import Guests</h3>
              <p className="inv-section-sub">Drag and drop your file here or browse files.</p>
              <div className="upload-drop">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-light)" }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17,8 12,3 7,8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p>{importing ? "Importing..." : "Upload CSV or Excel"}</p>
                <small>Drag and drop your file here</small>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={handleFileSelected}
                />
                <button
                  className="btn-outline"
                  style={{ marginTop: 10, fontSize: 12, padding: "8px 18px" }}
                  onClick={() => fileInputRef.current.click()}
                  disabled={importing || !eventId}
                >
                  Browse Files
                </button>
              </div>
              <div className="inv-divider"><span>OR MANUALLY ADD</span></div>
              {addError && <div className="auth-error" style={{ marginBottom: 10 }}>{addError}</div>}
>>>>>>> in
              <div className="form-group">
                <label className="label">Full Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g., Adequate S. Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
<<<<<<< HEAD
                  required
=======
>>>>>>> in
                />
              </div>
              <div className="form-group" style={{ marginTop: 10 }}>
                <label className="label">Email or Phone</label>
                <input
                  className="input-field"
                  type="text"
<<<<<<< HEAD
                  placeholder="email@example.com or +23480..."
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                disabled={actionLoading || !selectedEventId}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                {actionLoading ? 'Inviting Guest...' : 'Add Guest'}
=======
                  placeholder="email@example.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>
              <button
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
                onClick={handleAddGuest}
                disabled={adding || !eventId}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                {adding ? "Adding..." : "Add Guest"}
>>>>>>> in
              </button>
            </form>

            <div className="card invitation-list">
              <div className="inv-list-header">
                <div>
<<<<<<< HEAD
                  <h3 className="inv-section-title">Guests ({guests.length})</h3>
                  <p className="inv-section-sub">
                    {guests.filter((g) => g.invitation?.status === 'ACCEPTED').length} guests already accepted digital invitations.
                  </p>
                </div>
                {events.length > 1 && (
                  <select
                    className="input-field"
                    style={{ width: 180, fontSize: 11, height: 32, padding: '0 8px' }}
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
=======
                  <h3 className="inv-section-title">Guests ({totalGuests})</h3>
                  <p className="inv-section-sub">{confirmedGuests} guests already using your digital invitations.</p>
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: 12, padding: "8px 14px" }}
                  onClick={handleInviteAll}
                  disabled={invitingAll || !eventId || totalGuests === 0}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {invitingAll ? "Sending..." : "Invite All"}
                </button>
>>>>>>> in
              </div>
              <div className="inv-table">
                <div className="inv-table-head">
                  <span>Guest Name</span>
                  <span>Contact</span>
                  <span>Status</span>
                </div>
<<<<<<< HEAD
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                    Loading guests...
                  </div>
                ) : guests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                    No guests invited yet.
                  </div>
                ) : (
                  guests.slice(0, 5).map((g, i) => {
                    const status = g.invitation?.status || 'PENDING';
                    const init = g.fullName ? g.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'G';
                    return (
                      <div key={g.id || i} className="inv-table-row">
                        <div className="inv-guest">
                          <div className="inv-avatar">{init}</div>
                          <span className="inv-name">{g.fullName}</span>
                        </div>
                        <span className="inv-contact">{g.email || g.phone}</span>
                        <span
                          className={`badge ${
                            status === 'ACCEPTED' || status === 'CHECKED_IN'
                              ? 'badge-success'
                              : status === 'PENDING'
                              ? 'badge-purple'
                              : 'badge-danger'
                          }`}
                        >
                          {status === 'ACCEPTED' ? 'RSVP Confirmed' : status === 'PENDING' ? 'Invitation Sent' : 'RSVP Declined'}
                        </span>
                      </div>
                    );
                  })
                )}
                <button
                  className="view-all-btn"
                  style={{ margin: '10px auto', display: 'block' }}
                  onClick={() => navigate('/host/guest-list')}
                  disabled={!selectedEventId}
                >
=======

                {loading && <p style={{ padding: 16, color: "var(--text-light)" }}>Loading guests...</p>}

                {!loading && totalGuests === 0 && (
                  <p style={{ padding: 16, color: "var(--text-light)" }}>No guests added yet.</p>
                )}

                {!loading &&
                  guests.map((g, i) => (
                    <div key={g.id || i} className="inv-table-row">
                      <div className="inv-guest">
                        <div className="inv-avatar">
                          {(g.fullName || g.name || "?")
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="inv-name">{g.fullName || g.name}</span>
                      </div>
                      <span className="inv-contact">{g.email || g.phone || g.contact}</span>
                      <span className={`badge ${g.status === "RSVP_CONFIRMED" || g.status === "RSVP Confirmed" ? "badge-success" : "badge-purple"}`}>
                        {g.status === "RSVP_CONFIRMED" ? "RSVP Confirmed" : g.status || "Invitation Pending"}
                      </span>
                    </div>
                  ))}

                <button className="view-all-btn" style={{ margin: "10px auto", display: "block" }} onClick={() => navigate("/host/guest-list", { state: { eventId } })}>
>>>>>>> in
                  View All Guests
                </button>
              </div>
            </div>
          </div>

          <div className="inv-step-nav">
            <button className="btn-ghost" onClick={() => navigate("/host/create-event")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Previous Step
            </button>
            <button className="btn-primary" onClick={() => navigate("/host/guest-list", { state: { eventId } })}>
              Review & Finalise
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}