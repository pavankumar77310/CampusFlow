import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected Pages
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventManagementPage from './pages/EventManagementPage';
import ResourceBookingPage from './pages/ResourceBookingPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Dashboard Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Student Workspace */}
              <Route
                path="/dashboard/student"
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Faculty Workspace */}
              <Route
                path="/dashboard/faculty"
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                    <FacultyDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Workspace */}
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Shared Core Modules */}
              <Route path="/events" element={<EventManagementPage />} />
              <Route path="/resources" element={<ResourceBookingPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
