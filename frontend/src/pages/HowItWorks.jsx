import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './HowItWorks.css';

const steps = [
  {
    number: '01',
    title: 'Create & Customize',
    description: 'Select from high-end AI themes curated by luxury designers to reflect your event\'s unique royal personality.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Invite with Style',
    description: 'Deploy personalized digital invitations featuring unique QR security codes for every honored guest.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'VIP Check-In',
    description: 'Ensure a regal welcome with instant paperless verification at the entrance, keeping queues elegant and brief.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Relive the Magic',
    description: 'Collaborative AI galleries automatically sort photos via facial recognition, letting guests find their memories instantly.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
      </svg>
    ),
  },
];

const advantages = [
  {
    title: 'Military-Grade Security',
    description: 'Each QR code is cryptographically unique to the guest, preventing unauthorized entry.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    title: 'Real-time Analytics',
    description: 'Monitor guest arrivals and seating distributions from your private host dashboard.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    title: 'Instant Photo Delivery',
    description: 'Guests receive a curated link to photos featuring them as soon as the photographer uploads.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>
    ),
  },
];

const faqs = [
  {
    question: 'How secure are the QR invitation codes?',
    answer: 'Our QR codes use dynamic encryption and are unique to each guest\'s device. Once scanned at the entry point, the code is retired to prevent screenshot sharing and unauthorized re-entry, ensuring only invited guests attend.',
  },
  {
    question: 'Who owns the rights to the uploaded photos?',
    answer: 'You and your guests retain full ownership of all uploaded photos. MyGuestly AI only uses them to power the gallery experience and never shares them with third parties.',
  },
  {
    question: 'Is there a limit on the number of guests?',
    answer: 'Guest limits depend on your plan. Individual Plan supports limited guests, while Professional and Business plans offer unlimited invitations.',
  },
];

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="hiw-page">
      <Navbar links={[
        { label: 'Features', href: '#' },
        { label: 'How it Works', href: '/how-it-works', active: true },
        { label: 'Pricing', href: '/pricing' },
      ]} ctaLabel="Sign In" ctaHref="/login" ctaVariant="outline" />

      {/* Hero */}
      <section className="hiw-hero">
        <div className="hiw-hero-overlay" />
        <div className="hiw-hero-content">
          <p className="hiw-hero-eyebrow">THE ART OF EVENT MANAGEMENT</p>
          <h1 className="hiw-hero-heading">
            Hosting Made Elegant,<br />
            <span className="hiw-hero-italic">Memories Made Simple</span>
          </h1>
          <p className="hiw-hero-sub">
            Experience a seamless journey from the first digital invitation to the final AI-powered gallery. We handle the logistics; you enjoy the celebration.
          </p>
          <div className="hiw-hero-btns">
            <button className="hiw-btn-primary" onClick={() => navigate('/signup')}>Start Planning Now</button>
            <button className="hiw-btn-outline">Watch the Journey</button>
          </div>
        </div>
      </section>

      {/* Four-Step Journey */}
      <section className="hiw-steps-section">
        <h2 className="hiw-section-title">Your Four-Step Journey</h2>
        <div className="hiw-steps-underline" />
        <div className="hiw-steps-grid">
          {steps.map((step, i) => (
            <div key={i} className="hiw-step">
              <div className="hiw-step-icon">{step.icon}</div>
              <p className="hiw-step-number">STEP {step.number}</p>
              <h3 className="hiw-step-title">{step.title}</h3>
              <p className="hiw-step-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Advantage */}
      <section className="hiw-advantage-section">
        <div className="hiw-advantage-inner">
          <div className="hiw-advantage-image">
            <img
              src="/FIT.png"
              alt="Event celebration"
            />
          </div>
          <div className="hiw-advantage-content">
            <h2 className="hiw-advantage-title">Experience the AI Advantage</h2>
            <div className="hiw-advantage-list">
              {advantages.map((adv, i) => (
                <div key={i} className="hiw-advantage-item">
                  <div className="hiw-advantage-icon">{adv.icon}</div>
                  <div>
                    <h4 className="hiw-advantage-item-title">{adv.title}</h4>
                    <p className="hiw-advantage-item-desc">{adv.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="hiw-faq-section">
        <div className="hiw-faq-inner">
          <h2 className="hiw-section-title">Common Enquiries</h2>
          <p className="hiw-faq-sub">Everything you need to know about hosting with MyGuestly AI.</p>
          <div className="hiw-faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`hiw-faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="hiw-faq-question" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <span>{faq.question}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {openFaq === i ? <path d="M18 15l-6-6-6 6"/> : <path d="M6 9l6 6 6-6"/>}
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="hiw-faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="hiw-cta-section">
        <div className="hiw-cta-inner">
          <h2 className="hiw-cta-title">Ready to Host Your Next Masterpiece?</h2>
          <p className="hiw-cta-sub">Join thousands of hosts creating unforgettable experiences with the world's most sophisticated AI event manager.</p>
          <div className="hiw-cta-btns">
            <button className="hiw-cta-btn-primary" onClick={() => navigate('/signup')}>Start Planning Now</button>
            <button className="hiw-cta-btn-outline">Schedule a Demo</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}