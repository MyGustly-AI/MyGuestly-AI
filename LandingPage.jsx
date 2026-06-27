import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import Logo from '../components/Logo';

// ─── Small reusable icons ────────────────────────────────────────────────────

function InviteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function QRIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <rect x="14" y="14" width="3" height="3"/>
      <rect x="18" y="14" width="3" height="3"/>
      <rect x="14" y="18" width="3" height="3"/>
      <rect x="18" y="18" width="3" height="3"/>
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="9" rx="1"/>
      <rect x="14" y="3" width="7" height="5" rx="1"/>
      <rect x="14" y="12" width="7" height="9" rx="1"/>
      <rect x="3" y="16" width="7" height="5" rx="1"/>
    </svg>
  );
}

function CultureIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Logo />
          <ul className="navbar-links">
            <li><a href="#features" className="nav-link nav-link--active">Features</a></li>
            <li><a href="/how-it-works" className="nav-link">How It Works</a></li>
            <li><a href="/pricing" className="nav-link">Pricing</a></li>
          </ul>
          {/*<div className="navbar-actions">
            <button className="btn-ghost-nav" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn-primary-nav" onClick={() => navigate('signup')}>Sign Up</button>
          </div>*/}
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <img src="/hero-img.png" alt="Elegant event venue" className="hero-img" />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            Elevating Exclusivity
          </div>
          <h1 className="hero-heading">
            Smarter Event Hosting,<br />
            <em className="hero-italic">Beautiful Memories.</em>
          </h1>
          <p className="hero-sub">
            Experience the future of high-end events in Lagos and beyond. MyGuestly AI
            blends Royal sophistication with seamless technology to manage your guest
            list with grace.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/signup')}>
              Get Started
            </button>
            <button className="btn-ghost" onClick={() => navigate('/login')}>
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* ── Trusted Strip ──────────────────────────────────────────────── */}
      <section className="trusted-strip">
        <div className="trusted-inner">
          <p className="trusted-label">TRUSTED BY LAGOS' ELITE EVENT PLANNERS</p>
          <div className="trusted-logos">
            <span>EkoPlanners</span>
            <span>Royal Events</span>
            <span>GalaMasters</span>
            <span>Vanguard Hosting</span>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section className="features-section" id="features">
        <div className="features-inner">

          <div className="features-header">
            <div className="section-tag">Precision Planning</div>
            <h2 className="section-heading">Precision Planning for Every Guest</h2>
            <p className="section-sub">
              Luxury is in the details. MyGuestly AI handles the complex logistics so you
              can focus on the celebration.
            </p>
          </div>

          <div className="features-grid">

            {/* Card 1 — Digital Invitations */}
            <div className="feat-card feat-card--white">
              <div className="feat-icon-wrap">
                <InviteIcon />
              </div>
              <h3 className="feat-title">Digital Invitations</h3>
              <p className="feat-desc">
                Send personalized, stunningly animated invitations via WhatsApp, Email,
                or SMS. Track RSVPs in real-time with our automated guest concierge.
              </p>
              <a className="feat-link" href="#features">
                Explore Themes <span>→</span>
              </a>
            </div>

            {/* Card 2 — Elite QR Check-in */}
            <div className="feat-card feat-card--purple">
              <div className="feat-icon-wrap feat-icon-wrap--ghost">
                <QRIcon />
              </div>
              <h3 className="feat-title feat-title--white">Elite QR Check-in</h3>
              <p className="feat-desc feat-desc--white">
                Speed up arrivals with secure QR scanning, identify VIPs instantly and
                ensure a seamless entry experience for every guest.
              </p>
              <div className="feat-avatars">
                <span className="feat-avatar av1" />
                <span className="feat-avatar av2" />
                <span className="feat-avatar av3" />
                <span className="feat-avatar av4" />
                <span className="feat-avatar-label">
                  Checked in at last night's Royal Gala
                </span>
              </div>
            </div>

            {/* Card 3 — Shared AI Galleries */}
            <div className="feat-card feat-card--gallery">
              <div className="feat-gallery-icon">
                <GalleryIcon />
              </div>
              <div className="feat-gallery-overlay">
                <h3 className="feat-title feat-title--white">Shared AI Galleries</h3>
                <p className="feat-desc feat-desc--white">
                  Guests can instantly find their own photos using AI facial recognition.
                  No more chasing photographers after the event.
                </p>
              </div>
              <div className="feat-gallery-preview-badge">
                <img src="/gallery.png" alt="Gallery preview" />
              </div>
            </div>

            {/* Card 4 — Master Dashboard */}
            <div className="feat-card feat-card--dashboard">
              <div className="feat-dashboard-text">
                <div className="feat-icon-wrap">
                  <DashIcon />
                </div>
                <h3 className="feat-title">Master Dashboard</h3>
                <p className="feat-desc">
                  Real-time data at your fingertips. Track arrival patterns, table
                  assignments, and dietary requirements in one royal command centre.
                </p>
                <ul className="feat-checklist">
                  <li><span className="feat-check">✓</span> Live Guest Count</li>
                  <li><span className="feat-check">✓</span> Automated RSVP Reminders</li>
                  <li><span className="feat-check">✓</span> Vendor Management Integration</li>
                </ul>
              </div>
              <div className="feat-dashboard-img">
                <img src="/Margin.png" alt="Dashboard on laptop" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Host CTA (purple section) */}
      <section className="host-cta">
        <div className="host-cta-inner">
          <div className="host-cta-img">
            <img src="/Elegant.png" alt="Elegant Lagos host" />
          </div>
          <div className="host-cta-content">
            <h2 className="host-cta-heading">
              Lagosian Vibrancy,<br />
              <span className="host-cta-gold">Global Sophistication.</span>
            </h2>
            <p className="host-cta-sub">
              Our platform is born from the heartbeat of Lagos celebrations—the world's
              most vibrant social scenes. We understand the scale, the energy, and the
              high standards of a royal party.
            </p>
            <div className="host-features">
              <div className="host-feature-item">
                <div className="host-feature-icon">
                  <CultureIcon />
                </div>
                <div>
                  <p className="host-feature-title">Culturally Optimized</p>
                  <p className="host-feature-desc">
                    Tailored for large-scale African weddings and elite corporate galas.
                  </p>
                </div>
              </div>
              <div className="host-feature-item">
                <div className="host-feature-icon">
                  <SecurityIcon />
                </div>
                <div>
                  <p className="host-feature-title">Elite Security</p>
                  <p className="host-feature-desc">
                    Secure your event from uninvited guests with advanced QR verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="cta-banner-inner">
          <h2 className="cta-banner-heading">
            Ready to host your next <em className="cta-gold">Royal Event?</em>
          </h2>
          <p className="cta-banner-sub">
            Join the thousands of hosts elevating their guest experience with MyGuestly AI.
          </p>
          <div className="cta-banner-actions">
            <button className="btn-primary cta-btn-main" onClick={() => navigate('/signup')}>
              Get Started Now
            </button>
          
          </div>
          <p className="cta-note">No credit card required. Start with a free 10-guest event.</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">MyGuestly AI</span>
            <p className="footer-tagline">
              © 2024 MyGuestly AI. Lagosian Vibrancy, Global Sophistication.
            </p>
          </div>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact Support</a>
            <a href="/guide">Event Hosting Guide</a>
          </div>
          <div className="footer-socials">
            {/* Globe icon */}
            <a href="#" className="footer-social" aria-label="Website">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </a>
            {/* Share icon */}
            <a href="#" className="footer-social" aria-label="Share">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}