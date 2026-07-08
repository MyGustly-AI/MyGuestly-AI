import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import './Sidebar.css';

export default function Sidebar({ role = 'host', user = { name: 'Amara', plan: 'Host Account' } }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hostLinks = [
    { href: '/host/dashboard',   label: 'Dashboard',    icon: <GridIcon /> },
    { href: '/host/home',        label: 'Events',       icon: <CalIcon /> },
    { href: '/host/guest-list',  label: 'RSVP Manager', icon: <UsersIcon /> },
    { href: '/gallery',          label: 'Gallery',      icon: <GalleryIcon /> },
    { href: '/host/admin-roles', label: 'Check-In',     icon: <CheckIcon /> },
  ];

  const guestLinks = [
    { href: '/guest/dashboard', label: 'Dashboard', icon: <GridIcon /> },
    { href: '/timeline',        label: 'Timeline',   icon: <TimelineIcon /> },
    { href: '/gallery',         label: 'Gallery',    icon: <GalleryIcon /> },
    { href: '/scan-qr',         label: 'Scan QR',    icon: <QRIcon /> },
  ];

  const links = role === 'host' ? hostLinks : guestLinks;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Close Button (Mobile Only) */}
        <button
          className="sidebar-close"
          onClick={closeMobileMenu}
          aria-label="Close menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          <Logo />
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {links.map((link, i) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={i}
                to={link.href}
                className={`sidebar-link${isActive ? ' active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="sidebar-icon">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="sidebar-bottom">
          {role === 'host' && (
            <button
              className="sidebar-link sidebar-create"
              onClick={() => {
                navigate('/host/create-event');
                closeMobileMenu();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              Create New Event
            </button>
          )}

          <div
            className="sidebar-user-bottom"
            onClick={() => {
              navigate('/profile');
              closeMobileMenu();
            }}
            style={{ cursor: 'pointer' }}
          >
            <img src="/profile.png" alt="User avatar" className="sidebar-avatar-img" />
            <div>
              <div className="sidebar-user-name2">{user.name}</div>
              <div className="sidebar-user-plan2">{user.plan}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Icon components ────────────────────────────────────────────────

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function TimelineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function QRIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}