import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.js';
import { LoginPage } from './pages/LoginPage.js';
import { AuthCallbackPage } from './pages/AuthCallbackPage.js';
import { OnboardingPage } from './pages/OnboardingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { AISettingsPage } from './pages/AISettingsPage.js';
import { ThumbnailCreatorPage } from './pages/ThumbnailCreatorPage.js';
import { VersePosterCreatorPage } from './pages/VersePosterCreatorPage.js';
import { ProjectsPage } from './pages/ProjectsPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { ProfilePage } from './pages/ProfilePage.js';

// Route Guard Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-gold-400">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-cinzel">Loading Faith & Creator Studio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected Routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/ai"
            element={
              <ProtectedRoute>
                <AISettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create/thumbnail"
            element={
              <ProtectedRoute>
                <ThumbnailCreatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create/verse"
            element={
              <ProtectedRoute>
                <VersePosterCreatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
