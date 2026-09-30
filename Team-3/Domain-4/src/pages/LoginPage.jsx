import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Info, Loader2 } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import authService from '../services/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [oauthNotice, setOauthNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateForm = () => {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);

    // Clear field-specific error upon typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (formError) setFormError('');
    if (oauthNotice) setOauthNotice('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions

    setFormError('');
    setOauthNotice('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await authService.login({
        email: email.trim(),
        password: password,
      });

      // Route through the role-aware dashboard; its recommendation page is
      // connected to the live Matching Engine.
      navigate('/dashboard');
    } catch (err) {
      // User-friendly error message
      const message = err?.message || 'Unable to sign in right now. Please check your credentials and try again.';
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading || loading) return;
    setFormError('');
    setOauthNotice('');
    setGoogleLoading(true);

    try {
      const response = await authService.googleOAuth();
      if (response?.url) {
        // Redirect to real OAuth authorization URL if provided by backend
        window.location.href = response.url;
      } else {
        // Development mode status notice
        setOauthNotice(
          response?.message || 'Google OAuth2 client integration point is configured. Backend client credentials required in production.'
        );
      }
    } catch (err) {
      setFormError(err?.message || 'Google authentication is currently unavailable. Please try standard sign in.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 animate-fadeIn">
      <div className="surface-card space-y-6">
        
        {/* Header */}
        <div className="space-y-1 text-center">
          <div className="inline-flex h-10 w-10 rounded-2xl bg-surface-elevated items-center justify-center text-primary font-bold text-lg mb-2 shadow-sm">
            X
          </div>
          <h1 className="text-xl font-bold text-content">Sign in to SwipeX</h1>
          <p className="text-xs text-content-muted">
            Find and apply to jobs tailored to your skills
          </p>
          <div className="pt-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0070ad]/15 text-[#0070ad] border border-[#0070ad]/30">
              Infosys Springboard Portal
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-300 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* Google OAuth Notice Banner */}
        {oauthNotice && (
          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-start gap-2.5 text-xs text-primary-onContainer animate-fadeIn">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
            <span>{oauthNotice}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="login-email"
            label="Email address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="you@example.com"
            error={fieldErrors.email}
            disabled={loading}
            autoComplete="email"
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Enter password"
            error={fieldErrors.password}
            disabled={loading}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="filled"
            size="lg"
            className="w-full mt-2"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant" />
            </div>
            <span className="relative px-3 bg-surface-container text-xs text-content-subtle">
              or
            </span>
          </div>

          {/* Google Sign-in */}
          <Button
            type="button"
            variant="outlined"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </span>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.8 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 10.5 0 12.4s.6 3.2 1.6 5.2l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.4-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </Button>
        </form>

        {/* Switch to Register */}
        <div className="text-center pt-2 border-t border-outline-variant text-xs text-content-muted">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-primary hover:underline font-medium ml-1"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
