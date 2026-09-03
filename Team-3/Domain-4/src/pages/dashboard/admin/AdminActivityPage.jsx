import React, { useState } from 'react';
import { Activity, ShieldCheck, Lock, Search, Filter, RotateCcw } from 'lucide-react';
import Button from '../../../components/common/Button';
import Chip from '../../../components/common/Chip';
import authService from '../../../services/auth';

export default function AdminActivityPage() {
  const session = authService.getSession();
  const [search, setSearch] = useState('');

  const [events, setEvents] = useState([
    { id: 'EVT-905', time: '10:52:19', actor: session?.user?.email || 'admin@swipex.infosys.com', action: 'RBAC_SECURITY_INSPECT', status: 'Allowed', level: 'Governance' },
    { id: 'EVT-904', time: '10:48:33', actor: 'jane.doe@example.com', action: 'RESUME_DOCUMENT_PARSED', status: 'Success', level: 'Workflow' },
    { id: 'EVT-903', time: '10:42:01', actor: 'alex.recruiter@infosys.com', action: 'REQUISITION_PUBLISHED', status: 'Success', level: 'Workflow' },
    { id: 'EVT-902', time: '10:35:19', actor: 'system-gateway', action: 'TOKEN_REFRESH_SESSION', status: 'Success', level: 'Security' },
    { id: 'EVT-901', time: '10:28:44', actor: 'jane.doe@example.com', action: 'SWIPE_RIGHT_MATCH_RECORDED', status: 'Success', level: 'Workflow' },
    { id: 'EVT-900', time: '10:22:10', actor: 'system-worker', action: 'DISCOVERY_CACHE_FLUSHED', status: 'Success', level: 'Maintenance' },
  ]);

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    return e.action.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-content">Security & Activity Audit Trail</h1>
          </div>
          <p className="text-xs text-content-muted mt-1">
            Immutable log of user authentications, application transmissions, and governance events.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 self-start sm:self-auto">
          Audit Policy: Strict Enforcement
        </span>
      </div>

      {/* Telemetry Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="surface-card-subtle p-4 space-y-1 border-white/[0.08]">
          <span className="text-content-subtle text-[11px] block">Auth Verification Rate</span>
          <span className="text-xl font-bold text-emerald-400">100% Verified</span>
          <p className="text-[11px] text-content-muted">Zero unauthorized penetration attempts</p>
        </div>

        <div className="surface-card-subtle p-4 space-y-1 border-white/[0.08]">
          <span className="text-content-subtle text-[11px] block">Average API Latency</span>
          <span className="text-xl font-bold text-primary">22ms</span>
          <p className="text-[11px] text-content-muted">Cluster response across microservice endpoints</p>
        </div>

        <div className="surface-card-subtle p-4 space-y-1 border-white/[0.08]">
          <span className="text-content-subtle text-[11px] block">Security Protocol</span>
          <span className="text-xl font-bold text-content">JWT + SHA-256</span>
          <p className="text-[11px] text-content-muted">256-bit encrypted data at rest and in transit</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter audit events by action, actor, or ID..."
            className="w-full bg-surface-elevated border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-primary"
          />
        </div>

        <span className="text-xs text-content-subtle self-start sm:self-auto">
          {filtered.length} Recorded Events
        </span>
      </div>

      {/* Events Table */}
      <div className="surface-card p-0 overflow-hidden border-white/[0.08]">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs font-mono min-w-[620px]">
            <thead className="bg-white/[0.03] border-b border-outline-variant text-content-muted uppercase font-bold text-[10px] tracking-wider font-sans">
              <tr>
                <th className="p-4">Event ID</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action Type</th>
                <th className="p-4">Classification</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {filtered.map((evt) => (
                <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-primary">
                    {evt.id}
                  </td>

                  <td className="p-4 text-content font-sans truncate max-w-[180px] sm:max-w-xs">
                    {evt.actor}
                  </td>

                  <td className="p-4 font-semibold text-content font-mono whitespace-nowrap">
                    {evt.action}
                  </td>

                  <td className="p-4 font-sans whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-surface-elevated text-content-muted border border-outline-variant">
                      {evt.level}
                    </span>
                  </td>

                  <td className="p-4 text-content-subtle text-[11px] whitespace-nowrap">
                    {evt.time}
                  </td>

                  <td className="p-4 text-right font-sans">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-content-muted border border-outline-variant whitespace-nowrap">
                      {evt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
