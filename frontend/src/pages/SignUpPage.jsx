// src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signup, error, setError } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setSubmitting(true);

    try {
      const user = await signup({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      navigate(user?.role === 'GUEST' ? '/guest/dashboard' : '/host/dashboard');
    } catch (err) {
      // Error is already set in auth context
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-centered">
      <div className="auth-box">
        <div className="auth-box-logo">
          <h1 className="auth-logo-text">MyGuestly AI</h1>
        </div>
        <h2 className="auth-heading">Join the future of event</h2>
        <p className="auth-sub">
          Create your prestigious account and start curating unforgettable experiences.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error" style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div className="auth-socials" style={{ marginBottom: '20px' }}>
            <button type="button" className="social-btn" disabled={submitting}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.478,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Google
            </button>
            <button type="button" className="social-btn" disabled={submitting}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
          </div>

          <div className="auth-divider" style={{ marginBottom: '20px' }}>
            <span>OR</span>
          </div>

          <div className="form-group">
            <label className="label">FULL NAME</label>
            <input
              className="input-field"
              type="text"
              name="fullName"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="label">EMAIL ADDRESS</label>
            <input
              className="input-field"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="label">PHONE NUMBER</label>
            <input
              className="input-field"
              type="tel"
              name="phone"
              placeholder="+234 **** **** ****"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="label">PASSWORD</label>
            <input
              className="input-field"
              type="password"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="label">CONFIRM PASSWORD</label>
            <input
              className="input-field"
              type="password"
              name="confirmPassword"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={submitting}
              /> 
              I agree to the <a href="#" style={{ color: 'var(--primary-light)' }}>Terms and Conditions</a>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn-primary auth-submit" 
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'CREATE MY ACCOUNT'}
          </button>

          <p className="auth-bottom-text" style={{ marginTop: '16px' }}>
            Already a member? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
