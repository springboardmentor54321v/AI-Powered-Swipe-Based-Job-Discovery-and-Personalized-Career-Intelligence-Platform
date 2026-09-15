import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import RoleDashboardShell from './layouts/RoleDashboardShell';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SwipeDiscoveryPage from './pages/SwipeDiscoveryPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import CompanyListPage from './pages/CompanyListPage';
import CompanyDetailPage from './pages/CompanyDetailPage';

// Job Seeker Sub-Pages
import JobSeekerOverviewPage from './pages/dashboard/jobseeker/JobSeekerOverviewPage';
import JobSeekerSavedJobsPage from './pages/dashboard/jobseeker/JobSeekerSavedJobsPage';
import JobSeekerApplicationsPage from './pages/dashboard/jobseeker/JobSeekerApplicationsPage';
import JobSeekerAtsPage from './pages/dashboard/jobseeker/JobSeekerAtsPage';
import JobSeekerRecommendationsPage from './pages/dashboard/jobseeker/JobSeekerRecommendationsPage';

// Recruiter Sub-Pages
import RecruiterOverviewPage from './pages/dashboard/recruiter/RecruiterOverviewPage';
import RecruiterJobsPage from './pages/dashboard/recruiter/RecruiterJobsPage';
import RecruiterPostJobPage from './pages/dashboard/recruiter/RecruiterPostJobPage';
import RecruiterApplicationsPage from './pages/dashboard/recruiter/RecruiterApplicationsPage';
import RecruiterCandidatesPage from './pages/dashboard/recruiter/RecruiterCandidatesPage';

// Admin Sub-Pages
import AdminOverviewPage from './pages/dashboard/admin/AdminOverviewPage';
import AdminUsersPage from './pages/dashboard/admin/AdminUsersPage';
import AdminJobsPage from './pages/dashboard/admin/AdminJobsPage';
import AdminActivityPage from './pages/dashboard/admin/AdminActivityPage';

import authService from './services/auth';

/**
 * Route guard requiring active authentication.
 */
function ProtectedRoute({ children }) {
  const [session, setSession] = useState(() => authService.getSession());
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = authService.subscribe((updatedSession) => {
      setSession(updatedSession);
    });
    return unsubscribe;
  }, []);

  const isAuthenticated = Boolean(session && session.access_token);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Strict Role Guard ensuring users only access their assigned role routes.
 */
function RoleRoute({ allowedRole, children }) {
  const session = authService.getSession();
  const currentRole = (session?.role || session?.user?.role || 'job_seeker').toLowerCase();

  if (currentRole !== allowedRole) {
    // Redirect to the user's correct role dashboard
    const target = currentRole === 'recruiter' 
      ? '/dashboard/recruiter' 
      : currentRole === 'admin' 
      ? '/dashboard/admin' 
      : '/dashboard/job-seeker';
    return <Navigate to={target} replace />;
  }

  return children;
}

/**
 * Redirect /dashboard to the active role's dashboard overview.
 */
function DashboardRedirect() {
  const session = authService.getSession();
  const currentRole = (session?.role || session?.user?.role || 'job_seeker').toLowerCase();

  const target = currentRole === 'recruiter'
    ? '/dashboard/recruiter'
    : currentRole === 'admin'
    ? '/dashboard/admin'
    : '/dashboard/job-seeker';

  return <Navigate to={target} replace />;
}

/**
 * Route guard for public-only pages (login/register).
 */
function PublicOnlyRoute({ children }) {
  const [session, setSession] = useState(() => authService.getSession());

  useEffect(() => {
    const unsubscribe = authService.subscribe((updatedSession) => {
      setSession(updatedSession);
    });
    return unsubscribe;
  }, []);

  const isAuthenticated = Boolean(session && session.access_token);

  if (isAuthenticated) {
    return <DashboardRedirect />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Public Marketing Landing & Auth Pages */}
        <Route 
          path="/" 
          element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicOnlyRoute>
              <AppLayout>
                <LoginPage />
              </AppLayout>
            </PublicOnlyRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicOnlyRoute>
              <AppLayout>
                <RegisterPage />
              </AppLayout>
            </PublicOnlyRoute>
          } 
        />

        {/* Global Redirects for direct legacy paths */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/discover" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard/job-seeker/discover" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resume" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard/job-seeker/resume" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/companies" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard/job-seeker/companies" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/companies/:id" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard/job-seeker/companies/:id" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } 
        />

        {/* 1. JOB SEEKER ROLE WORKSPACE */}
        <Route
          path="/dashboard/job-seeker"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="job_seeker">
                <RoleDashboardShell />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<JobSeekerOverviewPage />} />
          <Route path="discover" element={<SwipeDiscoveryPage />} />
          <Route path="companies" element={<CompanyListPage />} />
          <Route path="companies/:id" element={<CompanyDetailPage />} />
          <Route path="saved" element={<JobSeekerSavedJobsPage />} />
          <Route path="applications" element={<JobSeekerApplicationsPage />} />
          <Route path="resume" element={<ResumeUploadPage />} />
          <Route path="ats" element={<JobSeekerAtsPage />} />
          <Route path="recommendations" element={<JobSeekerRecommendationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* 2. RECRUITER ROLE WORKSPACE */}
        <Route
          path="/dashboard/recruiter"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="recruiter">
                <RoleDashboardShell />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<RecruiterOverviewPage />} />
          <Route path="jobs" element={<RecruiterJobsPage />} />
          <Route path="post-job" element={<RecruiterPostJobPage />} />
          <Route path="applications" element={<RecruiterApplicationsPage />} />
          <Route path="candidates" element={<RecruiterCandidatesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* 3. ADMIN ROLE WORKSPACE */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="admin">
                <RoleDashboardShell />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="activity" element={<AdminActivityPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback to root */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
