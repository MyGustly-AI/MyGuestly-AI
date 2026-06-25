// Sidebar.jsx
import React from 'react';
import { useMobileMenu } from '../hooks/useMobileMenu';

export function Sidebar() {
  const { isMobile, menuOpen, setMenuOpen } = useMobileMenu();

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            position: 'fixed',
            top: '12px',
            left: '12px',
            zIndex: 1000,
            background: 'var(--primary)',
            color: 'white',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '20px'
          }}
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '220px',
        height: '100vh',
        background: 'white',
        borderRight: '1px solid var(--border)',
        padding: '24px 16px',
        transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform 0.3s ease',
        zIndex: 999,
        overflowY: 'auto'
      }}>
        {/* Your sidebar content */}
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '12px 16px', marginBottom: '4px', borderRadius: '8px', cursor: 'pointer' }}>
              Dashboard
            </li>
            <li style={{ padding: '12px 16px', marginBottom: '4px', borderRadius: '8px', cursor: 'pointer' }}>
              Events
            </li>
            <li style={{ padding: '12px 16px', marginBottom: '4px', borderRadius: '8px', cursor: 'pointer' }}>
              Guests
            </li>
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
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
