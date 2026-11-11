import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';

import { ErrorBoundary } from './components/common/ErrorBoundary';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DepositApprovalsPage } from './pages/admin/DepositApprovalsPage';
import { WithdrawalApprovalsPage } from './pages/admin/WithdrawalApprovalsPage';
import { RegistrationApprovalsPage } from './pages/admin/RegistrationApprovalsPage';
import { AthletesManagementPage } from './pages/admin/AthletesManagementPage';
import { TransactionsPage } from './pages/admin/TransactionsPage';
import { FinancialReportsPage } from './pages/admin/FinancialReportsPage';
import { ActivityLogsPage } from './pages/admin/ActivityLogsPage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { CustomQrStudioPage } from './pages/admin/CustomQrStudioPage';

import { AthleteDashboard } from './pages/athlete/AthleteDashboard';
import { DepositRequestPage } from './pages/athlete/DepositRequestPage';
import { WithdrawalRequestPage } from './pages/athlete/WithdrawalRequestPage';
import { DigitalPassbookPage } from './pages/athlete/DigitalPassbookPage';
import { AthleteTransactionsPage } from './pages/athlete/AthleteTransactionsPage';
import { AthleteProfilePage } from './pages/athlete/AthleteProfilePage';

// Protected Route Guard
interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 gap-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono">Memuat Sistem Tabungan IKS PI...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective home dashboard if they try to access unauthorized path
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/athlete/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Root index redirector
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 gap-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono">Menghubungkan ke Tabungan IKS PI...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/athlete/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Authenticated Routes with Main Layout */}
          <Route
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <AppLayout />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          >
            {/* ADMIN ROUTES */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/deposit-approvals"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DepositApprovalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/withdrawal-approvals"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <WithdrawalApprovalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/registration-approvals"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <RegistrationApprovalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/athletes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AthletesManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/transactions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <FinancialReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/activity-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ActivityLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <SystemSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/custom-qr"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <CustomQrStudioPage />
                </ProtectedRoute>
              }
            />

            {/* ATHLETE ROUTES */}
            <Route
              path="/athlete/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ATLIT', 'ADMIN']}>
                  <AthleteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/athlete/deposit"
              element={
                <ProtectedRoute allowedRoles={['ATLIT', 'ADMIN']}>
                  <DepositRequestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/athlete/withdraw"
              element={
                <ProtectedRoute allowedRoles={['ATLIT', 'ADMIN']}>
                  <WithdrawalRequestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/athlete/passbook"
              element={
                <ProtectedRoute allowedRoles={['ATLIT', 'ADMIN']}>
                  <DigitalPassbookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/athlete/transactions"
              element={
                <ProtectedRoute allowedRoles={['ATLIT', 'ADMIN']}>
                  <AthleteTransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/athlete/profile"
              element={
                <ProtectedRoute allowedRoles={['ATLIT', 'ADMIN']}>
                  <AthleteProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
