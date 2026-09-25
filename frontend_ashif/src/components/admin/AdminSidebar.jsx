import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Users,
  Building2,
  Briefcase,
  FileSpreadsheet,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { RoleSwitcher } from "../RoleSwitcher";

export function AdminSidebar({ mobile = false, onClose }) {
  const { adminUsers, adminRecruiters, adminJobs, adminApplications, logout } = useApp();
  const navigate = useNavigate();

  const navLinks = [
    {
      to: "/admin",
      label: "Overview",
      icon: BarChart3,
      end: true
    },
    {
      to: "/admin/users",
      label: "User Management",
      icon: Users,
      badge: adminUsers?.length || null
    },
    {
      to: "/admin/recruiters",
      label: "Recruiters & Orgs",
      icon: Building2,
      badge: adminRecruiters?.length || null
    },
    {
      to: "/admin/jobs",
      label: "Job Moderation",
      icon: Briefcase,
      badge: adminJobs?.length || null
    },
    {
      to: "/admin/applications",
      label: "Applications",
      icon: FileSpreadsheet,
      badge: adminApplications?.length || null
    },
    {
      to: "/admin/reports",
      label: "Platform Analytics",
      icon: BarChart3
    },
    {
      to: "/admin/notifications",
      label: "System Alerts",
      icon: Bell,
      badge: 2
    },
    {
      to: "/admin/settings",
      label: "Admin Settings",
      icon: Settings
    }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 ${
        mobile ? "w-full" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
        <Link
          to="/admin"
          onClick={onClose}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs font-bold text-sm">
            SX
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white tracking-tight">
                Swipe<span className="text-purple-400">X</span>
              </span>
              <span className="px-1.5 py-0.2 bg-purple-900/60 text-purple-300 border border-purple-700/60 rounded text-[10px] font-bold">
                Admin
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Platform Control Center
            </span>
          </div>
        </Link>
      </div>

      {/* Admin Status Pill */}
      <div className="p-3 mx-3 mt-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Super Admin Role</p>
            <p className="text-[10px] text-emerald-400">All Nodes Operational • 99.98%</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Administration
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
                    ? "bg-purple-600 text-white font-bold shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded-full text-[10px] font-bold border border-slate-700"
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800">
          <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Workspace Mode
          </p>
          <div className="px-1">
            <RoleSwitcher className="w-full" />
          </div>
        </div>
      </nav>

      {/* Footer / Quick Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 space-y-1.5">
        <Link
          to="/"
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Job Seeker App</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          id="btn-admin-logout"
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
