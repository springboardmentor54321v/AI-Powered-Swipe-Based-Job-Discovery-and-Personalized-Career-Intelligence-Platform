import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, Building2, ShieldCheck, ChevronDown, Check } from "lucide-react";
import { useApp } from "../context/AppContext";

export function RoleSwitcher({ className = "", compact = false }) {
  const { currentRole, switchRole } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roles = [
    {
      id: "seeker",
      label: "Job Seeker",
      icon: UserCheck,
      path: "/",
      badge: "Candidate Portal",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      id: "recruiter",
      label: "Recruiter",
      icon: Building2,
      path: "/recruiter",
      badge: "Employer Portal",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      id: "admin",
      label: "Platform Admin",
      icon: ShieldCheck,
      path: "/admin",
      badge: "Super Admin",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200"
    }
  ];

  const currentRoleObj = roles.find((r) => r.id === currentRole) || roles[0];
  const CurrentIcon = currentRoleObj.icon;

  const handleSelectRole = (role) => {
    switchRole(role.id);
    setIsOpen(false);
    navigate(role.path);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        id="btn-role-switcher"
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
          currentRole === "recruiter"
            ? "bg-blue-50/80 border-blue-200 text-blue-900 hover:bg-blue-100/80"
            : currentRole === "admin"
            ? "bg-purple-50/80 border-purple-200 text-purple-900 hover:bg-purple-100/80"
            : "bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100/80"
        }`}
        title="Switch user perspective (Job Seeker / Recruiter / Admin)"
      >
        <div
          className={`w-5 h-5 rounded-lg flex items-center justify-center text-white ${
            currentRole === "recruiter"
              ? "bg-blue-600"
              : currentRole === "admin"
              ? "bg-purple-600"
              : "bg-emerald-600"
          }`}
        >
          <CurrentIcon className="w-3 h-3" />
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold leading-none">
            Role
          </span>
          <span className="text-xs font-bold leading-tight">
            {compact ? currentRoleObj.label.split(" ")[0] : currentRoleObj.label}
          </span>
        </div>

        <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900">Switch Workspace Role</p>
            <p className="text-[11px] text-slate-500">
              Select an operational role to test or preview
            </p>
          </div>

          <div className="p-1.5 space-y-1">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = currentRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-slate-100 font-bold text-slate-900"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border ${role.badgeColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{role.label}</p>
                      <p className="text-[10px] text-slate-500">{role.badge}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleSwitcher;
