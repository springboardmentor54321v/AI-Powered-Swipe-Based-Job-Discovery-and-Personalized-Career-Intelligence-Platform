import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Zap,
  Chrome,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export function LoginPage() {
  const { login, addToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================
  // EMAIL LOGIN
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const ok = await login(email, password);

      if (ok) {
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // DEMO LOGIN
  // ============================================================

  const handleDemoLogin = async () => {
    setEmail("demo@swipex.io");
    setPassword("Demo@12345");

    setIsLoading(true);

    try {
      const ok = await login(
        "demo@swipex.io",
        "Demo@12345"
      );

      if (ok) {
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

  const handleGoogleLogin = () => {
    const authBaseUrl =
      import.meta.env.VITE_AUTH_API_BASE_URL ||
      "http://127.0.0.1:5001/api/v1";

    window.location.href =
      `${authBaseUrl}/auth/google`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-md p-8 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">

        {/* ====================================================
            LOGO & HEADER
        ===================================================== */}

        <div className="text-center space-y-2">

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-xs mb-1">
            SX
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h1>

            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mt-0.5">
              SwipeX Job Discovery
            </p>
          </div>

          <p className="text-xs text-slate-500 pt-1">
            Sign in to discover jobs, get ATS resume insights,
            and track applications
          </p>

        </div>

        {/* ====================================================
            GOOGLE LOGIN
        ===================================================== */}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          id="btn-google-login"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 disabled:opacity-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Chrome className="w-4 h-4" />

          <span>
            Continue with Google
          </span>
        </button>

        {/* ====================================================
            DIVIDER
        ===================================================== */}

        <div className="relative flex items-center justify-center">

          <div className="border-t border-slate-200 w-full" />

          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 absolute">
            Or sign in with email
          </span>

        </div>

        {/* ====================================================
            DEMO LOGIN
        ===================================================== */}

        <button
          type="button"
          onClick={handleDemoLogin}
          id="btn-demo-login"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-colors group"
        >
          <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600 group-hover:scale-110 transition-transform" />

          <span>
            One-Click Demo Candidate Login
          </span>
        </button>

        {/* ====================================================
            LOGIN FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* EMAIL */}

          <div>

            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>

            <div className="relative">

              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div>

            <div className="flex items-center justify-between mb-1.5">

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>

              <button
                type="button"
                onClick={() =>
                  addToast(
                    "Password reset link sent to demo email.",
                    "info"
                  )
                }
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Forgot password?
              </button>

            </div>

            <div className="relative">

              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />

            </div>

          </div>

          {/* REMEMBER ME */}

          <div className="flex items-center">

            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
                className="w-4 h-4 rounded accent-emerald-600 border-slate-300"
              />

              <span>
                Remember me on this device
              </span>

            </label>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={isLoading}
            id="btn-login-submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all"
          >

            <span>
              {isLoading
                ? "Signing in..."
                : "Log In"}
            </span>

            <ArrowRight className="w-4 h-4" />

          </button>

        </form>

        {/* ====================================================
            FOOTER
        ===================================================== */}

        <div className="text-center pt-2 border-t border-slate-100">

          <p className="text-xs text-slate-500">

            Don't have an account?{" "}

            <Link
              to="/signup"
              className="text-emerald-700 font-bold hover:underline"
            >
              Create an account
            </Link>

          </p>

        </div>

      </div>
    </div>
  );
}

export default LoginPage;