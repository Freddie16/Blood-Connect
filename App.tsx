import React, { useState } from 'react';
import { AppView, BloodGroup, UserType } from './types';
import { Layout } from './components/Layout';
import { StaffDashboard } from './pages/StaffDashboard';
import { DonorDashboard } from './pages/DonorDashboard';
import { Appointments } from './pages/Appointments';
import { Chat } from './pages/Chat';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { DonorMap } from './pages/DonorMap';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Settings } from './pages/Settings';
import { EmergencyAlerts } from './pages/EmergencyAlerts';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState<AppView>(AppView.HOME);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BloodConnect...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const isStaff = user.userType === UserType.STAFF;

  return (
    <Layout view={view} setView={setView} isStaff={isStaff} user={user}>
      {view === AppView.HOME && !isStaff && <DonorDashboard user={user} />}
      {view === AppView.STAFF_DASHBOARD && isStaff && <StaffDashboard />}
      {view === AppView.APPOINTMENTS && <Appointments user={user} isStaff={isStaff} />}
      {view === AppView.CHAT_AI && <Chat />}
      {view === AppView.ALERTS && !isStaff && <EmergencyAlerts user={user} />}
      {view === AppView.PROFILE && <Profile />}
      {view === AppView.DONOR_MAP && !isStaff && <DonorMap user={user} />}
      {view === AppView.SETTINGS && <Settings />}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}