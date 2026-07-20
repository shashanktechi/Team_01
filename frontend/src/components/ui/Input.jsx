import React from 'react';

export const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="font-bold text-sm text-ink mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full bg-surface border border-border rounded px-4 py-2 font-body text-ink transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-error' : 'hover:border-ink/40'
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="font-body text-sm text-error">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
