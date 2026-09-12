import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Bell,
  PlusCircle,
  Building2,
  LogOut,
  User
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { RoleSwitcher } from "../RoleSwitcher";

export function RecruiterNavbar({ onToggleMobileMenu, isMobileMenuOpen }) {
  const { recruiterProfile, logout } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs h-16">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Side: Mobile Menu Button & Page Title / Breadcrumb context */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Employer Portal</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800">
              {recruiterProfile.companyName}
            </span>
          </div>
        </div>

        {/* Right Side: Quick Action + Role Switcher + Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Post Job Quick CTA */}
          <Link
            to="/recruiter/post-job"
            id="btn-nav-post-job"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Post a Job</span>
          </Link>

          {/* Role Switcher Pill */}
          <RoleSwitcher />

          {/* Notifications */}
          <Link
            to="/recruiter/notifications"
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          </Link>

          {/* Recruiter Avatar Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-all"
            >
              <img
                src={recruiterProfile.logo}
                alt={recruiterProfile.name}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {recruiterProfile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {recruiterProfile.email}
                  </p>
                </div>

                <Link
                  to="/recruiter/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Company Profile</span>
                </Link>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default RecruiterNavbar;
