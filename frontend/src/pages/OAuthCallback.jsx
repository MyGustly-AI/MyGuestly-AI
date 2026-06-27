import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        // Store token and user (the context will handle it)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // Redirect based on role
        if (user.role === 'guest' || user.role === 'GUEST') {
          navigate('/guest/dashboard');
        } else {
          navigate('/host/dashboard');
        }
      } catch (e) {
        console.error('OAuth callback error:', e);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate, googleLogin]);

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
