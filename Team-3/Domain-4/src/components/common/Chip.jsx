import React from 'react';

export default function Chip({ 
  children, 
  variant = 'default',
  selected = false,
  onClick,
  className = '' 
}) {
  const isInteractive = Boolean(onClick);

  const variantStyles = {
    default: 'bg-surface-elevated text-content-muted border border-outline-variant',
    primary: 'bg-primary-container/60 text-primary-onContainer border border-primary/30',
    success: 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40',
  };

  const selectedStyles = selected 
    ? 'bg-primary text-surface font-semibold border-primary shadow-sm'
    : '';

  const interactiveStyles = isInteractive 
    ? 'cursor-pointer hover:bg-surface-high hover:text-content active:scale-[0.98]' 
    : '';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
        selected ? selectedStyles : variantStyles[variant]
      } ${interactiveStyles} ${className}`}
    >
      {children}
    </span>
  );
}
