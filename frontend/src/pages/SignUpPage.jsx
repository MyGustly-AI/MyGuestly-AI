import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import './AuthPages.css';

export default function SignUpPage() {
  const navigate = useNavigate();
  return (
    <div className="auth-page auth-split">
      <div className="auth-split-left">
        <img src="/Sign-up.png" alt="Elegant event venue" />
        <div className="auth-split-left-overlay">
          <div className="auth-split-badge">Excellence in Events</div>
          <h2 className="auth-split-headline">Elevating every moment into a masterpiece.</h2>
          <p className="auth-split-sub">Experience the pinnacle of event management with AI-driven sophistication and royal excellence.</p>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-box">
          <h2 className="auth-heading">Join the future of event</h2>
          <p className="auth-sub">Create your prestigious account and start curating unforgettable experiences.</p>

          <div className="auth-form">
            <div className="auth-socials">
              <button className="social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button className="social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Apple
              </button>
            </div>
            <div className="auth-divider"><span>OR</span></div>
            <div className="form-group">
              <label className="label">Full Name</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input className="input-field input-with-icon" type="text" placeholder="Your full name" />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Email Address</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input className="input-field input-with-icon" type="email" placeholder="you@example.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Phone Number</label>
              <div className="input-icon-wrap">
              <svg
               className="input-icon"width="16"height="16"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2">
               <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.15 8.81 19.8 19.8 0 0 1 .08 3.18 2 2 0 0 1 2.06 1h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.59 2.5a2 2 0 0 1-.45 2.11L6.1 8.9a16 16 0 0 0 6.9 6.9l1.57-1.1a2 2 0 0 1 2.11-.45c.8.27 1.64.47 2.5.59A2 2 0 0 1 22 16.92z"/>
              </svg>
                <input className="input-field input-with-icon" type="tel" placeholder="+234 *** *** ****" />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input className="input-field input-with-icon" type="password" placeholder="••••••••••••" />
              </div>
            </div>
            <div className="agree-row">
              <input type="checkbox" style={{ marginTop: 2 }} />
              <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
            </div>
            <button className="btn-primary auth-submit" onClick={() => navigate('/host/dashboard')}>CREATE MY ACCOUNT</button>
            <p className="auth-bottom-text">Already a member? <Link to="/login" className="auth-link">Sign In</Link></p>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: -350, left: 0, right: 0, fontSize: '11px', color: 'var(--text-light)' }}>
        © 2026 MyGuestly AI, Lagosian Vibrancy, Global Sophistication
      </div>
    </div>
  );
}
