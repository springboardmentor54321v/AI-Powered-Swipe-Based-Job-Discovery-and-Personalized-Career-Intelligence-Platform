import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Sparkles,
  Bookmark,
  Briefcase,
  FileCheck,
  LayoutDashboard,
  User,
  Bell,
  Compass,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Building2,
  ShieldCheck
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { NotificationPanel } from "./NotificationPanel";
import { RoleSwitcher } from "./RoleSwitcher";

export function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
    unreadNotificationsCount,
    savedJobs,
    applications
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: "Discover", icon: Compass },
    { to: "/companies", label: "Companies", icon: Building2 },
    { to: "/saved", label: "Saved Jobs", icon: Bookmark, badge: savedJobs?.length > 0 ? savedJobs.length : null },
    { to: "/applications", label: "Applications", icon: Briefcase, badge: applications?.length > 0 ? applications.length : null },
    { to: "/recommendations", label: "Recommendations", icon: Sparkles },
    { to: "/resume-analysis", label: "Resume ATS", icon: FileCheck },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-base transition-transform group-hover:scale-105">
                SX
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  Swipe<span className="text-emerald-600">X</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline -mt-0.5">
                  Job Discovery & Career Assistant
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "text-emerald-700 bg-emerald-50 font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                    {link.badge !== null && link.badge !== undefined && (
                      <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Global Role Switcher */}
            <RoleSwitcher />

            {isAuthenticated ? (
              <>
                {/* Notification Trigger */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    id="btn-navbar-notifications"
                    className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>
                  <NotificationPanel
                    isOpen={isNotifOpen}
                    onClose={() => setIsNotifOpen(false)}
                  />
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    id="btn-navbar-profile"
                    className="flex items-center gap-2 p-1.5 pl-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                  >
                    <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                      {user?.name || "Candidate"}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center overflow-hidden font-bold text-xs">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name || "Candidate"}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile & Skills</span>
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Career Dashboard</span>
                      </Link>

                      <div className="my-1 border-t border-slate-100" />

                      <Link
                        to="/recruiter"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <span>Recruiter Workspace</span>
                      </Link>

                      <Link
                        to="/admin"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-500" />
                        <span>Admin Console</span>
                      </Link>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-md animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== null && link.badge !== undefined && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-100">
            <NavLink
              to="/profile"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Profile & Skills</span>
            </NavLink>
            <NavLink
              to="/notifications"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-slate-400" />
                <span>Notifications</span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-xs font-bold">
                  {unreadNotificationsCount}
                </span>
              )}
            </NavLink>

            <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
              <NavLink
                to="/recruiter"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>Recruiter Workspace</span>
              </NavLink>
              <NavLink
                to="/admin"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-purple-700 hover:bg-purple-50"
              >
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                <span>Admin Console</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
