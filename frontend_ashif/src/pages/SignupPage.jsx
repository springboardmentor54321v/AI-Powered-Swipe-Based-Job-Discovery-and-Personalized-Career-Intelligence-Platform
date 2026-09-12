import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Upload,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Building2,
  ShieldCheck,
  Building
} from "lucide-react";
import { useApp } from "../context/AppContext";

const ROLES = [
  {
    id: "seeker",
    label: "Job Seeker",
    icon: UserCheck,
    description: "Discover opportunities, swipe jobs, and track applications",
    color: "emerald",
    redirectPath: "/"
  },
  {
    id: "recruiter",
    label: "Recruiter",
    icon: Building2,
    description: "Post jobs, review candidate applicants, and hire talent",
    color: "blue",
    redirectPath: "/recruiter"
  },
  {
    id: "admin",
    label: "Admin",
    icon: ShieldCheck,
    description: "Platform governance, security, and administrative operations",
    color: "purple",
    redirectPath: "/admin"
  }
];

export function SignupPage() {
  const [searchParams] = useSearchParams();
  const initialRoleParam = searchParams.get("role");
  const initialRole = ROLES.find((r) => r.id === initialRoleParam)?.id || "seeker";

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(false);

  // Common and role-specific form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    // Candidate fields
    role: "Full Stack Developer",
    experience: "Fresher",
    resumeName: "",
    // Recruiter fields
    companyName: "",
    industry: "SaaS & Cloud Computing",
    companySize: "50-200"
  });

  const { login, switchRole, addToast } = useApp();
  const navigate = useNavigate();

  const currentRoleData = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeSimulate = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        resumeName: e.target.files[0].name
      }));
      addToast(`Selected ${e.target.files[0].name}`, "info");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Guard: Admin public signup is completely blocked
    if (selectedRole === "admin") {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      switchRole(selectedRole);

      login({
        name: formData.name || (selectedRole === "recruiter" ? "Recruiter" : "Ashif Siddique"),
        email: formData.email || (selectedRole === "recruiter" ? "recruiter@company.com" : "user@swipex.io"),
        role:
          selectedRole === "recruiter"
            ? "Lead Talent Partner"
            : formData.role,
        company: formData.companyName || "Acme Tech",
        appRole: selectedRole
      });

      setIsLoading(false);
      addToast(`Account created successfully as ${currentRoleData.label}!`, "success");
      navigate(currentRoleData.redirectPath);
    }, 450);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-md p-8 sm:p-10 space-y-7 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-xs mb-1">
            SX
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Your SwipeX Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Choose your account role to register and customize your workspace
          </p>
        </div>

        {/* Step 1: Role Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
            Step 1: Choose Your Account Role
          </label>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  id={`role-btn-${role.id}`}
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-center transition-all ${
                    isSelected
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold"
                      : "text-slate-500 hover:text-slate-800 font-semibold"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? role.id === "recruiter"
                          ? "bg-blue-50 text-blue-600"
                          : role.id === "admin"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs leading-tight">{role.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            {currentRoleData.description}
          </p>
        </div>

        {/* Step 2: Role-Specific Form or Admin Restriction Message */}
        {selectedRole === "admin" ? (
          <div className="border-t border-slate-100 pt-6 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200/80 text-purple-700 mx-auto flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-6 h-6 text-purple-700" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-700">
                  Admin Account
                </h2>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Admin accounts are created and managed by the platform administrator.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Public registration is not available for Admin accounts. Please contact the platform administrator if you need Admin access.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  id="btn-back-to-login"
                  onClick={() => navigate("/login?role=admin")}
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-98 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Step 2: Enter {currentRoleData.label} Information
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Ashif Siddique"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                {selectedRole === "recruiter"
                  ? "Work Email Address"
                  : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={
                    selectedRole === "recruiter"
                      ? "sarah@company.com"
                      : "ashif@example.com"
                  }
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 8 characters"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Job Seeker specific fields */}
            {selectedRole === "seeker" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Target Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      placeholder="e.g. Frontend Engineer"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Experience Level
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    >
                      <option value="Fresher">Fresher / 0 Years</option>
                      <option value="1-2 Years">Junior (1-2 Years)</option>
                      <option value="3-5 Years">Mid-Level (3-5 Years)</option>
                      <option value="5+ Years">Senior (5+ Years)</option>
                    </select>
                  </div>
                </div>

                {/* Optional Resume Upload simulation */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Resume / CV (Optional for ATS Scoring)
                  </label>
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeSimulate}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>
                        {formData.resumeName ? formData.resumeName : "Upload PDF or DOCX (Max 5MB)"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Recruiter specific fields */}
            {selectedRole === "recruiter" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="e.g. TechCorp Global"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Company Size
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  >
                    <option value="1-10">1-10 Employees (Seed / Early)</option>
                    <option value="11-50">11-50 Employees (Startup)</option>
                    <option value="50-200">50-200 Employees (Growth)</option>
                    <option value="200-1000">200-1000 Employees (Mid-Enterprise)</option>
                    <option value="1000+">1000+ Employees (MNC / Enterprise)</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              id="btn-signup-submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all mt-4"
            >
              <span>{isLoading ? `Registering as ${currentRoleData.label}...` : `Sign Up as ${currentRoleData.label}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              to={`/login?role=${selectedRole}`}
              className="text-emerald-700 font-bold hover:underline"
            >
              Sign in as {currentRoleData.label}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
