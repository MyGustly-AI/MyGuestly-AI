import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listEventsRequest } from '../api/events';
import './AudioPlayer.css';

// A premium royalty-free classical wedding/gala background track for fallback
const FALLBACK_TRACK = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export default function AudioPlayer() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [trackUrl, setTrackUrl] = useState(null);
  const [eventTitle, setEventTitle] = useState('Syncing Master Audio');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [visible, setVisible] = useState(false);

  const audioRef = useRef(null);

  // Determine visibility based on route path
  useEffect(() => {
    const hiddenPaths = [
      '/', '/login', '/signup', '/host-signup', '/forgot-password',
      '/reset-password', '/pricing', '/how-it-works', '/onboarding'
    ];
    const isRsvp = location.pathname.startsWith('/rsvp/');
    const shouldShow = isAuthenticated && !hiddenPaths.includes(location.pathname) && !isRsvp;
    setVisible(shouldShow);
  }, [location.pathname, isAuthenticated]);

  // Fetch event details to retrieve masterTrackUrl
  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      try {
        const events = await listEventsRequest({ limit: 1 });
        const activeEvent = events?.[0] || events?.data?.[0];
        if (activeEvent) {
          setEventTitle(activeEvent.title);
          setTrackUrl(activeEvent.masterTrackUrl || FALLBACK_TRACK);
        } else {
          setEventTitle('MyGuestly Gala Event');
          setTrackUrl(FALLBACK_TRACK);
        }
      } catch (err) {
        console.warn('Could not fetch active event track:', err);
        setEventTitle('MyGuestly Gala Event');
        setTrackUrl(FALLBACK_TRACK);
      }
    })();
  }, [isAuthenticated]);

  // Handle play/pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.warn('Audio playback blocked by browser:', err));
      setIsPlaying(true);
    }
  };

  // Sync volume state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Sync audio progress bar
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (!visible || !trackUrl) return null;

  return (
    <div className="master-audio-player">
      <audio
        ref={audioRef}
        src={trackUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="player-details">
        <div className={`player-wave-icon ${isPlaying ? 'playing' : ''}`}>
          <span /><span /><span /><span />
        </div>
        <div className="player-meta">
          <div className="player-track-name">{eventTitle} Master Audio</div>
          <div className="player-track-sub">Synced Live Compilations</div>
        </div>
      </div>

      <div className="player-controls">
        <button className="play-pause-trigger" onClick={togglePlay}>
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          )}
        </button>

        <div className="player-progress-wrap">
          <span className="time-display">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="player-slider"
          />
          <span className="time-display">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-volume-wrap">
        <button className="volume-mute-btn" onClick={() => setIsMuted(!isMuted)}>
          {isMuted || volume === 0 ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            setIsMuted(false);
          }}
          className="volume-slider"
        />
      </div>
    </div>
  );
}
