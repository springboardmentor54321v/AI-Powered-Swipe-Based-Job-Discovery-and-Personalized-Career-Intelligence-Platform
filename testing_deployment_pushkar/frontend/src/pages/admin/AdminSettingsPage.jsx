import React, { useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Sliders,
  CheckCircle2,
  Save,
  Server,
  Lock,
  Sparkles
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export function AdminSettingsPage() {
  const { adminProfile, updateAdminProfile, addToast } = useApp();

  const [formData, setFormData] = useState({
    name: adminProfile.name || "Alex Mercer",
    email: adminProfile.email || "alex.mercer@swipex.internal",
    role: adminProfile.role || "Platform Super Administrator",
    maintenanceMode: false,
    autoApproveVerifiedRecruiters: true,
    minAtsThreshold: 65,
    emailAlerts: true,
    recruiterOnboardingOpen: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateAdminProfile({
      name: formData.name,
      email: formData.email,
      role: formData.role
    });
    addToast("Platform administrative policies updated successfully", "success");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System Configuration & Admin Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure ecosystem parameters, algorithmic ATS match thresholds, and admin identity.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Admin Identity Card */}
        <div className="bg-slate-900/90 dark:bg-zinc-800/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={adminProfile.avatar}
              alt={adminProfile.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/40"
            />
            <div>
              <h2 className="text-lg font-bold text-white">{adminProfile.name}</h2>
              <p className="text-xs text-purple-400 font-semibold">{adminProfile.role}</p>
              <p className="text-xs text-slate-400 mt-0.5">Permissions: Full SuperAdmin Rights</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 dark:bg-zinc-700/80 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                System Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 dark:bg-zinc-700/80 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Global Policy Toggles */}
        <div className="bg-slate-900/90 dark:bg-zinc-800/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Platform Governance Policies</span>
          </h3>

          <div className="space-y-4">
            {/* Toggle 1: Auto Approve Verified Recruiters */}
            <div className="flex items-center justify-between p-3.5 bg-slate-800/50 dark:bg-zinc-700/50 rounded-2xl border border-slate-700/60">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Auto-Verify Corporate Domain Employers</p>
                <p className="text-[11px] text-slate-400">
                  Instantly activate recruiters registering with authenticated company domains
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.autoApproveVerifiedRecruiters}
                onChange={(e) =>
                  setFormData({ ...formData, autoApproveVerifiedRecruiters: e.target.checked })
                }
                className="w-4 h-4 rounded text-purple-600 dark:text-purple-400 bg-slate-800 dark:bg-zinc-700 border-slate-600 focus:ring-purple-500"
              />
            </div>

            {/* Toggle 2: Recruiter Registration Open */}
            <div className="flex items-center justify-between p-3.5 bg-slate-800/50 dark:bg-zinc-700/50 rounded-2xl border border-slate-700/60">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Open Employer Registration Portal</p>
                <p className="text-[11px] text-slate-400">
                  Allow new enterprises and hiring teams to create recruiter workspaces
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.recruiterOnboardingOpen}
                onChange={(e) =>
                  setFormData({ ...formData, recruiterOnboardingOpen: e.target.checked })
                }
                className="w-4 h-4 rounded text-purple-600 dark:text-purple-400 bg-slate-800 dark:bg-zinc-700 border-slate-600 focus:ring-purple-500"
              />
            </div>

            {/* Minimum ATS Score Slider */}
            <div className="p-3.5 bg-slate-800/50 dark:bg-zinc-700/50 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-white">Recommended ATS Passmark Benchmark</span>
                <span className="text-purple-400 font-bold">{formData.minAtsThreshold}% Match</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                value={formData.minAtsThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, minAtsThreshold: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-[11px] text-slate-400">
                Applicants meeting this baseline are tagged with high-priority match badges.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Policy Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminSettingsPage;
