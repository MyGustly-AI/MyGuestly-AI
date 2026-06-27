import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import Logo from './Logo';

export default function Navbar({ links = [], showAuth = true, sticky = true }) {
  const navigate = useNavigate();
  return (
    <nav className={`navbar ${sticky ? 'sticky' : ''}`}>
      <div className="navbar-inner">
        <Logo />
        <div className="navbar-links">
          {links.map((l, i) => (
            <Link key={i} to={l.href} className="nav-link">{l.label}</Link>
          ))}
        </div>
        {showAuth && (
          <div className="navbar-auth">
            <button className="btn-ghost nav-btn" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn-primary nav-btn" onClick={() => navigate('/host-signup')}>Get Started</button>
          </div>
        )}
      </div>
    </nav>
  );
}
