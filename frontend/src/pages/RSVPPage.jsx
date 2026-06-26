import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvitationRequest, submitRsvpRequest } from '../api/guests';
import './RSVPPage.css';

export default function RSVPPage() {
  const { eventCode, token } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getInvitationRequest(token);
        setInvitation(data);
        if (data.status) {
          const statusMap = { ACCEPTED: 'YES', DECLINED: 'NO', PENDING: 'MAYBE' };
          setSelectedStatus(statusMap[data.status] || 'MAYBE');
        }
      } catch (err) {
        setError(err.message || 'Could not load invitation details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitRsvpRequest(token, selectedStatus);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit RSVP.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rsvp-loading-screen">
        <div className="rsvp-spinner" />
        <p>Loading your personal invitation...</p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="rsvp-error-screen">
        <div className="rsvp-error-card">
          <svg className="error-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h2>Invitation Unreachable</h2>
          <p>{error}</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Return to Homepage</button>
        </div>
      </div>
    );
  }

  const { event, guest } = invitation || {};

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rsvp-page-container">
      <div className="rsvp-card">
        <div className="rsvp-header-banner">
          <div className="rsvp-badge">YOU'RE INVITED</div>
        </div>

        <div className="rsvp-content">
          {submitted ? (
            <div className="rsvp-success-view">
              <div className="success-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20,6 9,17 -5,-5"/></svg>
              </div>
              <h2>Response Registered!</h2>
              <p className="success-text">
                Thank you, <strong>{guest?.fullName}</strong>. Your RSVP response has been submitted to the host.
              </p>
              <div className="rsvp-event-summary">
                <h4>{event?.title}</h4>
                <p>{formatDate(event?.startDate)}</p>
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/login')}>
                Sign In to MyGuestly
              </button>
            </div>
          ) : (
            <>
              <h1 className="rsvp-title">{event?.title}</h1>
              <p className="rsvp-host-info">
                Hosted by <strong>{invitation.event?.host?.fullName || 'the Organizer'}</strong>
              </p>

              <div className="rsvp-guest-greeting">
                Hello <strong>{guest?.fullName}</strong>, you have been cordially invited to celebrate with us. Please confirm your attendance below.
              </div>

              <div className="rsvp-details-grid">
                <div className="rsvp-detail-item">
                  <div className="detail-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
                  <div>
                    <div className="detail-label">Starts</div>
                    <div className="detail-value">{formatDate(event?.startDate)}</div>
                  </div>
                </div>

                <div className="rsvp-detail-item">
                  <div className="detail-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div>
                  <div>
                    <div className="detail-label">Ends</div>
                    <div className="detail-value">{formatDate(event?.endDate)}</div>
                  </div>
                </div>
              </div>

              {error && <div className="auth-error" style={{ marginTop: 16 }}>{error}</div>}

              <div className="rsvp-options-container">
                <h3 className="rsvp-options-title">Select Your Status</h3>
                <div className="rsvp-options-grid">
                  <button
                    className={`rsvp-opt-btn accept ${selectedStatus === 'YES' ? 'selected' : ''}`}
                    onClick={() => setSelectedStatus('YES')}
                  >
                    <span className="opt-indicator" />
                    <span className="opt-text">Attending</span>
                  </button>

                  <button
                    className={`rsvp-opt-btn decline ${selectedStatus === 'NO' ? 'selected' : ''}`}
                    onClick={() => setSelectedStatus('NO')}
                  >
                    <span className="opt-indicator" />
                    <span className="opt-text">Declined</span>
                  </button>

                  <button
                    className={`rsvp-opt-btn tentative ${selectedStatus === 'MAYBE' ? 'selected' : ''}`}
                    onClick={() => setSelectedStatus('MAYBE')}
                  >
                    <span className="opt-indicator" />
                    <span className="opt-text">Tentative</span>
                  </button>
                </div>
              </div>

              <button
                className="btn-primary rsvp-submit-btn"
                disabled={!selectedStatus || submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Registering Response...' : 'Submit RSVP'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
