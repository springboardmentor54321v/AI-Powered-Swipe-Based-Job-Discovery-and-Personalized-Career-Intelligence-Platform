import React, { useState, useEffect } from 'react';
import {
  Bell,
  Filter,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Building2,
  Target,
  Users,
  Send
} from 'lucide-react';
import notificationService from '../../services/notifications';
import NotificationItem from '../../components/notifications/NotificationItem';
import Button from '../../components/common/Button';

export default function NotificationHistoryPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all'); // 'all' | 'unread' | 'read'

  const loadNotifications = () => {
    setLoading(true);
    setError(null);
    notificationService.getNotifications({ limit: 50 })
      .then(({ items }) => {
        setNotifications(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        setError(err.message || 'Unable to retrieve notification archive.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNotifications();

    const handleExternalRead = (e) => {
      const readId = e.detail?.id;
      if (readId) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === readId ? { ...n, read_at: new Date().toISOString() } : n))
        );
      }
    };
    window.addEventListener('swipex:notification_read', handleExternalRead);
    return () => {
      window.removeEventListener('swipex:notification_read', handleExternalRead);
    };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      window.dispatchEvent(new CustomEvent('swipex:notification_read', { detail: { id } }));
    } catch {
      // Soft fail
    }
  };

  const types = [
    { id: 'all', label: 'All Alerts' },
    { id: 'instant_job', label: 'Instant Jobs' },
    { id: 'startup_hiring', label: 'Startup Hiring' },
    { id: 'high_match', label: 'High Match' },
    { id: 'low_competition', label: 'Low Competition' },
    { id: 'application_status', label: 'Applications' },
  ];

  const filtered = notifications.filter((notif) => {
    if (typeFilter !== 'all' && notif.type !== typeFilter) return false;
    if (readFilter === 'unread' && notif.read_at) return false;
    if (readFilter === 'read' && !notif.read_at) return false;
    return true;
  });

  const unreadTotal = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">Notification Archive</h1>
              <p className="text-xs text-content-muted mt-0.5">
                Review your real-time career intelligence alerts, application stages, and curated opportunities.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unreadTotal > 0 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
              {unreadTotal} Unread
            </span>
          )}
          <Button
            variant="tonal"
            size="sm"
            icon={RotateCcw}
            onClick={loadNotifications}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="surface-card p-4 rounded-3xl border border-white/[0.08] space-y-3 bg-[#12131a]">
        <div className="flex items-center justify-between gap-2 flex-wrap">

          {/* Type filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTypeFilter(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  typeFilter === t.id
                    ? 'bg-primary text-surface border-primary shadow-sm'
                    : 'bg-white/[0.03] text-content-muted border-white/[0.08] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06] text-xs">
            <button
              type="button"
              onClick={() => setReadFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                readFilter === 'all' ? 'bg-white/[0.1] text-white' : 'text-content-muted hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setReadFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                readFilter === 'unread' ? 'bg-primary/20 text-primary font-bold' : 'text-content-muted hover:text-white'
              }`}
            >
              Unread only
            </button>
            <button
              type="button"
              onClick={() => setReadFilter('read')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                readFilter === 'read' ? 'bg-white/[0.1] text-white' : 'text-content-muted hover:text-white'
              }`}
            >
              Read
            </button>
          </div>

        </div>
      </div>

      {/* List Content */}
      <div className="space-y-3">
        {loading && (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
            <p className="text-xs text-content-subtle">Retrieving notification archive...</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-6 text-center space-y-3 bg-red-950/20 border border-red-800/30 rounded-3xl">
            <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
            <p className="text-sm text-red-300 font-semibold">{error}</p>
            <Button variant="tonal" size="sm" onClick={loadNotifications}>
              Retry Connection
            </Button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-16 text-center space-y-3 surface-card rounded-3xl border border-white/[0.08] p-8">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-content-subtle">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No notifications matching criteria</h3>
            <p className="text-xs text-content-muted max-w-sm mx-auto">
              {notifications.length === 0
                ? "You haven't received any automated notifications yet. When high-match roles or application status changes occur, they will appear here."
                : 'Try adjusting your type or read/unread filter above to view older notifications.'}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          filtered.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={handleMarkRead}
            />
          ))
        )}
      </div>

    </div>
  );
}
