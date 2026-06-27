// src/hooks/useGoogleAuth.js
import { useState, useEffect } from 'react';

export function useGoogleAuth() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if Google API is loaded
    const checkGoogle = () => {
      if (window.google && window.google.accounts) {
        setIsReady(true);
      } else {
        // Wait for it to load
        const interval = setInterval(() => {
          if (window.google && window.google.accounts) {
            setIsReady(true);
            clearInterval(interval);
          }
        }, 200);
        return () => clearInterval(interval);
      }
    };
    checkGoogle();
  }, []);

  const signInWithGoogle = () => {
    if (!isReady) {
      console.warn('Google API not ready');
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      scope: 'profile email',
      callback: (response) => {
        // Response contains an access_token and id_token
        // We'll use the id_token to authenticate with our backend
        if (response.error) {
          console.error('Google OAuth error:', response.error);
          return;
        }
        // Send the id_token to your backend for verification
        handleGoogleToken(response.access_token);
      },
    });

    client.requestAccessToken();
  };

  const handleGoogleToken = async (accessToken) => {
    try {
      // Option 1: Send to your backend endpoint to verify and login
      const apiUrl = process.env.REACT_APP_API_URL || 'https://myguestly-ai.onrender.com/api';
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      const data = await response.json();
      if (data.token) {
        // Store token and user, then redirect
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = data.user.role === 'guest' ? '/guest/dashboard' : '/host/dashboard';
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  return { isReady, signInWithGoogle };
}
