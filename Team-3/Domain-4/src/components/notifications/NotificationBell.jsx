import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import notificationService from '../../services/notifications';
import authService from '../../services/auth';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell({ historyPath = '/dashboard/job-seeker/notifications' }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const wsRef = useRef(null);

  // Synchronize unread count via REST
  const refreshUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Soft failure, keep existing count
    }
  };

  // Initial load and WebSocket stream attempt with fallback to visibility-aware polling
  useEffect(() => {
    let mounted = true;
    const session = authService.getSession();
    const token = session?.access_token;

    // 1. Initial REST fetch
    notificationService.getUnreadCount()
      .then((count) => {
        if (mounted) setUnreadCount(count);
      })
      .catch(() => {
        if (mounted) setUnreadCount(0);
      });

    // 2. Attempt WebSocket stream connection if browser and token are available
    if (token && typeof window !== 'undefined' && 'WebSocket' in window) {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/notifications/?token=${encodeURIComponent(token)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          if (!mounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data) {
              setUnreadCount((prev) => prev + 1);
              setNotifications((prev) => [data, ...prev.slice(0, 4)]);
            }
          } catch {
            // Ignore malformed WS frames
          }
        };

        ws.onerror = () => {
          // WS unavailable (blocked by Gateway or ASGI missing), graceful fallback to polling
        };

        ws.onclose = () => {
          wsRef.current = null;
        };
      } catch {
        // Fallback to polling silently
      }
    }

    // 3. Resilient visibility-aware REST polling fallback (45s interval)
    const pollIntervalMs = 45000;
    let timerId = null;

    const startPolling = () => {
      if (timerId) clearInterval(timerId);
      timerId = setInterval(() => {
        if (document.visibilityState === 'visible') {
          refreshUnreadCount();
        }
      }, pollIntervalMs);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUnreadCount();
        startPolling();
      } else if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Cross-component sync: update count when an alert is marked read elsewhere (e.g. history page)
    const handleNotificationReadEvent = (e) => {
      if (!mounted) return;
      const readId = e.detail?.id;
      if (readId) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === readId ? { ...n, read_at: new Date().toISOString() } : n))
        );
      }
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    window.addEventListener('swipex:notification_read', handleNotificationReadEvent);

    return () => {
      mounted = false;
      if (timerId) clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('swipex:notification_read', handleNotificationReadEvent);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
      }
    };
  }, []);

  // Fetch recent notifications when dropdown opens
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    notificationService.getNotifications({ limit: 5 })
      .then(({ items }) => {
        if (mounted) setNotifications(items);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Unable to load notifications.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open]);

  // Handle outside click and Escape key to close dropdown
  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      // Notify other listening views (e.g., NotificationHistoryPage)
      window.dispatchEvent(new CustomEvent('swipex:notification_read', { detail: { id } }));
    } catch {
      // Soft fail
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        className="p-2 sm:p-2.5 rounded-xl text-content-subtle hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-all relative flex items-center justify-center active:scale-95"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-primary text-surface text-[10px] font-extrabold min-w-[18px] text-center shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          error={error}
          onMarkRead={handleMarkRead}
          onClose={() => setOpen(false)}
          historyPath={historyPath}
        />
      )}
    </div>
  );
}
