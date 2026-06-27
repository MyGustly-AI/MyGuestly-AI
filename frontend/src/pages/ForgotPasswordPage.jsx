import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { forgotPasswordRequest } from '../api/auth';
import { ApiError } from '../api/client';
import './AuthPages.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPasswordRequest({ email });
      setSent(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-centered">
      <div className="auth-box">
        <div className="auth-box-logo"><Logo /></div>
        <h2 className="auth-heading">Forgot Password</h2>
        <p className="auth-sub">
          {sent
            ? 'Check your inbox for a link to reset your password.'
            : "Enter the email on your account and we'll send a reset link."}
        </p>

        {!sent ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label className="label">Email Address</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                  className="input-field input-with-icon"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="auth-bottom-text">Remembered it? <Link to="/login" className="auth-link">Back to Sign In</Link></p>
          </form>
        ) : (
          <p className="auth-bottom-text">
            <Link to="/login" className="auth-link">Back to Sign In</Link>
          </p>
        )}
      </div>
    </div>
  );
}
