import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';
import './HostSignUppagee.css';

const HOST_TYPES = [
  'Wedding Planner',
  'Corporate Organiser',
  'Venue Manager',
  'Church / Religious',
  'Private Individual',
  'Event Professional',
];

export default function HostSignUpPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('Wedding Planner');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    if (!agreed) return;
    navigate('/host/dashboard');
  };

  return (
    <div className="auth-page auth-split">

      {/* ── LEFT PANEL ── */}
      <div className="auth-split-left">
        <img src="/Host-sign-up.png" alt="Luxury event with flowers" />
        <div className="auth-split-left-overlay">

          <div className="auth-split-badge">The Host Network</div>

          <h2 className="auth-split-headline">
            Elevate Every<br />Celebration.
          </h2>

          <p className="auth-split-sub">
            Transform your venue or services into a premium experience.
            Access a curated audience of distinguished guests.
          </p>

          {/* Social-proof card */}
          <div className="auth-split-proof-card">
            <div className="proof-card-left">
              <div className="proof-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#D4A017" stroke="#D4A017" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <span className="proof-icon-label">stars</span>
              </div>
            </div>
            <div className="proof-card-right">
              <span className="proof-number">500+</span>
              <span className="proof-label">Premium Hosts in Lagos</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-split-right">
        <div className="auth-box">

          <h2 className="auth-heading">Become a Host</h2>
          <p className="auth-sub">Sign up to start creating unforgettable experiences.</p>

          <div className="auth-form">

            {/* Google button */}
            <button className="social-btn google-btn">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>

            <div className="auth-divider"><span>OR WITH EMAIL</span></div>

            {/* Host type selector */}
            <div className="form-group">
              <label className="label">What type of host are you?</label>
              <div className="host-type-grid">
                {HOST_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`host-type-btn${selectedType === type ? ' active' : ''}`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label className="label">Full Name</label>
              <input className="input-field" type="text" placeholder="Adewale Jackson" />
            </div>

            {/* Company */}
            <div className="form-group">
              <label className="label">Company / Organisation Name</label>
              <input className="input-field" type="text" placeholder="Enter your company name" />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="label">Email Address</label>
              <input className="input-field" type="email" placeholder="host@myguestly.ai" />
            </div>

            {/* Phone + Password row */}
            <div className="form-row">
              <div className="form-group">
                <label className="label">Phone Number</label>
                <input className="input-field" type="tel" placeholder="+234 ..." />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <input className="input-field" type="password" placeholder="••••••••" />
              </div>
            </div>

            {/* Agree checkbox */}
            <div className="agree-row">
              <input
                id="agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="agree">
                I agree to the{' '}
                <a href="/terms" className="auth-link">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="auth-link">Privacy Policy</a>
              </label>
            </div>

            {/* CTA */}
            <button
              type="button"
              className="btn-primary auth-submit"
              onClick={handleSubmit}
            >
              Create Host Account
            </button>

            {/* Bottom social proof */}
            <div className="auth-social-proof">
              <p className="proof-quote">
                "Join 500+ premium hosts in Lagos creating unforgettable experiences."
              </p>
              <div className="proof-avatars-row">
                <div className="proof-avatars">
                  <img src="https://placehold.co/28x28/4B0082/fff?text=H" alt="Host" />
                  <img src="https://placehold.co/28x28/7C3AED/fff?text=H" alt="Host" />
                  <img src="https://placehold.co/28x28/D4A017/fff?text=H" alt="Host" />
                </div>
                <span className="proof-count-badge">+497</span>
              </div>
            </div>

            {/* Sign in link */}
            <p className="auth-bottom-text">
              Already have an account?{' '}
              <a href="/login" className="auth-link">Sign In</a>
            </p>

          </div>
        </div>
      </div>

    </div>
  );
}