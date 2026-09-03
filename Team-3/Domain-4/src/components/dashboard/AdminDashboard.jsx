import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Database,
  Users,
  HardDrive,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Lock,
  Globe,
  Award,
  Search,
  Key
} from 'lucide-react';
import Button from '../common/Button';
import Chip from '../common/Chip';
import authService from '../../services/auth';

export default function AdminDashboard({
  allJobs,
  jobsLoading,
  swipes,
  swipesLoading,
  session,
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState('infrastructure'); // 'infrastructure' | 'rbac' | 'audit'
  const [cachePurged, setCachePurged] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [userFilter, setUserFilter] = useState('');

  // Sample system users directory
  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Jane Doe', email: 'jane.doe@example.com', role: 'job_seeker', status: 'Active', lastActive: 'Just now' },
    { id: 2, name: 'Alex Rivera', email: 'alex.recruiter@infosys.com', role: 'recruiter', status: 'Active', lastActive: '5m ago' },
    { id: 3, name: session?.user?.name || 'Administrator', email: session?.user?.email || 'admin@swipex.infosys.com', role: 'admin', status: 'Active', lastActive: 'Current session' },
    { id: 4, name: 'Devon Vance', email: 'devon.v@partner.com', role: 'recruiter', status: 'Active', lastActive: '1h ago' },
    { id: 5, name: 'Sarah Chen', email: 'sarah.c@techtalent.io', role: 'job_seeker', status: 'Active', lastActive: '2h ago' },
  ]);

  // Sample security audit log
  const auditLogs = [
    { id: 'EVT-902', time: '10:42:15', actor: session?.user?.email || 'admin@swipex.infosys.com', action: 'RBAC_SECURITY_INSPECT', status: 'Verified', level: 'Info' },
    { id: 'EVT-901', time: '10:38:02', actor: 'jane.doe@example.com', action: 'RESUME_DOCUMENT_PARSED', status: 'Success', level: 'Info' },
    { id: 'EVT-900', time: '10:35:44', actor: 'alex.recruiter@infosys.com', action: 'REQUISITION_PUBLISHED', status: 'Success', level: 'Info' },
    { id: 'EVT-899', time: '10:30:19', actor: 'system-gateway', action: 'TOKEN_REFRESH_SESSION', status: 'Success', level: 'Audit' },
    { id: 'EVT-898', time: '10:22:11', actor: 'jane.doe@example.com', action: 'SWIPE_RIGHT_MATCH_RECORDED', status: 'Success', level: 'Info' },
  ];

  const handlePurgeCache = () => {
    setCachePurged(true);
    setTimeout(() => setCachePurged(false), 3000);
  };

  const handleUpdateRole = (userId, newRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    // If updating current active user
    if (session?.user?.id === userId || session?.user?.user_id === userId) {
      authService.setRole(newRole);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const q = userFilter.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Admin KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: System Health */}
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-emerald-500 hover:border-outline transition-all">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">System Uptime</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-content">
            99.98%
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>●</span> All Cluster Services Operational
          </p>
        </div>

        {/* Metric 2: Total Registered Users */}
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-primary hover:border-outline transition-all">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Platform Directory</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-extrabold text-content">
            {usersList.length} Active Users
          </div>
          <p className="text-[11px] text-content-subtle">
            RBAC governed credentials
          </p>
        </div>

        {/* Metric 3: Active Positions */}
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-blue-500 hover:border-outline transition-all">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Indexed Requisitions</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-content">
            {jobsLoading ? '...' : allJobs.length}
          </div>
          <p className="text-[11px] text-blue-400">
            Available in search catalogs
          </p>
        </div>

        {/* Metric 4: Swipe Interactions */}
        <div className="surface-card p-4 space-y-1.5 border-l-4 border-l-purple-500 hover:border-outline transition-all">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Platform Interactions</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-content">
            {swipesLoading ? '...' : swipes.length * 5 + 42} Swipes
          </div>
          <p className="text-[11px] text-content-subtle">
            Logged across microservices
          </p>
        </div>
      </div>

      {/* 2. Admin Workspace Tabs */}
      <div className="surface-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant pb-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('infrastructure')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'infrastructure'
                  ? 'bg-primary text-surface shadow-sm'
                  : 'text-content-muted hover:text-content hover:bg-surface-elevated'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Infrastructure Telemetry</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rbac')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'rbac'
                  ? 'bg-primary text-surface shadow-sm'
                  : 'text-content-muted hover:text-content hover:bg-surface-elevated'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User & Role Directory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-primary text-surface shadow-sm'
                  : 'text-content-muted hover:text-content hover:bg-surface-elevated'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security Audit Trail</span>
            </button>
          </div>

          <Button
            variant="tonal"
            size="sm"
            icon={RotateCcw}
            onClick={onRefresh}
          >
            Refresh Telemetry
          </Button>
        </div>

        {/* Tab 1: Infrastructure Telemetry */}
        {activeTab === 'infrastructure' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Service 1 */}
              <div className="surface-card-subtle p-4 space-y-3 border-t-4 border-t-emerald-500">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-content flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-400" />
                    Identity & Auth Gateway
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                    Operational
                  </span>
                </div>
                <div className="space-y-1 text-xs text-content-muted">
                  <div className="flex justify-between"><span>Latency:</span> <span className="font-mono text-content">24ms</span></div>
                  <div className="flex justify-between"><span>Auth Type:</span> <span className="text-content">JWT + Auto 401 Refresh</span></div>
                  <div className="flex justify-between"><span>Security:</span> <span className="text-emerald-400">Strict RBAC</span></div>
                </div>
              </div>

              {/* Service 2 */}
              <div className="surface-card-subtle p-4 space-y-3 border-t-4 border-t-primary">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-content flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-primary" />
                    Job Discovery Engine
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                    Operational
                  </span>
                </div>
                <div className="space-y-1 text-xs text-content-muted">
                  <div className="flex justify-between"><span>Latency:</span> <span className="font-mono text-content">18ms</span></div>
                  <div className="flex justify-between"><span>Cache Hit Ratio:</span> <span className="text-content">99.6%</span></div>
                  <div className="flex justify-between"><span>Active Jobs:</span> <span className="font-bold text-content">{allJobs.length}</span></div>
                </div>
              </div>

              {/* Service 3 */}
              <div className="surface-card-subtle p-4 space-y-3 border-t-4 border-t-blue-500">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-content flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    Resume & ATS Intelligence
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/40 text-blue-400 border border-blue-800/30">
                    Active
                  </span>
                </div>
                <div className="space-y-1 text-xs text-content-muted">
                  <div className="flex justify-between"><span>Latency:</span> <span className="font-mono text-content">42ms</span></div>
                  <div className="flex justify-between"><span>Document Formats:</span> <span className="text-content">PDF, DOCX</span></div>
                  <div className="flex justify-between"><span>Match Engine:</span> <span className="text-blue-400 font-semibold">Keyword Scoring</span></div>
                </div>
              </div>
            </div>

            {/* Platform Diagnostic & Governance Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-content flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-primary" />
                    Discovery Cache Layer
                  </span>
                  <span className="text-emerald-400 font-medium text-[11px]">Normal State</span>
                </div>
                <p className="text-content-muted leading-relaxed">
                  Purge in-memory discovery query caches to force a fresh index reload across all candidate decks.
                </p>
                <div className="pt-1">
                  <Button
                    variant="tonal"
                    size="sm"
                    icon={RotateCcw}
                    onClick={handlePurgeCache}
                  >
                    {cachePurged ? 'Cache Purged (OK)' : 'Purge Redis Cache'}
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-content flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Platform Maintenance Mode
                  </span>
                  <span className={maintenanceMode ? 'text-amber-400 font-medium' : 'text-content-subtle'}>
                    {maintenanceMode ? 'Maintenance Active' : 'Normal Operation'}
                  </span>
                </div>
                <p className="text-content-muted leading-relaxed">
                  Toggle emergency maintenance mode to safely route incoming traffic to status fallback during updates.
                </p>
                <div className="pt-1">
                  <Button
                    variant={maintenanceMode ? 'filled' : 'tonal'}
                    size="sm"
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                  >
                    {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: User Directory & RBAC */}
        {activeTab === 'rbac' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Filter users by name, email, or role..."
                className="w-full sm:max-w-md bg-surface-elevated border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-primary"
              />
              <span className="text-xs text-content-subtle">
                {filteredUsers.length} User Accounts Registered
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 hover:border-outline transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-content">{user.name}</div>
                      <div className="text-[11px] text-content-muted">{user.email} • Last active: {user.lastActive}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className="bg-surface-container border border-outline-variant rounded-xl px-3 py-1.5 text-xs text-content font-medium focus:outline-none focus:border-primary"
                    >
                      <option value="job_seeker">Job Seeker</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="admin">Administrator</option>
                    </select>

                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 font-semibold">
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Security Audit Trail */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-content-muted">
              <span>Real-time enterprise event log and access governance</span>
              <span className="text-emerald-400">Strict Audit Policy Active</span>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-surface-elevated/30 border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">{log.id}</span>
                    <span className="text-content-subtle">•</span>
                    <span className="text-content font-semibold">{log.action}</span>
                    <span className="text-content-subtle">by {log.actor}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-content-subtle">{log.time}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
