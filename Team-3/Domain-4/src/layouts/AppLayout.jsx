import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck, Compass, FileText, LayoutDashboard, User, Globe, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d12] text-content relative overflow-x-hidden selection:bg-primary/30 selection:text-white">
      
      {/* Subtle Ambient Radial Lighting */}
      <div 
        className="fixed top-0 left-1/4 w-[600px] max-w-[80vw] h-[350px] bg-[#0070ad]/5 rounded-full blur-3xl pointer-events-none -z-10" 
        aria-hidden="true" 
      />
      <div 
        className="fixed bottom-0 right-1/4 w-[500px] max-w-[80vw] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pageEnter">
        {children || <Outlet />}
      </main>

      {/* Enterprise Multi-Column Footer */}
      <footer className="border-t border-white/[0.08] bg-[#090a0e] pt-12 pb-8 text-xs text-content-subtle mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          
          {/* Top Row: Brand & Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-surface font-black text-base shadow-sm">
                  X
                </div>
                <span className="font-extrabold text-lg tracking-tight text-content">
                  SwipeX
                </span>
              </div>
              <p className="text-xs text-content-muted leading-relaxed">
                The next-generation swipe-based employment matchmaking platform. Engineered for speed, transparency, and career readiness.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0070ad]/15 text-[#0070ad] text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0070ad]" />
                <span>Infosys Springboard Product</span>
              </div>
            </div>

            {/* Navigation Column */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content">Platform Workspaces</h4>
              <ul className="space-y-2 text-content-muted text-xs">
                <li>
                  <Link to="/" className="hover:text-content transition-colors flex items-center gap-1.5">
                    <span>Overview & Home</span>
                  </Link>
                </li>
                <li>
                  <Link to="/discover" className="hover:text-content transition-colors flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-primary" />
                    <span>Swipe Discovery Deck</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-content transition-colors flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Role-Based Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link to="/resume" className="hover:text-content transition-colors flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>ATS Resume Studio</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Personas Column */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content">User Solutions</h4>
              <ul className="space-y-2 text-content-muted text-xs">
                <li>
                  <span className="font-medium text-content">For Job Seekers:</span>
                  <p className="text-[11px] text-content-subtle">Instant swipe applications & keyword readiness</p>
                </li>
                <li>
                  <span className="font-medium text-content">For Hiring Teams:</span>
                  <p className="text-[11px] text-content-subtle">Direct applicant stream from right-swipes</p>
                </li>
                <li>
                  <span className="font-medium text-content">For Enterprise:</span>
                  <p className="text-[11px] text-content-subtle">Verified candidate pool & RBAC governance</p>
                </li>
              </ul>
            </div>

            {/* Enterprise Security Column */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content">Security & Trust</h4>
              <ul className="space-y-2 text-content-muted text-xs">
                <li className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>256-Bit Document Encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Strict Data Privacy Governance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>99.98% High Availability Cluster</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Row */}
          <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-content-subtle">
            <p>© 2026 SwipeX. A Product of Infosys. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span>Infosys Springboard Innovation</span>
              <span>•</span>
              <span>Enterprise Grade Platform</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
