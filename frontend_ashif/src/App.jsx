import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation
} from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";

// Job Seeker Shared Components
import { Navbar } from "./components/Navbar";
import { FilterModal } from "./components/FilterModal";
import { ApplyModal } from "./components/ApplyModal";
import { ToastContainer } from "./components/Toast";

// Job Seeker Pages
import { DiscoverPage } from "./pages/DiscoverPage";
import { JobDetailsPage } from "./pages/JobDetailsPage";
import { SavedJobsPage } from "./pages/SavedJobsPage";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { ResumeAnalysisPage } from "./pages/ResumeAnalysisPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { CompaniesPage } from "./pages/CompaniesPage";
import { CompanyDetailsPage } from "./pages/CompanyDetailsPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";

// Recruiter Portal Components & Pages
import { RecruiterLayout } from "./components/recruiter/RecruiterLayout";
import { RecruiterDashboard } from "./pages/recruiter/RecruiterDashboard";
import { PostJobPage } from "./pages/recruiter/PostJobPage";
import { ManageJobsPage } from "./pages/recruiter/ManageJobsPage";
import { ApplicantsPage } from "./pages/recruiter/ApplicantsPage";
import { ApplicantDetailsPage } from "./pages/recruiter/ApplicantDetailsPage";
import { RecruiterProfilePage } from "./pages/recruiter/RecruiterProfilePage";
import { RecruiterNotificationsPage } from "./pages/recruiter/RecruiterNotificationsPage";

// Admin Portal Components & Pages
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import { RecruiterManagementPage } from "./pages/admin/RecruiterManagementPage";
import { JobManagementPage } from "./pages/admin/JobManagementPage";
import { ApplicationOverviewPage } from "./pages/admin/ApplicationOverviewPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { AdminNotificationsPage } from "./pages/admin/AdminNotificationsPage";

/**
 * JobSeekerLayout wraps the existing Candidate experience:
 * Header Navbar, Main body Outlet, Footer, FilterModal, ApplyModal.
 * The existing styling and swipe experience are 100% preserved.
 */
function JobSeekerLayout() {
  const { isFilterModalOpen, setIsFilterModalOpen, applyModalJob, setApplyModalJob } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">SwipeX</span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-600">
              Intelligent Swipe-Based Career & Talent Acquisition Platform
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            © {new Date().getFullYear()} SwipeX. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Candidate Modals */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />

      <ApplyModal
        job={applyModalJob}
        isOpen={Boolean(applyModalJob)}
        onClose={() => setApplyModalJob(null)}
      />
    </div>
  );
}

function AppContent() {
  const { currentRole, switchRole } = useApp();
  const location = useLocation();

  // Keep currentRole in context in sync with browser path
  useEffect(() => {
    if (location.pathname.startsWith("/recruiter") && currentRole !== "recruiter") {
      switchRole("recruiter");
    } else if (location.pathname.startsWith("/admin") && currentRole !== "admin") {
      switchRole("admin");
    } else if (
      !location.pathname.startsWith("/recruiter") &&
      !location.pathname.startsWith("/admin") &&
      currentRole !== "seeker"
    ) {
      switchRole("seeker");
    }
  }, [location.pathname, currentRole, switchRole]);

  return (
    <>
      <Routes>
        {/* ========================================================= */}
        {/* JOB SEEKER PORTAL (Preserved exactly with full functionality) */}
        {/* ========================================================= */}
        <Route element={<JobSeekerLayout />}>
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/saved" element={<SavedJobsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailsPage />} />
          <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* ========================================================= */}
        {/* RECRUITER / EMPLOYER PORTAL */}
        {/* ========================================================= */}
        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route index element={<RecruiterDashboard />} />
          <Route path="post-job" element={<PostJobPage />} />
          <Route path="manage-jobs" element={<ManageJobsPage />} />
          <Route path="applicants" element={<ApplicantsPage />} />
          <Route path="applicants/:id" element={<ApplicantDetailsPage />} />
          <Route path="profile" element={<RecruiterProfilePage />} />
          <Route path="notifications" element={<RecruiterNotificationsPage />} />
        </Route>

        {/* ========================================================= */}
        {/* PLATFORM ADMIN PORTAL */}
        {/* ========================================================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="recruiters" element={<RecruiterManagementPage />} />
          <Route path="jobs" element={<JobManagementPage />} />
          <Route path="applications" element={<ApplicationOverviewPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Toast Feedback Container (Active across all 3 portals) */}
      <ToastContainer />
    </>
  );
}

export function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
