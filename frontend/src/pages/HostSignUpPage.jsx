import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleAuthButton from '../components/GoogleAuthButton';
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
            <GoogleAuthButton label="Sign up with Google" />

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