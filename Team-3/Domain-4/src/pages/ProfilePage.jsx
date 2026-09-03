import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  ShieldCheck, 
  FileText, 
  LogOut, 
  Sparkles, 
  User, 
  Briefcase, 
  Shield, 
  CheckCircle2, 
  Lock,
  ArrowRight
} from 'lucide-react';
import Chip from '../components/common/Chip';
import Button from '../components/common/Button';
import authService from '../services/auth';
import resumeService from '../services/resume';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => authService.getSession());
  const [activeResume, setActiveResume] = useState(() => resumeService.getActiveResume());

  useEffect(() => {
    const unsub = authService.subscribe((updated) => setSession(updated));
    return unsub;
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const user = session?.user || {};
  const userName = user.name || user.email?.split('@')[0] || 'Authenticated User';
  const userEmail = user.email || 'user@swipex.infosys.com';
  const currentRole = session?.role || user.role || 'job_seeker';

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SX';

  const roleConfigs = [
    {
      id: 'job_seeker',
      title: 'Candidate / Job Seeker',
      icon: User,
      description: 'Swipe-based opportunity discovery, 1-click applications, and ATS resume keyword diagnostics.',
    },
    {
      id: 'recruiter',
      title: 'Recruiter & Talent Partner',
      icon: Briefcase,
      description: 'Publish requisitions, review inbound candidate right-swipes, and manage candidate screenings.',
    },
    {
      id: 'admin',
      title: 'Platform Administrator',
      icon: Shield,
      description: 'Enterprise cluster telemetry, user RBAC governance, cache flushing, and security audit logs.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="space-y-1 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0070ad]/15 text-[#0070ad] text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Enterprise Identity & Access</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content">
          Account Profile & Permissions
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          Manage your verified credentials, security session, and active workspace role.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="surface-card space-y-6">
        
        {/* User Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-14 w-14 rounded-2xl bg-surface-elevated text-primary font-bold text-lg flex items-center justify-center border border-outline-variant shrink-0">
              {initials}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-content truncate max-w-[180px] sm:max-w-xs">{userName}</h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-surface-elevated text-content-muted border border-outline-variant capitalize whitespace-nowrap">
                  {currentRole.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-content-muted min-w-0">
                <Mail className="w-3.5 h-3.5 text-content-subtle shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs block">{userEmail}</span>
              </div>
            </div>
          </div>

          <Button
            variant="tonal"
            size="sm"
            icon={LogOut}
            onClick={handleLogout}
            className="self-start sm:self-auto text-red-300 hover:text-red-200 hover:bg-red-950/30 whitespace-nowrap"
          >
            Sign Out
          </Button>
        </div>

        {/* Security & Token Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-outline-variant space-y-1">
            <span className="text-content-subtle text-[11px] font-medium flex items-center gap-1">
              <Lock className="w-3 h-3 text-primary" />
              <span>Authentication Session</span>
            </span>
            <p className="font-semibold text-content">Active JWT • Auto Refresh</p>
            <span className="text-[10px] text-content-muted">256-Bit Encrypted Session</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-outline-variant space-y-1">
            <span className="text-content-subtle text-[11px] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-content-subtle" />
              <span>Organization</span>
            </span>
            <p className="font-semibold text-content">Infosys Springboard</p>
            <span className="text-[10px] text-content-subtle">Enterprise Partner Tier</span>
          </div>
        </div>

        {/* Interactive Role Switcher */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-content">
                Active Workspace Role
              </h3>
              <p className="text-[11px] text-content-muted">
                Switch your active role to explore different workspace capabilities:
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              Instant Switch
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {roleConfigs.map((role) => {
              const Icon = role.icon;
              const isSelected = currentRole === role.id;

              return (
                <div
                  key={role.id}
                  onClick={() => authService.setRole(role.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-primary/10 border-primary/60 shadow-sm'
                      : 'bg-surface-elevated/30 border-outline-variant/60 hover:border-outline hover:bg-surface-elevated/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-primary text-surface' : 'bg-surface-container text-content-muted'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-content flex items-center gap-2">
                        <span>{role.title}</span>
                        {isSelected && (
                          <span className="text-[10px] text-primary font-semibold uppercase">● Active</span>
                        )}
                      </div>
                      <p className="text-[11px] text-content-muted mt-0.5 leading-snug">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                      isSelected ? 'border-primary bg-primary text-surface' : 'border-outline-variant'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Resume Summary */}
        <div className="pt-4 border-t border-outline-variant space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-content">
              Active Career Document
            </h3>
            <button
              type="button"
              onClick={() => navigate('/resume')}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {activeResume ? 'Update Document' : 'Upload Resume'}
            </button>
          </div>

          {activeResume ? (
            <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-content">{activeResume.filename || 'Resume.pdf'}</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-full font-semibold">
                  Verified
                </span>
              </div>

              {activeResume.parsed_skills && activeResume.parsed_skills.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {activeResume.parsed_skills.slice(0, 6).map((skill, idx) => (
                    <Chip key={idx}>{skill}</Chip>
                  ))}
                  {activeResume.parsed_skills.length > 6 && (
                    <span className="text-[10px] text-content-subtle self-center">
                      +{activeResume.parsed_skills.length - 6} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-surface-elevated/30 border border-dashed border-outline-variant text-center text-xs text-content-subtle">
              No active resume found. Upload a resume to enable ATS evaluation.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
