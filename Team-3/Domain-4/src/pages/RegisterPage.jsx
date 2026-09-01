import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, Building, ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import authService from '../services/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState('job_seeker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'job_seeker',
      title: 'Job Seeker',
      desc: 'Browse and swipe through jobs',
      icon: Briefcase,
    },
    {
      id: 'recruiter',
      title: 'Recruiter',
      desc: 'Post jobs and find candidates',
      icon: Building,
    },
    {
      id: 'admin',
      title: 'Admin',
      desc: 'Platform management',
      icon: ShieldCheck,
    },
  ];

  const validateForm = () => {
    const errors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      errors.name = 'Full name is required';
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!role) {
      errors.role = 'Please select a role';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'role') setRole(value);

    // Clear field-specific errors
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (formError) setFormError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions

    setFormError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: role,
      });

      setSuccessMessage('Account created successfully! Redirecting to sign in...');

      // Redirect to login after brief confirmation
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      const message = err?.message || 'Registration failed. Please try again or use a different email.';
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 animate-fadeIn">
      <div className="surface-card space-y-6">
        
        {/* Header */}
        <div className="space-y-1 text-center">
          <div className="inline-flex h-10 w-10 rounded-2xl bg-surface-elevated items-center justify-center text-primary font-bold text-lg mb-2 shadow-sm">
            X
          </div>
          <h1 className="text-xl font-bold text-content">Create a SwipeX account</h1>
          <p className="text-xs text-content-muted">
            Choose your account type to get started
          </p>
          {authService.isMockMode() && (
            <div className="pt-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                Dev Mock Mode Active
              </span>
            </div>
          )}
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-300 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* Success Confirmation Banner */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-2.5 text-xs text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-content-muted">
              Select your role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={loading}
                    onClick={() => handleInputChange('role', r.id)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-colors ${
                      isSelected
                        ? 'bg-surface-elevated border-primary text-content ring-1 ring-primary'
                        : 'bg-surface-container border-outline-variant text-content-muted hover:border-outline hover:text-content'
                    } ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-content-subtle'}`} />
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-outline'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-surface" />}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-content">{r.title}</div>
                      <div className="text-[11px] text-content-subtle mt-0.5">{r.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {fieldErrors.role && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.role}</p>
            )}
          </div>

          <Input
            id="register-name"
            label="Full name"
            type="text"
            icon={User}
            value={name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Alex Morgan"
            error={fieldErrors.name}
            disabled={loading}
            autoComplete="name"
          />

          <Input
            id="register-email"
            label="Email address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="alex@example.com"
            error={fieldErrors.email}
            disabled={loading}
            autoComplete="email"
          />

          <Input
            id="register-password"
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Create password (min. 6 characters)"
            error={fieldErrors.password}
            disabled={loading}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="filled"
            size="lg"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        {/* Switch to Login */}
        <div className="text-center pt-2 border-t border-outline-variant text-xs text-content-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary hover:underline font-medium ml-1"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
