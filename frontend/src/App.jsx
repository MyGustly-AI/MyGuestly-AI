import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import LandingPage from './pages/LandingPage';
import HowItWorks from './pages/HowItWorks';
import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
/*import HostSignUpPage from './pages/HostSignUpPage';*/
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        {/* <Route path="/host-signup" element={<HostSignUpPage />} /> */}
        <Route path="/host/home" element={<HostHomePage />} />
        <Route path="/host/dashboard" element={<HostDashboard />} />
        <Route path="/host/create-event" element={<CreateEventPage />} />
        <Route path="/host/invitation" element={<InvitationPage />} />
        <Route path="/host/guest-list" element={<GuestListPage />} />
        <Route path="/host/admin-roles" element={<AdminRolesPage />} />
        <Route path="/guest/dashboard" element={<GuestDashboard />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/scan-qr" element={<ScanQRPage />} />
      </Routes>
    </BrowserRouter>
  );
}
