import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { resetPasswordRequest } from '../api/auth';
import { ApiError } from '../api/client';
import './AuthPages.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('This reset link is invalid or missing a token. Request a new one.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPasswordRequest({ token, newPassword });
      setDone(true);
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
        <h2 className="auth-heading">Reset Password</h2>
        <p className="auth-sub">
          {done ? 'Your password has been reset.' : 'Choose a new password for your account.'}
        </p>

        {!done ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            {!token && (
              <div className="auth-error">
                No reset token found in this link. Use the link from your email, or{' '}
                <Link to="/forgot-password" className="auth-link">request a new one</Link>.
              </div>
            )}

            <div className="form-group">
              <label className="label">New Password</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  className="input-field input-with-icon"
                  type="password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Confirm New Password</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  className="input-field input-with-icon"
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary auth-submit" disabled={submitting || !token}>
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <button type="button" className="btn-primary auth-submit" onClick={() => navigate('/login')}>
            Continue to Sign In
          </button>
        )}
      </div>
    </div>
  );
}
