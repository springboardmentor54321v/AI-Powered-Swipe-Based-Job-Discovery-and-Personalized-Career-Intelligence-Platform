import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Compass,
  Bookmark,
  Send,
  FileText,
  Award,
  Sparkles,
  User,
  Briefcase,
  Building2,
  PlusCircle,
  Users,
  UserCheck,
  Shield,
  Server,
  Database,
  Activity,
  LogOut,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
  CheckCircle2,
  Bell,
  Sliders
} from 'lucide-react';
import authService from '../services/auth';
import Button from '../components/common/Button';
import Chip from '../components/common/Chip';
import NotificationBell from '../components/notifications/NotificationBell';

export default function RoleDashboardShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState(() => authService.getSession());

  useEffect(() => {
    const unsub = authService.subscribe((updated) => {
      setSession(updated);
    });
    return unsub;
  }, []);

  const role = (session?.role || session?.user?.role || 'job_seeker').toLowerCase();
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User';
  const userEmail = session?.user?.email || 'user@swipex.infosys.com';

  const handleRoleSwitch = (newRole) => {
    authService.setRole(newRole);
    // Redirect to the new role's dashboard overview
    if (newRole === 'recruiter') navigate('/dashboard/recruiter');
    else if (newRole === 'admin') navigate('/dashboard/admin');
    else navigate('/dashboard/job-seeker');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Role-Specific Navigation Configurations
  const navConfigs = {
    job_seeker: {
      roleTitle: 'Candidate Portal',
      roleBadge: 'Job Seeker',
      color: 'primary',
      items: [
        { path: '/dashboard/job-seeker', label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
        { path: '/dashboard/job-seeker/discover', label: 'Discover Jobs', icon: Compass },
        { path: '/dashboard/job-seeker/companies', label: 'Companies & Startups', icon: Building2 },
        { path: '/dashboard/job-seeker/saved', label: 'Saved Jobs', icon: Bookmark },
        { path: '/dashboard/job-seeker/applications', label: 'Applications', icon: Send },
        { path: '/dashboard/job-seeker/notifications', label: 'Notifications', icon: Bell },
        { path: '/dashboard/job-seeker/alert-preferences', label: 'Alert Preferences', icon: Sliders },
        { path: '/dashboard/job-seeker/resume', label: 'Resume', icon: FileText },
        { path: '/dashboard/job-seeker/ats', label: 'ATS Analysis', icon: Award },
        { path: '/dashboard/job-seeker/recommendations', label: 'Recommendations', icon: Sparkles },
        { path: '/dashboard/job-seeker/profile', label: 'Profile', icon: User },
      ],
    },
    recruiter: {
      roleTitle: 'Recruiter Studio',
      roleBadge: 'Recruiter',
      color: 'emerald',
      items: [
        { path: '/dashboard/recruiter', label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
        { path: '/dashboard/recruiter/jobs', label: 'My Jobs', icon: Briefcase },
        { path: '/dashboard/recruiter/post-job', label: 'Post a Job', icon: PlusCircle },
        { path: '/dashboard/recruiter/applications', label: 'Applications', icon: Send },
        { path: '/dashboard/recruiter/candidates', label: 'Candidates', icon: UserCheck },
        { path: '/dashboard/recruiter/notifications', label: 'Notifications', icon: Bell },
        { path: '/dashboard/recruiter/profile', label: 'Profile', icon: User },
      ],
    },
    admin: {
      roleTitle: 'Platform Administration',
      roleBadge: 'Administrator',
      color: 'purple',
      items: [
        { path: '/dashboard/admin', label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
        { path: '/dashboard/admin/users', label: 'Platform Users', icon: Users },
        { path: '/dashboard/admin/jobs', label: 'Platform Jobs', icon: Database },
        { path: '/dashboard/admin/notifications', label: 'Notifications', icon: Bell },
        { path: '/dashboard/admin/activity', label: 'Security & Activity', icon: Activity },
        { path: '/dashboard/admin/profile', label: 'Profile', icon: User },
      ],
    },
  };

  const currentConfig = navConfigs[role] || navConfigs.job_seeker;

  return (
    <div className="min-h-screen flex bg-[#0c0d12] text-content relative">

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.08] bg-[#0e0f15] shrink-0 sticky top-0 h-screen z-30 select-none">

        {/* Brand Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group" title="SwipeX Home">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-[#72a4f5] flex items-center justify-center text-surface font-black text-base shadow-sm">
              X
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                SwipeX
              </span>
              <span className="text-[10px] font-semibold text-[#0070ad] tracking-wide block uppercase">
                Infosys Springboard
              </span>
            </div>
          </Link>
        </div>

        {/* Role Workspace Banner */}
        <div className="px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-content-subtle block mb-1">
            Current Workspace
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-content">
              {currentConfig.roleTitle}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary border border-primary/30">
              {currentConfig.roleBadge}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {currentConfig.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'bg-primary text-surface shadow-md font-bold'
                      : 'text-content-muted hover:text-white hover:bg-white/[0.05] hover:translate-x-0.5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-surface' : 'text-content-subtle'}`} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Role Perspective Switcher (Testing & Demonstration) */}
        <div className="p-3 border-t border-white/[0.06] bg-white/[0.02]">
          <span className="text-[10px] font-bold text-content-subtle uppercase tracking-wider block mb-1.5">
            Role Perspective
          </span>
          <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
            <button
              type="button"
              onClick={() => handleRoleSwitch('job_seeker')}
              title="Switch to Candidate View"
              className={`py-1 text-[10px] font-semibold rounded-lg transition-all ${
                role === 'job_seeker' ? 'bg-primary text-surface shadow-sm' : 'text-content-muted hover:text-white'
              }`}
            >
              Seeker
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('recruiter')}
              title="Switch to Recruiter View"
              className={`py-1 text-[10px] font-semibold rounded-lg transition-all ${
                role === 'recruiter' ? 'bg-primary text-surface shadow-sm' : 'text-content-muted hover:text-white'
              }`}
            >
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('admin')}
              title="Switch to Admin View"
              className={`py-1 text-[10px] font-semibold rounded-lg transition-all ${
                role === 'admin' ? 'bg-primary text-surface shadow-sm' : 'text-content-muted hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* User Account & Logout */}
        <div className="p-3.5 border-t border-white/[0.08] flex items-center justify-between gap-2 bg-[#0c0d12]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary/30 to-[#0070ad]/30 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-xs text-white block truncate">
                {userName}
              </span>
              <span className="text-[10px] text-content-subtle block truncate">
                {userEmail}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-content-subtle hover:text-red-300 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-white/[0.08] bg-[#0c0d12]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4">

          {/* Mobile menu trigger & title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-content-muted hover:text-white hover:bg-white/[0.06]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-content-subtle min-w-0">
              <span className="font-bold text-content truncate max-w-[140px] sm:max-w-none">{currentConfig.roleTitle}</span>
              <ChevronRight className="w-3.5 h-3.5 text-content-subtle shrink-0 hidden sm:inline-block" />
              <span className="text-content-muted capitalize truncate hidden sm:inline-block">
                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Overview'}
              </span>
            </div>
          </div>

          {/* Right actions: Role preview switcher (on tablet/desktop) & profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-content-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Platform 99.98%</span>
            </div>

            {/* Notification Bell */}
            <NotificationBell historyPath={`/dashboard/${role === 'job_seeker' ? 'job-seeker' : role}/notifications`} />

            <Link
              to={`/dashboard/${role === 'job_seeker' ? 'job-seeker' : role}/profile`}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-primary/40 text-xs font-medium text-content transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline-block max-w-[100px] truncate">{userName}</span>
            </Link>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto min-w-0 overflow-x-hidden animate-pageEnter">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-[#0e0f15] border-r border-white/[0.08] p-5 space-y-5 animate-slideRight">

            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-surface font-black text-base shadow-sm">
                  X
                </div>
                <div>
                  <span className="font-extrabold text-base text-white block">SwipeX</span>
                  <span className="text-[10px] text-[#0070ad] font-semibold block uppercase">Infosys Springboard</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-xl text-content-subtle hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Workspace Badge */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-bold text-content">{currentConfig.roleTitle}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary">
                {currentConfig.roleBadge}
              </span>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 overflow-y-auto space-y-1">
              {currentConfig.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-primary text-surface shadow-md font-bold'
                          : 'text-content-muted hover:text-white hover:bg-white/[0.05]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-surface' : 'text-content-subtle'}`} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile Role Switcher */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <span className="text-[10px] font-bold text-content-subtle uppercase">Switch Role</span>
              <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => { handleRoleSwitch('job_seeker'); setMobileOpen(false); }}
                  className={`py-1 text-[10px] font-semibold rounded-lg ${role === 'job_seeker' ? 'bg-primary text-surface' : 'text-content-muted'}`}
                >
                  Seeker
                </button>
                <button
                  type="button"
                  onClick={() => { handleRoleSwitch('recruiter'); setMobileOpen(false); }}
                  className={`py-1 text-[10px] font-semibold rounded-lg ${role === 'recruiter' ? 'bg-primary text-surface' : 'text-content-muted'}`}
                >
                  Recruiter
                </button>
                <button
                  type="button"
                  onClick={() => { handleRoleSwitch('admin'); setMobileOpen(false); }}
                  className={`py-1 text-[10px] font-semibold rounded-lg ${role === 'admin' ? 'bg-primary text-surface' : 'text-content-muted'}`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Mobile Logout */}
            <div className="pt-3 border-t border-white/[0.08]">
              <Button
                variant="outlined"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                className="w-full text-red-300 hover:text-red-200 hover:border-red-800"
              >
                Sign out
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
