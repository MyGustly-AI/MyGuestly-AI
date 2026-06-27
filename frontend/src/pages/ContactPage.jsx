// src/pages/ContactPage.jsx
import React from 'react';

export default function ContactPage() {
  return (
    <div className="page-inner" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h1>Contact Us</h1>
      <p style={{ color: 'var(--text-muted)' }}>Get in touch with our team</p>
      <form style={{ marginTop: '24px' }}>
        <input className="input-field" placeholder="Your email" style={{ marginBottom: '16px' }} />
        <textarea className="input-field" placeholder="Your message" rows="4" style={{ marginBottom: '16px' }} />
        <button className="btn-primary">Send Message</button>
      </form>
    </div>
  );
}
