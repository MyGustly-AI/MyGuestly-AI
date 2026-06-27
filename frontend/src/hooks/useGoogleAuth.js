// src/hooks/useGoogleAuth.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useGoogleAuth() {
  const [isReady, setIsReady] = useState(false);
  const { googleLogin } = useAuth();

  useEffect(() => {
    const checkGoogle = () => {
      if (window.google && window.google.accounts) {
        setIsReady(true);
      } else {
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
      callback: async (response) => {
        if (response.error) {
          console.error('Google OAuth error:', response.error);
          return;
        }
        try {
          await googleLogin(response.access_token);
          // Redirect after successful login
          const user = JSON.parse(localStorage.getItem('user'));
          window.location.href = user?.role === 'guest' ? '/guest/dashboard' : '/host/dashboard';
        } catch (err) {
          console.error('Google sign-in error:', err);
        }
      },
    });
    client.requestAccessToken();
  };

  return { isReady, signInWithGoogle };
      }
