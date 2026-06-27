// src/components/Navigation.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { hostSitemap } from '../sitemap';
import './Navigation.css';

export default function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Get current section based on path
  const getCurrentSection = () => {
    const path = location.pathname;
    for (const section of hostSitemap.host) {
      if (section.routes.some(route => route.path === path)) {
        return section.section;
      }
    }
    return null;
  };

  return (
    <>
      {/* Mobile Hamburger */}
      <button 
        className="mobile-nav-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Navigation */}
      <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="nav-brand">
          <Link to="/host/dashboard" className="nav-logo">
            <span className="logo-icon">✨</span>
            <span className="logo-text">MyGuestly AI</span>
          </Link>
        </div>

        {/* Main Navigation Sections */}
        <div className="nav-sections">
          {hostSitemap.host.map((section, index) => (
            <div key={index} className="nav-section">
              <div className="nav-section-title">{section.section}</div>
              <ul className="nav-list">
                {section.routes.map((route, routeIndex) => (
                  <li key={routeIndex}>
                    <Link
                      to={route.path}
                      className={`nav-link ${isActive(route.path) ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="nav-icon">{route.icon}</span>
                      <span className="nav-label">
                        {route.name}
                        <span className="nav-description">{route.description}</span>
                      </span>
                      {isActive(route.path) && (
                        <span className="nav-indicator" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="nav-footer">
          <Link to="/profile" className="nav-link">
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profile</span>
          </Link>
          <Link to="/settings" className="nav-link">
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </Link>
          <button className="nav-link logout-btn" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
