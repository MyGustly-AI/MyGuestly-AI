import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './PricingPage.css';

const plans = [
  {
    name: 'INDIVIDUAL PLAN',
    price: '5,000',
    period: '/event',
    tag: null,
    features: [
      { label: 'All Features', bold: true },
      { label: 'Limited Guests', bold: true },
      { label: 'AI Concierge Assistant', bold: false },
      { label: 'Interactive Memory Gallery', bold: false },
    ],
    cta: 'Select Plan',
    variant: 'default',
  },
  {
    name: 'PROFESSIONAL PLAN',
    price: '20,000',
    period: '/3 months',
    tag: null,
    features: [
      { label: 'Up to 20 Events', bold: true },
      { label: 'Unlimited Invitations', bold: true },
      { label: 'QR Check-ins', bold: false },
      { label: 'Shared Galleries', bold: false },
      { label: 'AI Memory Timeline', bold: false },
    ],
    cta: 'Select Plan',
    variant: 'featured',
  },
  {
    name: 'BUSINESS PLAN',
    price: '40,000',
    period: '/3 months',
    tag: null,
    features: [
      { label: 'Unlimited Events', bold: true },
      { label: 'Multiple Team Members', bold: false },
      { label: 'Attendance Reports', bold: false },
      { label: 'Advanced Guest Analytics', bold: false },
    ],
    cta: 'Select Plan',
    variant: 'default',
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('PROFESSIONAL PLAN');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const selectedPlan = plans.find(p => p.name === selected);

  return (
    <div className="pricing-page">
      <Navbar links={[
        { label: 'Plans', href: '/pricing' },
        { label: 'Features', href: '#' },
        { label: 'Enterprise', href: '#' },
        { label: 'Support', href: '#' },
      ]} ctaLabel="Get Started" ctaHref="/host-signup" />

      <section className="pricing-hero">
        <h1 className="pricing-heading">Elevate Your Celebrations</h1>
        <p className="pricing-sub">Choose the perfect plan to orchestrate your extraordinary moments with AI-powered elegance and seamless guest management.</p>
      </section>

      <section className="pricing-cards-section">
        <div className="pricing-cards-inner">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`pricing-card ${p.variant === 'featured' ? 'pricing-card-featured' : ''} ${selected === p.name ? 'selected' : ''}`}
              onClick={() => setSelected(p.name)}
            >
              <div className="pricing-plan-name">{p.name}</div>
              <div className="pricing-price">
                <span className="pricing-currency">#</span>
                <span className="pricing-amount">{p.price}</span>
                <span className="pricing-period">{p.period}</span>
              </div>
              <ul className="pricing-features">
                {p.features.map((f, j) => (
                  <li key={j} className={`pricing-feature ${f.bold ? 'feature-bold' : ''}`}>
                    <span className="feature-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>
              <button
                className="pricing-cta"
                onClick={(e) => { e.stopPropagation(); setSelected(p.name); }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="pricing-checkout-section">
        <div className="pricing-checkout-inner">
          <div className="pricing-checkout-cols">

            {/* Plan Summary */}
            <div className="pricing-summary-card">
              <h3 className="checkout-section-title">Plan Summary</h3>
              <div className="summary-plan-row">
                <span className="summary-plan-label">
                  {selected ? selected : 'NO PLAN SELECTED'}
                </span>
                <span className="summary-plan-price">$0.00</span>
              </div>
              <p className="summary-billed-note">Billed once for a lifetime of memories.</p>
              <div className="summary-divider" />
              <div className="summary-row">
                <span>Subtotal</span>
                <span>$0.00</span>
              </div>
              <div className="summary-row">
                <span>Service Fee</span>
                <span>$0.00</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Total Due</span>
                <span className="summary-total-amount">$0.00</span>
              </div>
            </div>

            {/* Secure Checkout */}
            <div className="pricing-checkout-card">
              <h3 className="checkout-section-title">
                Secure Checkout
                <span className="checkout-lock">🔒</span>
              </h3>
              <div className="checkout-field">
                <label className="checkout-label">CARDHOLDER NAME</label>
                <input
                  className="checkout-input"
                  type="text"
                  placeholder="Johnathan Sterling"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                />
              </div>
              <div className="checkout-field">
                <label className="checkout-label">CARD NUMBER</label>
                <div className="checkout-input-icon">
                  <input
                    className="checkout-input"
                    type="text"
                    placeholder="•••• •••• •••• ••••"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                  <svg className="card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                </div>
              </div>
              <div className="checkout-row-2">
                <div className="checkout-field">
                  <label className="checkout-label">EXPIRY DATE</label>
                  <input
                    className="checkout-input"
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                    maxLength={5}
                  />
                </div>
                <div className="checkout-field">
                  <label className="checkout-label">CVC</label>
                  <input
                    className="checkout-input"
                    type="text"
                    placeholder="•••"
                    value={cvc}
                    onChange={e => setCvc(e.target.value)}
                    maxLength={3}
                  />
                </div>
              </div>
              <button className="checkout-pay-btn">Complete Payment</button>
              <p className="checkout-security-note">Encrypted with 256-bit SSL security</p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}