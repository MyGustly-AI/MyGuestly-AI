import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';

// Auth Pages
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OAuthCallback from './pages/OAuthCallback';

// Host Pages
import HostDashboard from './pages/HostDashboard';
import HostHomePage from './pages/HostHomePage';
import CreateEventPage from './pages/CreateEventPage';
import GuestListPage from './pages/GuestListPage';
import InvitationPage from './pages/InvitationPage';
import AdminRolesPage from './pages/AdminRolesPage';
import GalleryPage from './pages/GalleryPage';
import TimelinePage from './pages/TimelinePage';
import ScanQRPage from './pages/ScanQRPage';

// Account Pages
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotificationPage from './pages/NotificationPage';

// Navigation Component
import Navigation from './components/Navigation';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Layout for protected routes
function DashboardLayout({ children }) {
  return (
    <div className="app-layout">
      <Navigation />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />

          {/* Protected Host Routes */}
          <Route path="/host/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout><HostDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/host/home" element={
            <ProtectedRoute>
              <DashboardLayout><HostHomePage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/host/create-event" element={
            <ProtectedRoute>
              <DashboardLayout><CreateEventPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/host/guest-list" element={
            <ProtectedRoute>
              <DashboardLayout><GuestListPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/host/invitation" element={
            <ProtectedRoute>
              <DashboardLayout><InvitationPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/host/admin-roles" element={
            <ProtectedRoute>
              <DashboardLayout><AdminRolesPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/gallery" element={
            <ProtectedRoute>
              <DashboardLayout><GalleryPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/timeline" element={
            <ProtectedRoute>
              <DashboardLayout><TimelinePage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/scan-qr" element={
            <ProtectedRoute>
              <DashboardLayout><ScanQRPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout><ProfilePage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout><SettingsPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/notification" element={
            <ProtectedRoute>
              <DashboardLayout><NotificationPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
      }
