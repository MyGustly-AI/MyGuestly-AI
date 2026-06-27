// src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import AppleAuthButton from '../components/AppleAuthButton';
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
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-socials">
            <GoogleAuthButton disabled={submitting} />
            <AppleAuthButton disabled={submitting} />
          </div>

          <div className="auth-divider"><span>OR</span></div>

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
              <span>
                I agree to the <a href="#">Terms and Conditions</a>
                {' '}and <a href="#">Privacy Policy</a>
              </span>
            </label>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'CREATE MY ACCOUNT'}
          </button>

          <p className="auth-bottom-text">
            Already a member? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
               }
