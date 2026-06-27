// src/pages/OAuthCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        login(token, user);
        // Redirect based on role
        if (user.role === 'GUEST' || user.role === 'guest') {
          navigate('/guest/dashboard');
        } else {
          navigate('/host/dashboard');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login');
      }
    } else {
      // If no token, redirect to login
      navigate('/login');
    }
  }, [login, navigate]);

  return (
    <div className="auth-page auth-centered">
      <div className="auth-box" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
        <h2>Authenticating...</h2>
        <p style={{ color: 'var(--text-muted)' }}>Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
}
