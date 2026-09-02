import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";

// Components
import { Navbar } from "./components/Navbar";
import { FilterModal } from "./components/FilterModal";
import { ApplyModal } from "./components/ApplyModal";
import { ToastContainer } from "./components/Toast";

// Pages
import { DiscoverPage } from "./pages/DiscoverPage";
import { JobDetailsPage } from "./pages/JobDetailsPage";
import { SavedJobsPage } from "./pages/SavedJobsPage";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { ResumeAnalysisPage } from "./pages/ResumeAnalysisPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { GoogleCallbackPage } from "./pages/GoogleCallbackPage";

function AppContent() {
  const {
    isFilterModalOpen,
    setIsFilterModalOpen,
    applyModalJob,
    setApplyModalJob,
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Global Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/saved" element={<SavedJobsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">
              SwipeX
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-600">
              Swipe-Based Intelligent Job Discovery and Career Assistance
              Platform
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            © {new Date().getFullYear()} SwipeX. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />

      <ApplyModal
        job={applyModalJob}
        isOpen={Boolean(applyModalJob)}
        onClose={() => setApplyModalJob(null)}
      />

      {/* Global Toast Feedback Notification Container */}
      <ToastContainer />
    </div>
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
