// src/components/Sidebar.jsx
import React from 'react';
import { useMobileMenu } from '../hooks/useMobileMenu';

export function Sidebar() {  // ✅ Named export (no 'default')
  const { isMobile, menuOpen, setMenuOpen } = useMobileMenu();

  return (
    <>
      {isMobile && (
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 1000,
            background: 'var(--primary)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '20px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(75,0,130,0.3)'
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      )}

      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '240px',
        height: '100vh',
        background: 'white',
        borderRight: '1px solid var(--border)',
        padding: '24px 16px',
        transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 999,
        overflowY: 'auto',
        boxShadow: isMobile && menuOpen ? '4px 0 24px rgba(0,0,0,0.1)' : 'none'
      }}>
        {/* Logo/Brand */}
        <div style={{
          padding: '8px 12px',
          marginBottom: '32px',
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--primary)'
        }}>
          MyGuestly AI
        </div>

        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <NavItem icon="📊" label="Dashboard" href="/host/dashboard" />
            <NavItem icon="📅" label="Events" href="/host/home" />
            <NavItem icon="👥" label="Guests" href="/host/guest-list" />
            <NavItem icon="📨" label="Invitations" href="/host/invitation" />
            <NavItem icon="👤" label="Profile" href="/profile" />
            <NavItem icon="⚙️" label="Settings" href="/settings" />
          </ul>
        </nav>

        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '16px',
          right: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)'
        }}>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            style={{
              width: '100%',
              padding: '12px',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background 0.2s'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {isMobile && menuOpen && (
        <div 
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 998,
          }}
        />
      )}
    </>
  );
}

// Navigation Item Component
function NavItem({ icon, label, href }) {
  return (
    <li style={{ marginBottom: '4px' }}>
      <a 
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '18px' }}>{icon}</span>
        {label}
      </a>
    </li>
  );
}

export default Sidebar;
