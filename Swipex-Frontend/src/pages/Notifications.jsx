// import React, { useState } from 'react';
// import Navbar from '../components/Navbar';
// import Sidebar from '../components/Sidebar';
// import { 
//   Bell, Sparkles, CheckCircle2, Briefcase, 
//   Trash2, Check, ArrowUpRight 
// } from 'lucide-react';

// export default function Notifications() {
//   const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

//   const handleMarkAllRead = () => {
//     setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
//   };

//   const handleDelete = (id) => {
//     setNotifications(prev => prev.filter(n => n.id !== id));
//   };

//   const unreadCount = notifications.filter(n => !n.is_read).length;

//   return (
//     <div className="min-h-screen bg-[#FFF5EE] text-zinc-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
//       {/* Top Navbar */}
//       <Navbar />

//       <div className="flex flex-1">
//         {/* Left Sidebar */}
//         <Sidebar />

//         {/* Main Content Workspace */}
//         <main className="flex-1 p-8 max-w-4xl space-y-8">
//           {/* Header */}
//           <div className="flex justify-between items-end">
//             <div>
//               <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
//                 Notifications & <span className="text-orange-500">Alerts</span>
//               </h1>
//               <p className="text-xs text-zinc-500 font-medium mt-1">
//                 Recruiter matches, application status changes, and AI feed recommendations
//               </p>
//             </div>

//             {unreadCount > 0 && (
//               <button 
//                 onClick={handleMarkAllRead}
//                 className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
//               >
//                 <Check className="w-3.5 h-3.5 text-orange-500" />
//                 <span>Mark All as Read ({unreadCount})</span>
//               </button>
//             )}
//           </div>

//           {/* Notifications List */}
//           {notifications.length === 0 ? (
//             <div className="bg-white p-12 rounded-3xl border border-orange-200/80 text-center space-y-3 shadow-xs">
//               <Bell className="w-8 h-8 text-orange-300 mx-auto" />
//               <h3 className="text-sm font-black text-zinc-800">No notifications right now</h3>
//               <p className="text-xs text-zinc-400 font-medium">You're all caught up! New application alerts will appear here.</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {notifications.map((notif) => (
//                 <div 
//                   key={notif.id}
//                   className={`p-5 rounded-3xl border transition flex items-start justify-between ${
//                     notif.is_read 
//                       ? 'bg-white border-orange-200/80 shadow-xs' 
//                       : 'bg-orange-50/70 border-orange-300 shadow-xs'
//                   }`}
//                 >
//                   <div className="flex items-start gap-3.5">
//                     <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold ${
//                       notif.type === 'match' 
//                         ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xs' 
//                         : 'bg-orange-100/70 text-orange-600 border border-orange-200/60'
//                     }`}>
//                       {notif.type === 'match' ? <Sparkles className="w-5 h-5 fill-white" /> : <Briefcase className="w-5 h-5" />}
//                     </div>

//                     <div className="space-y-1">
//                       <div className="flex items-center gap-2">
//                         <h3 className="text-xs font-black text-zinc-950">{notif.title}</h3>
//                         {!notif.is_read && (
//                           <span className="w-2 h-2 rounded-full bg-orange-500" />
//                         )}
//                       </div>
//                       <p className="text-xs text-zinc-600 font-medium leading-relaxed">{notif.message}</p>
//                       <p className="text-[10px] text-zinc-400 font-bold">{notif.timestamp}</p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-2 flex-shrink-0">
//                     <button 
//                       onClick={() => window.location.href = notif.action_url}
//                       className="p-2 text-orange-500 hover:bg-orange-100/60 rounded-xl transition cursor-pointer"
//                       title="View Details"
//                     >
//                       <ArrowUpRight className="w-4 h-4" />
//                     </button>
//                     <button 
//                       onClick={() => handleDelete(notif.id)}
//                       className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
//                       title="Dismiss Notification"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

// const INITIAL_NOTIFICATIONS = [
//   {
//     id: "notif-1",
//     type: "match",
//     title: "New 94.5% AI Career Match!",
//     message: "SwipeX Tech posted Senior Python Backend Engineer matching your uploaded active resume.",
//     timestamp: "10 mins ago",
//     is_read: false,
//     action_url: "/discovery"
//   },
//   {
//     id: "notif-2",
//     type: "status",
//     title: "Application Reviewed",
//     message: "Razorpay viewed your profile for Frontend React Developer position.",
//     timestamp: "2 hours ago",
//     is_read: false,
//     action_url: "/dashboard"
//   },
//   {
//     id: "notif-3",
//     type: "ats",
//     title: "ATS Resume Analysis Complete",
//     message: "Your active resume achieved an 84.5% alignment score for Python Engineer roles.",
//     timestamp: "1 day ago",
//     is_read: true,
//     action_url: "/ats-ranker"
//   }
// ];

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Check, CheckCheck, Sliders, Zap, Sparkles, 
  Building2, ArrowRight, ShieldAlert, Clock, Settings, X, RefreshCw
} from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  getNotificationPreferences, 
  updateNotificationPreferences 
} from '../services/api';
import { useNotificationSocket } from '../services/websocket';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    enabled_types: ['instant_job', 'startup_hiring', 'high_match', 'low_competition', 'application_status'],
    channels: ['in_app', 'email'],
    match_threshold: 80,
    quiet_hours_start: null,
    quiet_hours_end: null,
    timezone: 'UTC'
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Fetch notifications feed
  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications(unreadOnly, 1, 30);
      if (data && data.items) {
        setNotifications(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  // Fetch notification preferences
  const fetchPrefs = async () => {
    try {
      const data = await getNotificationPreferences();
      if (data) {
        setPreferences({
          enabled_types: data.enabled_types || [],
          channels: data.channels || ['in_app'],
          match_threshold: data.match_threshold ?? 80,
          quiet_hours_start: data.quiet_hours_start || null,
          quiet_hours_end: data.quiet_hours_end || null,
          timezone: data.timezone || 'UTC'
        });
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  };

  // WebSocket frame handler: auto-prepend new notifications to feed
  const handleWsFrame = useCallback((frame) => {
    if (frame.type === 'notification' && frame.data) {
      setNotifications((prev) => [frame.data, ...prev]);
    }
  }, []);

  // Wire WebSocket with resync fallback
  useNotificationSocket(handleWsFrame, fetchFeed);

  useEffect(() => {
    fetchFeed();
    fetchPrefs();
  }, [fetchFeed]);

  // Mark single notification as read
  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true, read_at: new Date().toISOString() } : item))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Save updated preferences
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      setSavingPrefs(true);
      await updateNotificationPreferences(preferences);
      setShowPreferencesModal(false);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setSavingPrefs(false);
    }
  };

  // Toggle notification type checkbox
  const toggleTypePreference = (type) => {
    setPreferences((prev) => {
      const exists = prev.enabled_types.includes(type);
      const updated = exists
        ? prev.enabled_types.filter((t) => t !== type)
        : [...prev.enabled_types, type];
      return { ...prev, enabled_types: updated };
    });
  };

  // Toggle delivery channel checkbox
  const toggleChannelPreference = (channel) => {
    setPreferences((prev) => {
      const exists = prev.channels.includes(channel);
      const updated = exists
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel];
      return { ...prev, channels: updated };
    });
  };

  // Helper icon renderer based on notification type
  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'high_match':
        return <Sparkles className="w-5 h-5 text-orange-500" />;
      case 'application_status':
        return <Zap className="w-5 h-5 text-purple-600" />;
      case 'startup_hiring':
        return <Building2 className="w-5 h-5 text-emerald-600" />;
      case 'low_competition':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE] text-zinc-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Feed Content */}
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
          
          {/* Header Card */}
          <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
                <Bell className="w-6 h-6 text-orange-500" /> Notifications & Alerts
              </h1>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Real-time updates on application statuses, high-match roles, and startup hiring activity.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="px-3.5 py-2 bg-orange-50/60 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-orange-200/80 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-orange-500" /> Preferences
              </button>

              <button
                onClick={handleMarkAllAsRead}
                className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-400" /> Mark All Read
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-orange-200/80 shadow-2xs text-xs font-bold">
            <div className="flex gap-2">
              <button
                onClick={() => setUnreadOnly(false)}
                className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
                  !unreadOnly
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-orange-50'
                }`}
              >
                All Alerts
              </button>
              <button
                onClick={() => setUnreadOnly(true)}
                className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
                  unreadOnly
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-orange-50'
                }`}
              >
                Unread Only
              </button>
            </div>

            <button
              onClick={fetchFeed}
              className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-orange-50 rounded-xl transition cursor-pointer"
              title="Refresh Feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
            </button>
          </div>

          {/* Notifications Feed List */}
          <div className="space-y-3">
            {loading && notifications.length === 0 ? (
              <div className="bg-white border border-orange-200/80 rounded-3xl p-12 text-center text-zinc-400 text-xs font-medium space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                <p>Syncing notification feed...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white border border-orange-200/80 rounded-3xl p-12 text-center text-zinc-400 text-xs font-medium space-y-2">
                <Bell className="w-8 h-8 text-orange-300 mx-auto" />
                <p className="font-bold text-zinc-700">No notifications found</p>
                <p>You're all caught up! New alerts will arrive in real time.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id, item.is_read)}
                  className={`p-4 rounded-2xl border transition flex items-start gap-4 cursor-pointer ${
                    item.is_read
                      ? 'bg-white/80 border-orange-200/60 opacity-80'
                      : 'bg-white border-orange-300 shadow-2xs ring-1 ring-orange-400/20'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 shrink-0">
                    {renderNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-zinc-950">{item.title}</h4>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">{item.body}</p>

                    {!item.is_read && (
                      <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mt-1">
                        New Alert
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </main>
      </div>

      {/* Preferences Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-orange-200/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-orange-100">
              <h3 className="text-base font-black text-zinc-950 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-orange-500" /> Alert Preferences
              </h3>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs font-bold">
              {/* Enabled Types */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-zinc-400 font-black tracking-wider block">
                  Notification Types
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { type: 'high_match', label: 'High Match Roles' },
                    { type: 'instant_job', label: 'Instant Job Posting' },
                    { type: 'startup_hiring', label: 'Startup Hiring' },
                    { type: 'low_competition', label: 'Low Competition Roles' },
                    { type: 'application_status', label: 'Application Status Changes' },
                  ].map((item) => (
                    <label
                      key={item.type}
                      className="p-2.5 bg-orange-50/40 border border-orange-100 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-orange-50"
                    >
                      <input
                        type="checkbox"
                        checked={preferences.enabled_types.includes(item.type)}
                        onChange={() => toggleTypePreference(item.type)}
                        className="accent-orange-500 rounded"
                      />
                      <span className="text-zinc-800">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery Channels */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-zinc-400 font-black tracking-wider block">
                  Delivery Channels
                </label>
                <div className="flex gap-4">
                  {[
                    { channel: 'in_app', label: 'In-App Bell' },
                    { channel: 'email', label: 'Email Digest' },
                    { channel: 'push', label: 'Push Notifications' },
                  ].map((item) => (
                    <label key={item.channel} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.channels.includes(item.channel)}
                        onChange={() => toggleChannelPreference(item.channel)}
                        className="accent-orange-500 rounded"
                      />
                      <span className="text-zinc-800">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* AI Match Threshold Slider */}
              <div className="space-y-1.5 pt-2 border-t border-orange-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase text-zinc-400 font-black tracking-wider block">
                    AI Match Threshold
                  </label>
                  <span className="text-orange-600 font-black">{preferences.match_threshold}% Match</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={preferences.match_threshold}
                  onChange={(e) => setPreferences({ ...preferences, match_threshold: parseInt(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-orange-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreferencesModal(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {savingPrefs ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}