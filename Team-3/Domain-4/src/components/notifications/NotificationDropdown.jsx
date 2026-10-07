import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import NotificationItem from './NotificationItem';

export default function NotificationDropdown({
  notifications = [],
  unreadCount = 0,
  loading = false,
  error = null,
  onMarkRead,
  onClose,
  historyPath = '/dashboard/job-seeker/notifications',
}) {
  return (
    <div
      role="dialog"
      aria-label="Notification center"
      className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-3xl bg-[#12131a] border border-white/[0.1] shadow-2xl shadow-black/80 z-50 overflow-hidden animate-scaleIn flex flex-col max-h-[500px]"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-surface">
              {unreadCount} new
            </span>
          )}
        </div>
        <Link
          to={historyPath}
          onClick={onClose}
          className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
        >
          <span>All history</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Body / List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y-0">
        {loading && (
          <div className="py-8 text-center space-y-2">
            <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" />
            <p className="text-xs text-content-subtle">Checking for alerts...</p>
          </div>
        )}

        {!loading && error && (
          <div className="py-6 px-4 text-center space-y-2 bg-red-950/20 border border-red-800/30 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-400 mx-auto" />
            <p className="text-xs text-red-300 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="py-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto text-content-subtle">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-content">All caught up!</p>
            <p className="text-[11px] text-content-subtle max-w-[200px] mx-auto">
              New job alerts and application status updates will appear here.
            </p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={onMarkRead}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.08] bg-white/[0.02] text-center">
        <Link
          to={historyPath}
          onClick={onClose}
          className="text-xs text-content-subtle hover:text-white transition-colors"
        >
          View notification preferences & full archive
        </Link>
      </div>
    </div>
  );
}
