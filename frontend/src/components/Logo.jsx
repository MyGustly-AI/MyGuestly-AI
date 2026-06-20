import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', light = false }) {
  const baseSize = size === 'lg' ? 18 : size === 'sm' ? 13 : 16;

  return (
    <Link to="/" style={{ display: 'inline-flex', alignItems: 'baseline', gap: '3px', textDecoration: 'none' }}>
      <span style={{
        fontFamily: "'Irish Grover', cursive",
        fontSize: `${baseSize}px`,
        fontWeight: 700,
        color: light ? '#fff' : '#3b1a6e',
      }}>My</span>
      <span style={{
        fontFamily: "'Irish Grover', cursive",
        fontSize: `${baseSize + 8}px`,
        fontWeight: 400,
        color: light ? '#f0c040' : '#c9920a',
        letterSpacing: '0.5px'
      }}>Guestly Ai</span>
    </Link>
  );
}