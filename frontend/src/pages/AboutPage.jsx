// src/pages/AboutPage.jsx
import React from 'react';

export default function AboutPage() {
  return (
    <div className="page-inner" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <h1>About MyGuestly AI</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginTop: '16px' }}>
        AI-powered event hosting and guest experience platform
      </p>
    </div>
  );
}
