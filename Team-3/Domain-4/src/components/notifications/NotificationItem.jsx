import React from 'react';
import {
  Bell,
  Sparkles,
  Building2,
  Target,
  Users,
  Send,
  CheckCircle2,
  Clock
} from 'lucide-react';

export function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export function getNotificationBadge(type) {
  switch (type) {
    case 'instant_job':
      return { icon: Sparkles, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40', label: 'Instant Job' };
    case 'startup_hiring':
      return { icon: Building2, color: 'text-purple-400 bg-purple-950/40 border-purple-800/40', label: 'Startup Alert' };
    case 'high_match':
      return { icon: Target, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40', label: 'High Match' };
    case 'low_competition':
      return { icon: Users, color: 'text-blue-400 bg-blue-950/40 border-blue-800/40', label: 'Low Competition' };
    case 'application_status':
      return { icon: Send, color: 'text-primary bg-primary/20 border-primary/40', label: 'Application' };
    default:
      return { icon: Bell, color: 'text-content-muted bg-white/[0.05] border-white/[0.1]', label: 'Alert' };
  }
}

export default function NotificationItem({ notification, onMarkRead }) {
  if (!notification) return null;

  const isUnread = !notification.read_at;
  const badge = getNotificationBadge(notification.type);
  const Icon = badge.icon;

  const handleClick = () => {
    if (isUnread && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${badge.label}: ${notification.title || 'Notification'}. ${isUnread ? 'Unread, click to mark as read' : 'Read'}`}
      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative focus:outline-none focus:ring-1 focus:ring-primary ${
        isUnread
          ? 'bg-white/[0.04] hover:bg-white/[0.07] border-white/[0.12]'
          : 'bg-transparent hover:bg-white/[0.02] border-white/[0.04] opacity-80'
      }`}
    >
      {/* Icon Badge */}
      <div className={`p-2 rounded-xl border shrink-0 ${badge.color}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-white truncate">
            {notification.title || 'Notification'}
          </span>
          <span className="text-[10px] text-content-subtle shrink-0 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {formatTimeAgo(notification.created_at)}
          </span>
        </div>

        <p className="text-xs text-content-muted leading-relaxed line-clamp-2">
          {notification.body}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.color}`}>
            {badge.label}
          </span>
          {isUnread && (
            <span className="text-[10px] text-primary hover:underline font-semibold">
              Mark as read
            </span>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
      )}
    </div>
  );
}
