import React, { useEffect } from "react";

import { RefreshCw } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useApp } from "../context/AppContext";

export function GoogleCallbackPage() {
  const navigate = useNavigate();

  const { addToast } = useApp();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get("access_token");

    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      addToast("Google login failed.", "error");

      navigate("/login", {
        replace: true,
      });

      return;
    }

    // --------------------------------------------------------
    // Store tokens
    // --------------------------------------------------------

    localStorage.setItem("swipex_access_token", accessToken);

    localStorage.setItem("swipex_refresh_token", refreshToken);

    // --------------------------------------------------------
    // Remove tokens from browser URL
    // --------------------------------------------------------

    window.history.replaceState({}, document.title, "/auth/google/callback");

    // --------------------------------------------------------
    // AppContext will call /me after navigation
    // --------------------------------------------------------

    navigate("/discover", {
      replace: true,
    });
  }, [addToast, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center">
        <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin mx-auto mb-3" />

        <h2 className="text-sm font-bold text-slate-900">
          Completing Google Sign-In...
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Please wait while we load your SwipeX profile.
        </p>
      </div>
    </div>
  );
}

export default GoogleCallbackPage;
