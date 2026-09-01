import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-content">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children || <Outlet />}
      </main>
      <footer className="border-t border-outline-variant/60 py-6 text-center text-xs text-content-subtle">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 SwipeX. Swipe-based job discovery.</p>
          <p>Milestone 1</p>
        </div>
      </footer>
    </div>
  );
}
