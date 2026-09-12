import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  Sparkles,
  Briefcase,
  FileText,
  Rocket,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { useApp } from "../context/AppContext";

export function NotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
    unreadNotificationsCount
  } = useApp();
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case "match":
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case "opportunity":
        return <Rocket className="w-5 h-5 text-purple-600" />;
      case "ats":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "application":
        return <Briefcase className="w-5 h-5 text-teal-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.jobId) {
      navigate(`/jobs/${notif.jobId}`);
    } else if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Bell className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Notifications
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {unreadNotificationsCount} unread alerts, job recommendations, and recruiter updates
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              id="btn-mark-all-read"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          )}

          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === "all"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === "unread"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            No notifications
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            You're all caught up! New job alerts, interview notifications, and ATS suggestions will appear here.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <span>Explore Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                notif.read
                  ? "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                  : "bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70 shadow-xs"
              }`}
            >
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{notif.time}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                {(notif.jobId || notif.link) && (
                  <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800">
                    <span>{notif.jobId ? "View Job Match" : "View Details"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(notif.id);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Dismiss notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
