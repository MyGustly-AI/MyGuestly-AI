import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import './OnboardingPage.css';

export default function OnboardingPage() {
  const navigate = useNavigate();
  return (
    <div className="onboarding">
      <header className="onboarding-header">
        <nav className="onboarding-nav">
          <Logo />
          <div className="onboarding-nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/host/home" className="nav-link">Events</a>
            <a href="/gallery" className="nav-link">Galleries</a>
          </div>
          <div className="onboarding-nav-right">
            <a href="#" className="nav-link">Help</a>
            <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }} onClick={() => navigate('/login')}>Sign In</button>
          </div>
        </nav>
      </header>

      <main className="onboarding-main">
        <div className="onboarding-bg">
          <img src="https://placehold.co/1440x700/1a0a2e/7C3AED?text=Celebration+Background" alt="Elegant celebration background" className="onboarding-bg-img" />
          <div className="onboarding-bg-overlay" />
        </div>

        <div className="onboarding-content">
          <div className="section-tag" style={{ justifyContent: 'center', marginBottom: '8px' }}>Welcome to Prestige</div>
          <h1 className="onboarding-heading">
            A Celebration of <em className="onboarding-italic">Connection</em>
          </h1>
          <p className="onboarding-sub">
            Whether you are orchestrating an unforgettable gala or joining as an honored guest, your journey begins here.
          </p>

          <div className="onboarding-cards">
            <div className="onboarding-card">
              <div className="onboarding-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
              </div>
              <h3 className="onboarding-card-title">Enter as Host</h3>
              <p className="onboarding-card-desc">The ultimate suite for creators. Manage premium invitations, track real-time RSVPs, and curate exclusive memory galleries for your guests.</p>
              <button className="btn-primary onboarding-card-btn" onClick={() => navigate('/host-signup')}>Create Event</button>
              <button className="onboarding-card-link" onClick={() => navigate('/host/dashboard')}>Sign In to Dashboard</button>
            </div>

            <div className="onboarding-card">
              <div className="onboarding-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="onboarding-card-title">Enter as Guest</h3>
              <p className="onboarding-card-desc">Your VIP pass to every occasion. Access your personal invitations, secure event tickets, and share photos from the most memorable nights.</p>
              <button className="btn-outline onboarding-card-btn" onClick={() => navigate('/guest/dashboard')}>Access Invitation</button>
              <button className="onboarding-card-link" onClick={() => navigate('/signup')}>Sign In / Sign Up</button>
            </div>
          </div>

          <div className="onboarding-dots">
            <span className="dot active" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
      </main>

      <footer className="onboarding-footer">
        <Logo size="sm" />
        <div className="onboarding-footer-links">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Contact Us</a>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>© 2026. MyGuestly AI. All rights reserved.</span>
      </footer>
    </div>
  );
}
