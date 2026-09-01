import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  LayoutDashboard, 
  FileText, 
  User, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import Button from './common/Button';
import Chip from './common/Chip';
import authService from '../services/auth';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState(() => authService.getSession());
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to reactive auth session changes
    const unsubscribe = authService.subscribe((updatedSession) => {
      setSession(updatedSession);
    });
    return unsubscribe;
  }, []);

  const navItems = [
    { path: '/discover', label: 'Discover', icon: Compass },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/resume', label: 'Resume', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    authService.logout();
    closeMobile();
    navigate('/login');
  };

  const isAuthenticated = Boolean(session && session.access_token);
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-outline-variant bg-surface/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link
          to="/discover"
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
        >
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-surface font-black text-base shadow-sm group-hover:bg-primary-hover transition-colors">
            X
          </div>
          <span className="font-bold text-lg tracking-tight text-content">
            SwipeX
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-surface-elevated text-content font-semibold'
                      : 'text-content-muted hover:text-content hover:bg-surface-container'
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
        </nav>

        {/* Auth Action Buttons or Logged-In User Badge */}
        <div className="hidden sm:flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link 
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated/70 border border-outline-variant/60 hover:border-primary/40 transition-colors text-xs font-medium text-content"
              >
                <div className="w-5 h-5 rounded-lg bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[110px] truncate">{userName}</span>
              </Link>
              <Button
                variant="text"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                title="Sign out"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="text"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Sign in
              </Button>
              <Button
                variant="filled"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 rounded-xl text-content-muted hover:text-content hover:bg-surface-elevated"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-outline-variant bg-surface px-4 py-4 space-y-3 animate-fadeIn">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-surface-elevated text-content font-semibold'
                        : 'text-content-muted hover:text-content'
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

          <div className="pt-3 border-t border-outline-variant">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1 text-xs text-content-muted">
                  <span>Signed in as <strong className="text-content font-medium">{userName}</strong></span>
                  {session?.role && <Chip variant="primary">{session.role}</Chip>}
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
