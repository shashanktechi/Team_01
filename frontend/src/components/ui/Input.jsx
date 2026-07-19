import React from 'react';

export const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="font-label-md text-label-md text-on-surface">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-error focus:border-error focus:ring-error/20' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="font-body-sm text-body-sm text-error">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
