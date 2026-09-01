import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, 
  variant = 'filled', 
  size = 'md', 
  icon: Icon,
  loading = false,
  disabled = false,
  className = '', 
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none';
  
  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5 min-h-[36px]',
    md: 'px-5 py-2.5 text-sm rounded-2xl gap-2 min-h-[44px]',
    lg: 'px-6 py-3.5 text-sm font-semibold rounded-2xl gap-2.5 min-h-[52px]',
  };

  const variantStyles = {
    filled: 'bg-primary text-surface font-semibold hover:bg-primary-hover shadow-sm',
    tonal: 'bg-surface-elevated text-content hover:bg-surface-high hover:text-white',
    outlined: 'border border-outline text-content hover:bg-surface-elevated hover:border-content-muted',
    text: 'text-content-muted hover:text-content hover:bg-surface-container',
  };

  const isDisabled = disabled || loading;

  return (
    <button 
      disabled={isDisabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className={`animate-spin ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
