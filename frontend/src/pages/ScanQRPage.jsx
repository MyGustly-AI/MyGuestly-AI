import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import { checkinGuestRequest, listGuestsRequest } from '../api/guests';
import './ScanQRPage.css';

export const checkInGuestRequest = checkinGuestRequest;

const SCANNER_ELEMENT_ID = 'qr-scanner-viewport';

export default function ScanQRPage() {
  const location = useLocation();
  const eventId = location.state?.eventId;

  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [checkinError, setCheckinError] = useState(null);
  const [verifiedGuest, setVerifiedGuest] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [manualQuery, setManualQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const [guests, setGuests] = useState([]);
  const [totalGuests, setTotalGuests] = useState(0);
  const [arrived, setArrived] = useState(0);

  const html5QrCodeRef = useRef(null);
  const processingRef = useRef(false);

  const loadGuests = useCallback(async () => {
    if (!eventId) return;
    try {
      const result = await listGuestsRequest(eventId, { limit: 500 });
      const list = result?.data ?? result?.guests ?? result ?? [];
      const guestList = Array.isArray(list) ? list : [];
      setGuests(guestList);
      setTotalGuests(guestList.length);
      setArrived(guestList.filter((g) => g.checkedIn || g.status === 'CHECKED_IN').length);
    } catch (err) {
      setScannerError(err.message || 'Could not load guest list.');
    }
  }, [eventId]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  const pct = totalGuests > 0 ? Math.round((arrived / totalGuests) * 100) : 0;

  const handleCheckin = useCallback(
    async (qrCode) => {
      if (!eventId || processingRef.current) return;
      processingRef.current = true;
      setCheckinError(null);
      try {
        const result = await checkInGuestRequest(eventId, { qrCode });
        const guest = result?.data ?? result?.guest ?? result ?? {};
        const name = guest.fullName || guest.name || 'Guest';
        const sub = guest.tableNumber
          ? `Table ${guest.tableNumber} • ${guest.ticketType || 'Guest'}`
          : guest.ticketType || 'Checked in';
        const avatar = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

        setVerifiedGuest({ name, sub, avatar, granted: true });
        setRecentEntries((prev) => [
          { name, sub, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'Entered', avatar },
          ...prev,
        ].slice(0, 10));

        await loadGuests();
      } catch (err) {
        setVerifiedGuest({ name: 'Unknown QR Code', sub: 'Verification Failed', avatar: null, granted: false });
        setCheckinError(err.message || 'Check-in failed. Invalid or already-used QR code.');
        setRecentEntries((prev) => [
          { name: 'Unknown QR Code', sub: 'Verification Failed', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'Denied', avatar: null },
          ...prev,
        ].slice(0, 10));
      } finally {
        // small cooldown so the same code doesn't fire repeatedly while still in frame
        setTimeout(() => {
          processingRef.current = false;
        }, 2500);
      }
    },
    [eventId, loadGuests]
  );

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;

        const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            handleCheckin(decodedText);
          },
          () => {
            // per-frame scan failure, ignore (just means no QR in view this frame)
          }
        );
      } catch (err) {
        if (isMounted) {
          setScannerError(
            err?.message?.includes('Permission')
              ? 'Camera permission denied. Use manual search below instead.'
              : 'Could not start camera. Use manual search below instead.'
          );
          setScanning(false);
        }
      }
    };

    const stopScanner = async () => {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
        } catch {
          // already stopped, ignore
        }
        html5QrCodeRef.current = null;
      }
    };

    if (scanning) {
      setScannerError(null);
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [scanning, handleCheckin]);

  const handleManualSearch = async () => {
    if (!manualQuery.trim()) return;
    setSearching(true);
    setCheckinError(null);
    try {
      const match = guests.find((g) => {
        const name = (g.fullName || g.name || '').toLowerCase();
        const code = (g.qrCode || g.id || '').toString().toLowerCase();
        return name.includes(manualQuery.toLowerCase()) || code === manualQuery.toLowerCase();
      });

      if (!match) {
        setCheckinError('No matching guest found.');
        return;
      }

      await handleCheckin(match.qrCode || match.id);
      setManualQuery('');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar role="guest" />
      <main className="main-content">
        <AppHeader
          links={[
            { label: 'My Guestly AI', href: '/' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'Timeline', href: '/timeline' },
            { label: 'RSVP', href: '/host/guest-list' },
          ]}
        />

        <div className="page-inner scan-outer">
          {!eventId && (
            <div className="auth-error" style={{ marginBottom: 16 }}>
              No event selected. Open this page from an event to enable check-in.
            </div>
          )}
          {scannerError && <div className="auth-error" style={{ marginBottom: 16 }}>{scannerError}</div>}
          {checkinError && <div className="auth-error" style={{ marginBottom: 16 }}>{checkinError}</div>}

          {/* Attendance Progress */}
          <div className="attendance-card">
            <div className="attendance-label">Attendance Progress</div>
            <div className="attendance-heading">
              Guests Arrived: <strong>{arrived}</strong>{' '}
              <span>/ {totalGuests}</span>
            </div>
            <div className="attendance-bar-row">
              <div className="attendance-bar-track">
                <div className="attendance-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="attendance-pct">{pct}%</span>
            </div>
          </div>

          <div className="scan-layout">
            {/* Left – Scanner */}
            <div className="scan-main">
              <div className="scan-viewport-wrap">
                {/* Viewport */}
                <div className={`scan-viewport ${scanning ? 'scanning' : ''}`}>
                  <div id={SCANNER_ELEMENT_ID} style={{ width: '100%', height: '100%' }} />

                  <div className="scan-corner tl" />
                  <div className="scan-corner tr" />
                  <div className="scan-corner bl" />
                  <div className="scan-corner br" />
                  {scanning && <div className="scan-line" />}

                  {!scanning && (
                    <div className="scan-qr-icon">
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                      </svg>
                      <p>Point camera at QR code</p>
                      <div className="scan-qr-hint">Align QR code within the frame to auto-scan</div>
                    </div>
                  )}
                </div>

                {/* Pill Button */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    className={`scan-btn-pill ${scanning ? 'scanning' : ''}`}
                    onClick={() => setScanning((s) => !s)}
                    disabled={!eventId}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                    {scanning ? 'Stop Scanning' : 'Scan Guest QR Code'}
                  </button>
                </div>

                {/* Search */}
                <div className="scan-search-bar">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    placeholder="Manual Search for guest names..."
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                    disabled={!eventId}
                  />
                  <button className="scan-search-btn" onClick={handleManualSearch} disabled={!eventId || searching}>
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right – Verified + Recent Entries */}
            <div className="scan-side">
              {/* Verified Guest Card */}
              {verifiedGuest && (
                <div className="verified-card">
                  <div className="verified-avatar">
                    <span>{verifiedGuest.avatar || '!'}</span>
                  </div>
                  <div className="verified-info">
                    <div className="verified-name">{verifiedGuest.name}</div>
                    <div className="verified-sub">{verifiedGuest.sub}</div>
                    {verifiedGuest.granted ? (
                      <div className="access-granted">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        ACCESS GRANTED
                      </div>
                    ) : (
                      <div className="access-granted" style={{ color: 'var(--danger)' }}>
                        ACCESS DENIED
                      </div>
                    )}
                  </div>
                  <div className="verified-badge">{verifiedGuest.granted ? 'VERIFIED' : 'DENIED'}</div>
                </div>
              )}

              {/* Recent Entries */}
              <div className="recent-entries-card">
                <div className="re-title">Recent Entries</div>
                {recentEntries.length === 0 && (
                  <p style={{ padding: 12, color: 'var(--text-muted)', fontSize: 13 }}>No check-ins yet.</p>
                )}
                {recentEntries.map((e, i) => (
                  <div key={i} className="re-item">
                    {e.avatar ? (
                      <div className="re-avatar">{e.avatar}</div>
                    ) : (
                      <div className="re-denied-icon">!</div>
                    )}
                    <div className="re-info">
                      <div className="re-name" style={!e.avatar ? { color: 'var(--danger)' } : {}}>
                        {e.name}
                      </div>
                      <div className="re-sub">{e.sub}</div>
                    </div>
                    <div className="re-right">
                      <div className="re-time">{e.time}</div>
                      <div className={e.status === 'Entered' ? 're-status-entered' : 're-status-denied'}>
                        {e.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}