import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { CategoryManagementPage } from './pages/CategoryManagementPage';
import { TableQRManagementPage } from './pages/TableQRManagementPage';
import { SpecialsManagementPage } from './pages/SpecialsManagementPage';
import { RatingsManagementPage } from './pages/RatingsManagementPage';
import { SettingsPage } from './pages/SettingsPage';
import { ActivityHistoryPage } from './pages/ActivityHistoryPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-xs text-[#6B655D]">
        Validating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Admin Portal */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="menu" element={<MenuManagementPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="tables" element={<TableQRManagementPage />} />
            <Route path="specials" element={<SpecialsManagementPage />} />
            <Route path="ratings" element={<RatingsManagementPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="activity" element={<ActivityHistoryPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
