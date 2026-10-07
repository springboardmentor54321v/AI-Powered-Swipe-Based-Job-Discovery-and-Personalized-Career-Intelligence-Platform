import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Bell,
  Mail,
  Clock,
  Sparkles,
  Building2,
  Target,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save
} from 'lucide-react';
import alertPreferencesService from '../../services/alertPreferences';
import Button from '../../components/common/Button';

export default function AlertPreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Preferences State matching backend fields
  const [enabledTypes, setEnabledTypes] = useState({
    instant_job: true,
    startup_hiring: true,
    high_match: true,
    low_competition: true,
  });

  const [channels, setChannels] = useState({
    in_app: true,
    email: false,
  });

  const [matchThreshold, setMatchThreshold] = useState(80);
  const [quietHours, setQuietHours] = useState({
    enabled: true,
    start: '22:00',
    end: '08:00',
  });

  // Load preferences from backend
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    alertPreferencesService.getAlertPreferences()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const typeMap = { ...enabledTypes };
          const chanMap = { ...channels };

          data.forEach((pref) => {
            if (pref.alert_type && typeMap[pref.alert_type] !== undefined) {
              typeMap[pref.alert_type] = Boolean(pref.enabled);
            }
            if (pref.channel && chanMap[pref.channel] !== undefined) {
              chanMap[pref.channel] = Boolean(pref.enabled);
            }
            if (pref.quiet_start && pref.quiet_end) {
              setQuietHours((prev) => ({
                ...prev,
                start: pref.quiet_start.slice(0, 5),
                end: pref.quiet_end.slice(0, 5),
              }));
            }
          });

          setEnabledTypes(typeMap);
          setChannels(chanMap);
        }
      })
      .catch(() => {
        // Soft fail to defaults if backend endpoint is unavailable
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleType = (typeKey) => {
    setEnabledTypes((prev) => ({ ...prev, [typeKey]: !prev[typeKey] }));
  };

  const handleToggleChannel = (chanKey) => {
    setChannels((prev) => ({ ...prev, [chanKey]: !prev[chanKey] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    // Build payload array matching backend AlertPreference model
    const payload = [];
    const alertTypeKeys = ['instant_job', 'startup_hiring', 'high_match', 'low_competition'];
    const channelKeys = ['in_app', 'email'];

    alertTypeKeys.forEach((alert_type) => {
      channelKeys.forEach((channel) => {
        payload.push({
          alert_type,
          channel,
          enabled: Boolean(enabledTypes[alert_type] && channels[channel]),
          quiet_start: quietHours.enabled ? `${quietHours.start}:00` : null,
          quiet_end: quietHours.enabled ? `${quietHours.end}:00` : null,
        });
      });
    });

    try {
      await alertPreferencesService.updateAlertPreferences(payload);
      setFeedback({ type: 'success', message: 'Alert preferences saved successfully!' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Unable to update preferences. Backend may be offline.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-xs text-content-subtle">Loading your alert preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">

      {/* Header */}
      <div className="border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Alert Preferences</h1>
            <p className="text-xs text-content-muted mt-0.5">
              Customize real-time notification triggers, delivery channels, AI match thresholds, and quiet schedules.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
          feedback.type === 'success'
            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
            : 'bg-red-950/30 text-red-300 border-red-800/40'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* Section 1: Alert Categories */}
        <div className="surface-card p-6 rounded-3xl border border-white/[0.08] space-y-4 bg-[#12131a]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Career Intelligence Trigger Types</span>
            </h3>
            <p className="text-xs text-content-muted mt-0.5">
              Select which categories of automated career intelligence notifications you wish to receive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">

            {/* Instant Jobs */}
            <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              enabledTypes.instant_job
                ? 'bg-white/[0.04] border-primary/40'
                : 'bg-white/[0.01] border-white/[0.06] opacity-60'
            }`}>
              <input
                type="checkbox"
                checked={enabledTypes.instant_job}
                onChange={() => handleToggleType('instant_job')}
                className="mt-1 h-4 w-4 rounded border-white/20 text-primary focus:ring-primary/40 bg-black/40"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block">Instant Job Alerts</span>
                <span className="text-[11px] text-content-muted block leading-snug">
                  Immediate alerts for newly published positions matching your preferred title and skills.
                </span>
              </div>
            </label>

            {/* Startup Hiring */}
            <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              enabledTypes.startup_hiring
                ? 'bg-white/[0.04] border-purple-500/40'
                : 'bg-white/[0.01] border-white/[0.06] opacity-60'
            }`}>
              <input
                type="checkbox"
                checked={enabledTypes.startup_hiring}
                onChange={() => handleToggleType('startup_hiring')}
                className="mt-1 h-4 w-4 rounded border-white/20 text-purple-400 focus:ring-purple-400/40 bg-black/40"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block">Startup Hiring Radar</span>
                <span className="text-[11px] text-content-muted block leading-snug">
                  High-growth startups and newly founded company openings in India.
                </span>
              </div>
            </label>

            {/* High Match */}
            <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              enabledTypes.high_match
                ? 'bg-white/[0.04] border-emerald-500/40'
                : 'bg-white/[0.01] border-white/[0.06] opacity-60'
            }`}>
              <input
                type="checkbox"
                checked={enabledTypes.high_match}
                onChange={() => handleToggleType('high_match')}
                className="mt-1 h-4 w-4 rounded border-white/20 text-emerald-400 focus:ring-emerald-400/40 bg-black/40"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block">High-Match AI Recommendations</span>
                <span className="text-[11px] text-content-muted block leading-snug">
                  Alerts when our semantic matching engine scores a job above your threshold.
                </span>
              </div>
            </label>

            {/* Low Competition */}
            <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              enabledTypes.low_competition
                ? 'bg-white/[0.04] border-blue-500/40'
                : 'bg-white/[0.01] border-white/[0.06] opacity-60'
            }`}>
              <input
                type="checkbox"
                checked={enabledTypes.low_competition}
                onChange={() => handleToggleType('low_competition')}
                className="mt-1 h-4 w-4 rounded border-white/20 text-blue-400 focus:ring-blue-400/40 bg-black/40"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block">Low-Competition Opportunities</span>
                <span className="text-[11px] text-content-muted block leading-snug">
                  Fresh roles with fewer than 20 applicants where early submission boosts discovery.
                </span>
              </div>
            </label>

          </div>
        </div>

        {/* Section 2: Delivery Channels */}
        <div className="surface-card p-6 rounded-3xl border border-white/[0.08] space-y-4 bg-[#12131a]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>Notification Delivery Channels</span>
            </h3>
            <p className="text-xs text-content-muted mt-0.5">
              Choose how SwipeX should deliver your priority notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              channels.in_app ? 'bg-white/[0.04] border-primary/40' : 'bg-white/[0.01] border-white/[0.06]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">In-App Notification Center</span>
                  <span className="text-[11px] text-content-muted">Top navigation bell & history log</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={channels.in_app}
                onChange={() => handleToggleChannel('in_app')}
                className="h-4 w-4 rounded border-white/20 text-primary focus:ring-primary/40 bg-black/40"
              />
            </label>

            <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              channels.email ? 'bg-white/[0.04] border-primary/40' : 'bg-white/[0.01] border-white/[0.06]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Email Dispatch</span>
                  <span className="text-[11px] text-content-muted">Digest & urgent alert emails</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={channels.email}
                onChange={() => handleToggleChannel('email')}
                className="h-4 w-4 rounded border-white/20 text-primary focus:ring-primary/40 bg-black/40"
              />
            </label>
          </div>
        </div>

        {/* Section 3: AI Match Threshold & Quiet Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Match Threshold Slider */}
          <div className="surface-card p-6 rounded-3xl border border-white/[0.08] space-y-4 bg-[#12131a]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span>AI Match Threshold</span>
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Minimum ATS match score to trigger High-Match alerts.
                </p>
              </div>
              <span className="text-sm font-extrabold text-primary px-3 py-1 rounded-xl bg-primary/10 border border-primary/20">
                {matchThreshold}%
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <input
                type="range"
                min="70"
                max="95"
                step="5"
                value={matchThreshold}
                onChange={(e) => setMatchThreshold(Number(e.target.value))}
                className="w-full accent-[#0070ad] bg-white/[0.1] rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-content-subtle font-semibold">
                <span>70% (Broader)</span>
                <span>80% (Recommended)</span>
                <span>95% (Strict)</span>
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="surface-card p-6 rounded-3xl border border-white/[0.08] space-y-4 bg-[#12131a]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Quiet Hours</span>
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Mute email and push alerts during sleeping hours.
                </p>
              </div>
              <input
                type="checkbox"
                checked={quietHours.enabled}
                onChange={(e) => setQuietHours((p) => ({ ...p, enabled: e.target.checked }))}
                className="h-4 w-4 rounded border-white/20 text-primary bg-black/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-content-subtle">Start Time</label>
                <input
                  type="time"
                  value={quietHours.start}
                  disabled={!quietHours.enabled}
                  onChange={(e) => setQuietHours((p) => ({ ...p, start: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary disabled:opacity-40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-content-subtle">End Time</label>
                <input
                  type="time"
                  value={quietHours.end}
                  disabled={!quietHours.enabled}
                  onChange={(e) => setQuietHours((p) => ({ ...p, end: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary disabled:opacity-40"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <Button
            type="submit"
            variant="filled"
            size="md"
            icon={Save}
            disabled={saving}
          >
            {saving ? 'Saving Preferences...' : 'Save Alert Preferences'}
          </Button>
        </div>

      </form>

    </div>
  );
}
