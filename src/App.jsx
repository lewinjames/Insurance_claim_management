import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Claims from './pages/Claims.jsx';
import ClaimDetail from './pages/ClaimDetail.jsx';
import Policies from './pages/Policies.jsx';
import Policyholders from './pages/Policyholders.jsx';
import Reviews from './pages/Reviews.jsx';
import Settlements from './pages/Settlements.jsx';
import Users from './pages/Users.jsx';
import Reports from './pages/Reports.jsx';
import ERDiagram from './pages/ERDiagram.jsx';
import ProjectDocs from './pages/ProjectDocs.jsx';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-rose-200 m-6">
        <h3 className="text-lg font-bold text-rose-700">Access Restricted</h3>
        <p className="text-sm text-slate-500 mt-1">
          Your current role (<span className="font-semibold text-slate-800">{user?.role}</span>) does not have permission to view this page.
        </p>
      </div>
    );
  }

  return children;
}

// Main Layout Wrapper
function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/claims"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Claims />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/claims/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ClaimDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/policies"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Policies />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/policyholders"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Policyholders />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviews"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Claim Officer']}>
                <MainLayout>
                  <Reviews />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settlements"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settlements />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <MainLayout>
                  <Users />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/er-diagram"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ERDiagram />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/docs"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProjectDocs />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
