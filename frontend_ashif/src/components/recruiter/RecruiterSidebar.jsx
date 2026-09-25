import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Users,
  Building2,
  Bell,
  LogOut,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { RoleSwitcher } from "../RoleSwitcher";

export function RecruiterSidebar({ mobile = false, onClose }) {
  const { recruiterProfile, recruiterJobs, recruiterApplicants, logout } = useApp();
  const navigate = useNavigate();

  const navLinks = [
    {
      to: "/recruiter",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true
    },
    {
      to: "/recruiter/post-job",
      label: "Post a Job",
      icon: PlusCircle
    },
    {
      to: "/recruiter/manage-jobs",
      label: "Manage Jobs",
      icon: Briefcase,
      badge: recruiterJobs?.length || null
    },
    {
      to: "/recruiter/applicants",
      label: "Applicants",
      icon: Users,
      badge: recruiterApplicants?.length || null
    },
    {
      to: "/recruiter/profile",
      label: "Company Profile",
      icon: Building2
    },
    {
      to: "/recruiter/notifications",
      label: "Notifications",
      icon: Bell,
      badge: 3
    }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`flex flex-col h-full bg-white border-r border-slate-200 ${
        mobile ? "w-full" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
        <Link
          to="/recruiter"
          onClick={onClose}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs font-bold text-sm">
            SX
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Swipe<span className="text-blue-600">X</span>
              </span>
              <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                Recruiter
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Employer Talent Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Recruiter / Company Snippet Card */}
      <div className="p-3.5 mx-3 mt-3 bg-slate-50 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <img
            src={recruiterProfile.logo}
            alt={recruiterProfile.companyName}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {recruiterProfile.companyName}
            </h4>
            <p className="text-[11px] text-slate-500 truncate">
              {recruiterProfile.name}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Recruiting Suite
        </p>

        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold shadow-xs border border-blue-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span className="px-2 py-0.5 bg-blue-100/80 text-blue-700 rounded-full text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-100">
          <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Workspace Mode
          </p>
          <div className="px-1">
            <RoleSwitcher className="w-full" />
          </div>
        </div>
      </nav>

      {/* Footer / Quick Actions */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 space-y-2">
        <Link
          to="/"
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Switch to Candidate App</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          id="btn-recruiter-logout"
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default RecruiterSidebar;
