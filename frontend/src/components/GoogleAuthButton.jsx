// frontend/src/components/GoogleAuthButton.jsx
//
// Drop-in replacement for the inert "Google" <button> already in
// LoginPage.jsx / SignUpPage.jsx. Visually it's the same button; under the
// hood, Google's real Sign In With Google button is rendered invisibly and
// stacked exactly on top, so the user's actual click triggers Google's
// flow directly. (A synthetic .click() from JS does not count as a user
// gesture under FedCM and will silently fail in current Chrome — this
// overlay approach is the standard workaround.)
//
// Usage:
//   <GoogleAuthButton />                                  // no gating
//   <GoogleAuthButton agreed={agreed} onBlocked={fn} />    // gated, e.g. behind a ToS checkbox

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadGoogleScript } from '../utils/loadGoogleScript';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function GoogleAuthButton({ agreed = true, onBlocked, label = 'Google' }) {
  const navigate = useNavigate();
  const { googleLogin, setError } = useAuth();
  const overlayRef = useRef(null);
  const [scriptFailed, setScriptFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function handleCredentialResponse(response) {
      try {
        const user = await googleLogin(response.credential);
        if (cancelled) return;
        if (user?.role === 'GUEST') {
          navigate('/guest/dashboard');
        } else {
          navigate('/host/dashboard');
        }
      } catch (err) {
        // googleLogin already pushes a message into AuthContext's `error`
      }
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error(
        'REACT_APP_GOOGLE_CLIENT_ID is not set. Add it to frontend/.env and restart the dev server.'
      );
      setScriptFailed(true);
      return;
    }

    loadGoogleScript()
      .then(() => {
        if (cancelled || !overlayRef.current) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          use_fedcm_for_button: true,
        });

        // Clear any previous render 
        overlayRef.current.innerHTML = '';

        // Match the overlay's width to however wide the visible button ended
        // up being, so the invisible real button covers it edge-to-edge.
        const measuredWidth = overlayRef.current.parentElement
          ? Math.min(Math.round(overlayRef.current.parentElement.getBoundingClientRect().width) || 280, 400)
          : 280;

        window.google.accounts.id.renderButton(overlayRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: measuredWidth,
        });
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setScriptFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [googleLogin, navigate, setError]);

  const handleDecorativeClick = () => {
    // Only fires when the overlay is pointer-events:none (blocked) — when
    // active, the overlay intercepts the click before it reaches here.
    if (!agreed) {
      onBlocked?.();
      return;
    }
    if (scriptFailed) {
      setError('Google sign-in is unavailable right now. Please try again or use email.');
    }
  };

  return (
    <div className="google-btn-wrap" style={{ position: 'relative', flex: 1 }}>
      <button
        type="button"
        className="social-btn"
        style={{ width: '100%' }}
        tabIndex={-1}
        aria-hidden="true"
        onClick={handleDecorativeClick}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {label}
      </button>

      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          overflow: 'hidden',
          pointerEvents: agreed && !scriptFailed ? 'auto' : 'none',
        }}
      />
    </div>
  );
}