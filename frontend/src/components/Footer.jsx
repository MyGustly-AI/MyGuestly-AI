import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo />
          <p className="footer-tagline">Smarter event hosting for unforgettable memories.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter" className="social-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="social-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="social-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <div className="footer-col-title">Platform</div>
            <Link to="/login" className="footer-link">Event Hosting Board</Link>
            <Link to="/login" className="footer-link">Host Dashboard</Link>
            <Link to="/login" className="footer-link">Pricing</Link>
            <Link to="/login" className="footer-link">Gallery</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">The Wedding</div>
            <Link to="/login" className="footer-link">Timeline</Link>
            <Link to="/login" className="footer-link">Gallery</Link>
            <Link to="/login" className="footer-link">RSVP</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <a href="#" className="footer-link">About Us</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 MyGuestly Ai. Lagosian Vibrancy, Global Sophistication.</span>
        <div className="footer-bottom-links">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Contact Support</a>
          <a href="#" className="footer-link">Event Hosting Board</a>
        </div>
      </div>
    </footer>
  );
}
