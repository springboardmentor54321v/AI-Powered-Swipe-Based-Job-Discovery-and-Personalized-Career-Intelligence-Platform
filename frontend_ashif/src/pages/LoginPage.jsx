import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Zap,
  UserCheck,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Building,
  KeyRound
} from "lucide-react";
import { useApp } from "../context/AppContext";

const ROLES = [
  {
    id: "seeker",
    label: "Job Seeker",
    icon: UserCheck,
    description: "Discover opportunities, swipe jobs, and track applications",
    color: "emerald",
    badge: "Candidate",
    demoUser: {
      name: "Ashif Siddique",
      email: "ashif.siddique@swipex.io",
      role: "Full Stack Developer",
      appRole: "seeker"
    },
    redirectPath: "/"
  },
  {
    id: "recruiter",
    label: "Recruiter",
    icon: Building2,
    description: "Post job openings, manage candidates, and track applicants",
    color: "blue",
    badge: "Employer",
    demoUser: {
      name: "Sarah Jenkins",
      email: "sarah.j@techcorp.io",
      role: "Lead Technical Recruiter",
      company: "TechCorp Global",
      appRole: "recruiter"
    },
    redirectPath: "/recruiter"
  },
  {
    id: "admin",
    label: "Platform Admin",
    icon: ShieldCheck,
    description: "Monitor platform metrics, manage users, and review jobs",
    color: "purple",
    badge: "Admin",
    demoUser: {
      name: "Alexander Vance",
      email: "admin@swipex.io",
      role: "Platform Administrator",
      appRole: "admin"
    },
    redirectPath: "/admin"
  }
];

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRoleParam = searchParams.get("role");
  const initialRole = ROLES.find((r) => r.id === initialRoleParam)?.id || "seeker";

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { login, switchRole, addToast } = useApp();
  const navigate = useNavigate();

  const currentRoleData = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setEmail("");
    setPassword("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      switchRole(selectedRole);
      login({
        email: email || currentRoleData.demoUser.email,
        name: email ? email.split("@")[0] : currentRoleData.demoUser.name,
        role: currentRoleData.demoUser.role,
        appRole: selectedRole
      });
      setIsLoading(false);
      navigate(currentRoleData.redirectPath);
    }, 400);
  };

  const handleDemoLogin = () => {
    setEmail(currentRoleData.demoUser.email);
    setPassword("password123");
    setIsLoading(true);

    setTimeout(() => {
      switchRole(selectedRole);
      login(currentRoleData.demoUser);
      setIsLoading(false);
      navigate(currentRoleData.redirectPath);
    }, 300);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-md p-8 sm:p-10 space-y-7 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-xs mb-1">
            SX
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to SwipeX
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Choose your account role to access your dedicated workspace and tools
          </p>
        </div>

        {/* Step 1: Role Selection Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
            Step 1: Select Your Role
          </label>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleChange(role.id)}
                  id={`role-btn-${role.id}`}
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

        {/* Demo Fast Login Trigger tailored to selected role */}
        <button
          type="button"
          onClick={handleDemoLogin}
          id="btn-demo-login"
          className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-all group"
        >
          <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600 group-hover:scale-110 transition-transform" />
          <span>One-Click Demo {currentRoleData.label} Login</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 absolute">
            Or sign in with {currentRoleData.label} credentials
          </span>
        </div>

        {/* Step 2: Login Form for selected role */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              {selectedRole === "recruiter"
                ? "Work Email Address"
                : selectedRole === "admin"
                ? "Admin Email / Account ID"
                : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedRole === "recruiter"
                    ? "sarah@company.com"
                    : selectedRole === "admin"
                    ? "admin@swipex.io"
                    : "name@example.com"
                }
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                {selectedRole === "admin" ? "Admin Security Passkey" : "Password"}
              </label>
              <button
                type="button"
                onClick={() => addToast("Password reset link sent to registered email.", "info")}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              {selectedRole === "admin" ? (
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              )}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-600 border-slate-300"
              />
              <span>Remember me on this browser</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            id="btn-login-submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all"
          >
            <span>{isLoading ? `Authenticating as ${currentRoleData.label}...` : `Sign In as ${currentRoleData.label}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{" "}
            <Link
              to={`/signup?role=${selectedRole}`}
              className="text-emerald-700 font-bold hover:underline"
            >
              Sign up as {currentRoleData.label}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
