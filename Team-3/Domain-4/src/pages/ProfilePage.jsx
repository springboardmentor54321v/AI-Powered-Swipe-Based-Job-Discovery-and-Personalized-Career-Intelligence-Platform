import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MapPin, Shield, FileText, LogOut, Sparkles, User as UserIcon } from 'lucide-react';
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
  const userEmail = user.email || 'user@swipex.local';
  const userRole = (session?.role || user.role || 'job_seeker').replace('_', ' ');
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SX';

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Profile Card */}
      <div className="surface-card space-y-6">
        
        {/* Header with Avatar and Role */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-primary flex items-center justify-center text-surface font-bold text-xl shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-content break-words">{userName}</h1>
                <Chip variant="primary">{userRole}</Chip>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-content-muted break-all">
                <Mail className="w-3.5 h-3.5 text-content-subtle shrink-0" />
                <span>{userEmail}</span>
              </div>
            </div>
          </div>

          <Button
            variant="tonal"
            size="sm"
            icon={LogOut}
            onClick={handleLogout}
            className="self-start sm:self-auto text-red-300 hover:text-red-200 hover:bg-red-950/40"
          >
            Sign out
          </Button>
        </div>

        {/* Account Details */}
        <div className="pt-4 border-t border-outline-variant space-y-3">
          <h2 className="text-xs font-semibold text-content-muted">Identity & Permissions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-surface-elevated/50 border border-outline-variant/60">
              <span className="text-content-subtle block text-[11px]">User ID</span>
              <span className="font-semibold text-content mt-0.5 block">{user.user_id || user.id || '1 (Local Session)'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-surface-elevated/50 border border-outline-variant/60">
              <span className="text-content-subtle block text-[11px]">Assigned Role</span>
              <span className="font-semibold text-content mt-0.5 block capitalize">{userRole}</span>
            </div>
          </div>
        </div>

        {/* Active Resume Summary */}
        <div className="pt-4 border-t border-outline-variant space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-content-muted">Active Career Document</h2>
            <button
              type="button"
              onClick={() => navigate('/resume')}
              className="text-xs text-primary hover:underline"
            >
              {activeResume ? 'Update resume' : 'Upload resume'}
            </button>
          </div>

          {activeResume ? (
            <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-content truncate">{activeResume.filename || 'Uploaded Resume'}</span>
              </div>

              {activeResume.parsed_skills && activeResume.parsed_skills.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-content-subtle block">Extracted Skill Keywords:</span>
                  <div className="flex flex-wrap gap-1">
                    {activeResume.parsed_skills.map((s, idx) => (
                      <Chip key={idx}>{s}</Chip>
                    ))}
                  </div>
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
