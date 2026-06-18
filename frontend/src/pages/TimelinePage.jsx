import React from 'react';
import AppHeader from '../components/AppHeader';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import './TimelinePage.css';

const moments = [
  {
    time: '10:00 AM',
    tag: 'BRIDAL PREP',
    title: 'Bridal Prep',
    desc: 'Starting from the bridal suite on the 3rd floor, meet with our wedding stylist at the Grand Luxury Hotel in Victoria Island and get ready in the hands of our dedicated event team.',
    img: '/t1.png',
    side: 'right',
  },
  {
    time: '01:00 PM',
    tag: 'THE VOWS',
    title: 'The Vows',
    desc: 'The main ceremony in the Chapel of Light in the 2nd hall, at 1pm sharp, join the couple as they pledge undying love in the most romantic way the city has ever seen.',
    img: '/vow.png',
    side: 'left',
  },
  {
    time: '04:00 PM',
    tag: 'COCKTAIL HOUR',
    title: 'Cocktail Hour',
    desc: "Sip your favorite cocktails with the couple's favourite tunes and dance. No worries, you can mingle with other guests too.",
    img: '/ch.png',
    side: 'right',
    extra: '100+',
  },
  {
    time: '07:00 PM',
    tag: 'RECEPTION ENTRANCE',
    title: 'Reception Entrance',
    desc: "The most awaited moment of the night, the grand reception entrance. Expect the unexpected and prepare for an atmosphere of sheer indulgence as Abike & Tunde's love story truly begins.",
    img: '/Ai.png',
    side: 'left',
  },
];

export default function TimelinePage() {
  return (
    <div className="timeline-page">
      <header className="timeline-header">
        <AppHeader
          links={[
            { label: 'My Guestly AI', href: '/' },
            { label: 'Home', href: '/guest/dashboard' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'RSVP', href: '/host/guest-list' },
            { label: 'Help', href: '#' },
          ]}
          active="Timeline"
        />
      </header>

      {/* Hero */}
      <section className="timeline-hero">
        <img src="/tunde.png" alt="Abike & Tunde's wedding" className="timeline-hero-img" />
        <div className="timeline-hero-overlay">
          <div className="timeline-hero-content">
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
              Abike &amp;
            </div>
            <h1 className="timeline-hero-title">Tunde</h1>
            <p className="timeline-hero-date">JUNE 15, 2026 &bull; APEX TOWER HOTEL, LAGOS</p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section">
        <div className="timeline-inner">
          <div className="timeline-line" />
          {moments.map((m, i) => (
            <div key={i} className={`timeline-item ${m.side}`}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-tag">{m.tag}</div>
                <h3 className="timeline-item-title">{m.title}</h3>
                <p className="timeline-item-desc">{m.desc}</p>
                {m.extra && (
                  <div className="timeline-extra">
                    <span className="badge badge-gold">{m.extra} Guests</span>
                  </div>
                )}
                <div className="timeline-img-wrap">
                  <img src={m.img} alt={m.title} />
                </div>
              </div>
              <div className="timeline-time">{m.time}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
