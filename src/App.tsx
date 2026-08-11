import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatPage } from './pages/ChatPage';
import { ImagesPage } from './pages/ImagesPage';
import { ModelsPage } from './pages/ModelsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminModelsPage } from './pages/admin/AdminModelsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminUsagePage } from './pages/admin/AdminUsagePage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-slate-400 text-xs">
        Initializing VectorEngine...
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
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Workspace Routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/images"
            element={
              <ProtectedRoute>
                <ImagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/models"
            element={
              <ProtectedRoute>
                <ModelsPage />
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
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Platform Control Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/models"
            element={
              <ProtectedRoute>
                <AdminModelsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute>
                <AdminLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usage"
            element={
              <ProtectedRoute>
                <AdminUsagePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
