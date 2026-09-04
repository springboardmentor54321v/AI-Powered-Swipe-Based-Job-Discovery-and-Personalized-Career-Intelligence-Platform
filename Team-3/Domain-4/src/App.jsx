import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import RoleDashboardShell from './layouts/RoleDashboardShell';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SwipeDiscoveryPage from './pages/SwipeDiscoveryPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import JobSeekerOverviewPage from './pages/dashboard/jobseeker/JobSeekerOverviewPage';
import JobSeekerSavedJobsPage from './pages/dashboard/jobseeker/JobSeekerSavedJobsPage';
import JobSeekerApplicationsPage from './pages/dashboard/jobseeker/JobSeekerApplicationsPage';
import JobSeekerAtsPage from './pages/dashboard/jobseeker/JobSeekerAtsPage';
import JobSeekerRecommendationsPage from './pages/dashboard/jobseeker/JobSeekerRecommendationsPage';
import RecruiterOverviewPage from './pages/dashboard/recruiter/RecruiterOverviewPage';
import RecruiterJobsPage from './pages/dashboard/recruiter/RecruiterJobsPage';
import RecruiterPostJobPage from './pages/dashboard/recruiter/RecruiterPostJobPage';
import RecruiterApplicationsPage from './pages/dashboard/recruiter/RecruiterApplicationsPage';
import RecruiterCandidatesPage from './pages/dashboard/recruiter/RecruiterCandidatesPage';
import AdminOverviewPage from './pages/dashboard/admin/AdminOverviewPage';
import AdminUsersPage from './pages/dashboard/admin/AdminUsersPage';
import AdminJobsPage from './pages/dashboard/admin/AdminJobsPage';
import AdminActivityPage from './pages/dashboard/admin/AdminActivityPage';
import authService from './services/auth';

function ProtectedRoute({ children }) {
  return authService.isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function DashboardRedirect() {
  const session = authService.getSession();
  const role = (session?.role || session?.user?.role || 'job_seeker').toLowerCase();
  const destination = role === 'recruiter' ? '/dashboard/recruiter' : role === 'admin' ? '/dashboard/admin' : '/dashboard/job-seeker';
  return <Navigate to={destination} replace />;
}

function RoleRoute({ allowedRole, children }) {
  const session = authService.getSession();
  const role = (session?.role || session?.user?.role || 'job_seeker').toLowerCase();
  return role === allowedRole ? children : <DashboardRedirect />;
}

function PublicPage({ children }) {
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPage><HomePage /></PublicPage>} />
        <Route path="/login" element={<PublicPage><LoginPage /></PublicPage>} />
        <Route path="/register" element={<PublicPage><RegisterPage /></PublicPage>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><Navigate to="/dashboard/job-seeker/discover" replace /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><Navigate to="/dashboard/job-seeker/resume" replace /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

        <Route path="/dashboard/job-seeker" element={<ProtectedRoute><RoleRoute allowedRole="job_seeker"><RoleDashboardShell /></RoleRoute></ProtectedRoute>}>
          <Route index element={<JobSeekerOverviewPage />} />
          <Route path="discover" element={<SwipeDiscoveryPage />} />
          <Route path="saved" element={<JobSeekerSavedJobsPage />} />
          <Route path="applications" element={<JobSeekerApplicationsPage />} />
          <Route path="resume" element={<ResumeUploadPage />} />
          <Route path="ats" element={<JobSeekerAtsPage />} />
          <Route path="recommendations" element={<JobSeekerRecommendationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/dashboard/recruiter" element={<ProtectedRoute><RoleRoute allowedRole="recruiter"><RoleDashboardShell /></RoleRoute></ProtectedRoute>}>
          <Route index element={<RecruiterOverviewPage />} />
          <Route path="jobs" element={<RecruiterJobsPage />} />
          <Route path="post-job" element={<RecruiterPostJobPage />} />
          <Route path="applications" element={<RecruiterApplicationsPage />} />
          <Route path="candidates" element={<RecruiterCandidatesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/dashboard/admin" element={<ProtectedRoute><RoleRoute allowedRole="admin"><RoleDashboardShell /></RoleRoute></ProtectedRoute>}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="activity" element={<AdminActivityPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
