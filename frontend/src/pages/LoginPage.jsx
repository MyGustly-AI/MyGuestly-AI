// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import AppleAuthButton from '../components/AppleAuthButton';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login({ email, password });
      if (user?.role === 'GUEST' || user?.role === 'guest') {
        navigate('/guest/dashboard');
      } else {
        navigate('/host/dashboard');
      }
    } catch (err) {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-centered">
      <div className="auth-box">
        <div className="auth-box-logo">
          <h1 className="auth-logo-text">MyGuestly AI</h1>
        </div>
        <h2 className="auth-heading">Welcome Back</h2>
        <p className="auth-sub">Join the celebration of intelligence and hospitality.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="label">Email Address</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="auth-row">
            <label className="checkbox-label">
              <input type="checkbox" disabled={submitting} /> Stay signed in
            </label>
            <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={submitting}>
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="auth-divider"><span>OR CONTINUE WITH</span></div>

          <div className="auth-socials">
            <GoogleAuthButton disabled={submitting} />
            <AppleAuthButton disabled={submitting} />
          </div>

          <p className="auth-bottom-text">
            New to MyGuestly AI? <Link to="/signup" className="auth-link">Create account</Link>
          </p>
        </form>
      </div>

      <footer className="auth-footer">
        <span>© 2026 MyGuestly AI, Lagosian Vibrancy, Global Sophistication</span>
        <div className="auth-footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
          <a href="#">Event Hosting Board</a>
        </div>
      </footer>
    </div>
  );
    }
