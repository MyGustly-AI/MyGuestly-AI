import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import HowItWorks from './pages/HowItWorks';
import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HostSignUpPage from './pages/HostSignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HostHomePage from './pages/HostHomePage';
import HostDashboard from './pages/HostDashboard';
import CreateEventPage from './pages/CreateEventPage';
import InvitationPage from './pages/InvitationPage';
import GuestListPage from './pages/GuestListPage';
import AdminRolesPage from './pages/AdminRolesPage';
import GuestDashboard from './pages/GuestDashboard';
import GalleryPage from './pages/GalleryPage';
import TimelinePage from './pages/TimelinePage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotificationPage from './pages/NotificationPage';
import PricingPage from './pages/PricingPage';
import ScanQRPage from './pages/ScanQRPage';

// Waits for auth to load, then redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/host-signup" element={<HostSignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Protected routes — require auth */}
          <Route path="/host/home" element={<ProtectedRoute><HostHomePage /></ProtectedRoute>} />
          <Route path="/host/dashboard" element={<ProtectedRoute><HostDashboard /></ProtectedRoute>} />
          <Route path="/host/create-event" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
          <Route path="/host/invitation" element={<ProtectedRoute><InvitationPage /></ProtectedRoute>} />
          <Route path="/host/guest-list" element={<ProtectedRoute><GuestListPage /></ProtectedRoute>} />
          <Route path="/host/admin-roles" element={<ProtectedRoute><AdminRolesPage /></ProtectedRoute>} />
          <Route path="/guest/dashboard" element={<ProtectedRoute><GuestDashboard /></ProtectedRoute>} />
          <Route path="/gallery" element={<ProtectedRoute><GalleryPage /></ProtectedRoute>} />
          <Route path="/timeline" element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notification" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/scan-qr" element={<ProtectedRoute><ScanQRPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}