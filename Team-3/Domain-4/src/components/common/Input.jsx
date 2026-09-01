import React from 'react';

export default function Input({
  label,
  icon: Icon,
  error,
  helperText,
  id,
  className = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-medium text-content-muted"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-subtle">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          className={`w-full bg-surface-elevated/70 border ${
            error ? 'border-red-400 focus:border-red-400' : 'border-outline/70 focus:border-primary'
          } rounded-2xl py-2.5 ${
            Icon ? 'pl-10' : 'pl-4'
          } pr-4 text-sm text-content placeholder:text-content-subtle transition-colors ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-content-subtle">{helperText}</p>
      ) : null}
    </div>
  );
}
