import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,
  Compass, 
  LayoutDashboard, 
  FileText, 
  User, 
  Menu, 
  X,
  LogOut,
  Shield
} from 'lucide-react';
import Button from './common/Button';
import Chip from './common/Chip';
import authService from '../services/auth';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState(() => authService.getSession());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Subscribe to reactive auth session changes
    const unsubscribe = authService.subscribe((updatedSession) => {
      setSession(updatedSession);
    });
    return unsubscribe;
  }, []);

  const isAuthenticated = Boolean(session && session.access_token);
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User';
  const roleName = (session?.role || session?.user?.role || 'job_seeker').replace('_', ' ');

  // Only show "Continue to Dashboard" when on the Home page (not on Dashboard or other pages)
  const showDashboardBtn = isAuthenticated && location.pathname === '/';

  // Navigation items based on auth state
  // When authenticated, do not show tabs (Discover, Resume, Profile) on the home navbar.
  // Instead, the dedicated "Go to Dashboard" button routes the user directly to their role dashboard.
  const navItems = isAuthenticated
    ? []
    : [
        { path: '/', label: 'Home', icon: Home, end: true },
      ];

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    authService.logout();
    closeMobile();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0c0d12]/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand with Infosys Springboard identifier */}
        <Link
          to="/"
          className="flex items-center gap-3 text-left group focus-visible:outline-none"
          title="SwipeX Home"
        >
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-[#72a4f5] flex items-center justify-center text-surface font-black text-base shadow-sm group-hover:opacity-90 transition-opacity">
            X
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                SwipeX
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0070ad]/20 text-[#0070ad] border border-[#0070ad]/30 uppercase tracking-wide">
                Infosys Springboard
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {navItems.length > 0 && (
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white/[0.09] text-white border border-white/[0.08] shadow-sm'
                        : 'text-content-muted hover:text-white hover:bg-white/[0.04]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-content-subtle'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        )}

        {/* Auth Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <Button
                variant="filled"
                size="sm"
                icon={LayoutDashboard}
                onClick={() => navigate('/dashboard')}
                className="shadow-sm font-semibold"
              >
                Go to Dashboard
              </Button>
              <Link 
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-primary/50 hover:bg-white/[0.08] transition-all text-xs font-medium text-content"
                title="View Profile"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-primary/30 to-[#0070ad]/30 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="max-w-[100px] truncate font-semibold text-content text-[11px] leading-tight">
                    {userName}
                  </span>
                  <span className="text-[10px] text-content-subtle capitalize leading-tight">
                    {roleName}
                  </span>
                </div>
              </Link>
              <Button
                variant="tonal"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                title="Sign out"
                className="hover:text-red-300"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="tonal"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Sign in
              </Button>
              <Button
                variant="filled"
                size="sm"
                onClick={() => navigate('/register')}
                className="shadow-md shadow-primary/20"
              >
                Register Free
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 rounded-xl text-content-muted hover:text-white hover:bg-white/[0.06]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#0c0d12] px-4 py-4 space-y-3 animate-fadeIn">
          {navItems.length > 0 && (
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-white/[0.09] text-white border border-white/[0.08]'
                          : 'text-content-muted hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-content-subtle'}`} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}

          <div className="pt-2">
            {isAuthenticated ? (
              <div className="space-y-2.5">
                <Button
                  variant="filled"
                  size="sm"
                  icon={LayoutDashboard}
                  className="w-full font-semibold"
                  onClick={() => {
                    navigate('/dashboard');
                    closeMobile();
                  }}
                >
                  Go to Dashboard
                </Button>
                <div className="flex items-center justify-between px-1 text-xs text-content-muted">
                  <span>Signed in as <strong className="text-white font-medium">{userName}</strong></span>
                  <Chip variant="primary">{roleName}</Chip>
                </div>
                <Button
                  variant="outlined"
                  size="sm"
                  icon={LogOut}
                  className="w-full text-red-300 hover:text-red-200 hover:border-red-800"
                  onClick={handleLogout}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => {
                    navigate('/login');
                    closeMobile();
                  }}
                >
                  Sign in
                </Button>
                <Button
                  variant="filled"
                  size="sm"
                  onClick={() => {
                    navigate('/register');
                    closeMobile();
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
